from contextlib import asynccontextmanager
from typing import Annotated

from backend.scoring import calculate_score_of_food
from fastapi import Depends, FastAPI, HTTPException, Query
import httpx
from sqlmodel import JSON, Column, Field, Session, SQLModel, create_engine, select

sqlite_file_name = "scanned_products.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"
engine = create_engine(sqlite_url)

class Product(SQLModel, table=True):
    barcode: str = Field(primary_key=True)
    name: str = Field(index=True)
    ingredients: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    nutrients: dict = Field(default_factory=dict, sa_column=Column(JSON))
    rating: dict = Field(default_factory=dict, sa_column=Column(JSON))
    serving_size: str = Field(default="unknown")
    serving_quantity: int = Field(default=100)
    additives_n: int = Field(default=0)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)   

def get_session():
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]     

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)

# routes

@app.get("/")
def read_root():
    return {"message": "Hello World"}

@app.post("/products/")
def add_product(product: Product, session: SessionDep):
    existing_product = session.get(Product, product.barcode)
    if existing_product:
        raise HTTPException(status_code=400, detail="Barcode already exists")
    session.add(product)
    session.commit()
    session.refresh(product)
    return product

@app.get("/products/{barcode}")
async def scan_barcode(barcode: str, session: SessionDep) -> Product:
    barcode = normalize_barcode(barcode)
    product = session.get(Product, barcode)
    if not product:
        product = await scan_barcode_from_api(barcode)
        session.add(product)
        session.commit()
        session.refresh(product)
    return product

@app.get("/products/")
def read_products(
    session: SessionDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
) -> list[Product]:
    products = session.exec(select(Product).offset(offset).limit(limit)).all()
    return products

@app.delete("/products/{barcode}") # delete a product from the local db
def delete_product(barcode: str, session: SessionDep):
    product = session.get(Product, barcode)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    session.delete(product)
    session.commit()
    return {"ok": True}

def parse_off_product(raw_json: dict) -> Product:
    product_data = raw_json["product"]
    
    raw_nutrients = product_data.get("nutriments", {})
    nutrients = {
        "calories": raw_nutrients.get("energy-kcal_100g", 0),
        "fat": raw_nutrients.get("fat_100g", 0),
        "saturated_fat": raw_nutrients.get("saturated-fat_100g", 0),
        "carbohydrates": raw_nutrients.get("carbohydrates_100g", 0),
        "sugars": raw_nutrients.get("sugars_100g", 0),
        "protein": raw_nutrients.get("proteins_100g", 0),
        "fiber": raw_nutrients.get("fiber_100g", 0),
        "salt": raw_nutrients.get("salt_100g", 0),
        "sodium": raw_nutrients.get("sodium_100g", 0),
    }

    ingredients_text = product_data.get("ingredients_text", "")
    ingredients = [item.strip() for item in ingredients_text.split(",") if item.strip()]

    product_type = product_data.get("product_type", "unknown")
    serving_size = product_data.get("serving_size", "unknown")
    serving_quantity = product_data.get("serving_quantity", 100)
    additives_n = product_data.get("additives_n", 0)

    if product_type != "food":
        raise HTTPException(status_code=404, detail="Product is not a food")

    rating = calculate_score_of_food(nutrients)

    return Product(
        barcode=raw_json["code"],
        name=product_data.get("product_name", "Unknown"),
        ingredients=ingredients,
        nutrients=nutrients,
        rating=rating,
        serving_size=serving_size,
        serving_quantity=serving_quantity,
        additives_n=additives_n
    )

async def scan_barcode_from_api(barcode: str) -> Product:
    url = f"https://world.openfoodfacts.net/api/v2/product/{barcode}?fields=product_name,ingredients_text,nutriments,product_type,serving_size,serving_quantity,additives_n"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, timeout=5.0)

        try:
            response.raise_for_status()
        except httpx.HTTPStatusError:
            data = response.json()
            status_verbose = data.get("status_verbose", "")
            if "different product type" in status_verbose:
                raise HTTPException(status_code=404, detail="Product is not a food")
            raise HTTPException(status_code=404, detail="Product not found in database")

        data = response.json()

        if data.get("status") == 0:
            raise HTTPException(status_code=404, detail="Product not found in database")

        product = parse_off_product(data)
        return product

def normalize_barcode(barcode: str) -> str:
    return barcode.zfill(13)