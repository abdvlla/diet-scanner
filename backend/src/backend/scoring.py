# in this file is the logic to calculate the score of a food out of 100. Subject to change / add 

def calculate_score_of_food(nutrients: dict) -> dict:

    calories = nutrients.get("calories", 0)
    sugars = nutrients.get("sugars", 0)
    satfat = nutrients.get("saturated_fat", 0)
    sodium = nutrients.get("sodium", 0) * 1000
    fiber = nutrients.get("fiber", 0)
    protein = nutrients.get("protein", 0)

    energy_points = energy_band(calories)
    sugar_points = sugar_band(sugars)
    satfat_points = satfat_band(satfat)
    sodium_points = sodium_band(sodium)
    
    fiber_points = fiber_band(fiber)
    protein_points = protein_band(protein)
    
    negative_total = energy_points + sugar_points + satfat_points + sodium_points
    positive_total = fiber_points + protein_points
    raw_score = negative_total - positive_total
    final_score = 100 - ((raw_score - (-10)) / (40 - (-10))) * 100
    final_score = max(0, min(100, final_score)) 

    return {
        "score": final_score,
        "breakdown": {
            "energy_points": energy_points,
            "sugar_points": sugar_points,
            "satfat_points": satfat_points,
            "sodium_points": sodium_points,
            "fiber_points": fiber_points,
            "protein_points": protein_points,
        }
    }

def energy_band(kcal: float) -> int:
    if kcal < 80:
        return 0
    elif kcal < 160:
        return 1
    elif kcal < 240:
        return 2
    elif kcal < 320:
        return 3
    elif kcal < 400:
        return 4
    elif kcal < 480:
        return 5
    elif kcal < 560:
        return 6
    elif kcal < 640:
        return 7
    elif kcal < 720:
        return 8
    elif kcal < 800:
        return 9
    else:
        return 10

def sugar_band(sugar: float) -> int:
    if sugar < 4.5:
        return 0
    elif sugar < 9:
        return 1
    elif sugar < 13.5:
        return 2
    elif sugar < 18:
        return 3
    elif sugar < 22.5:
        return 4
    elif sugar < 27:
        return 5
    elif sugar < 31.5:
        return 6
    elif sugar < 36:
        return 7
    elif sugar < 40.5:
        return 8
    elif sugar < 45:
        return 9
    else:
        return 10

def satfat_band(satfat: float) -> int:
    if satfat < 1:
        return 0
    elif satfat < 2:
        return 1
    elif satfat < 3:
        return 2
    elif satfat < 4:
        return 3
    elif satfat < 5:
        return 4
    elif satfat < 6:
        return 5
    elif satfat < 7:
        return 6
    elif satfat < 8:
        return 7
    elif satfat < 9:
        return 8
    elif satfat < 10:
        return 9
    else:
        return 10

def sodium_band(sodium: float) -> int:
    if sodium < 90:
        return 0
    elif sodium < 180:
        return 1
    elif sodium < 270:
        return 2
    elif sodium < 360:
        return 3
    elif sodium < 450:
        return 4
    elif sodium < 540:
        return 5
    elif sodium < 630:
        return 6
    elif sodium < 720:
        return 7
    elif sodium < 810:
        return 8
    elif sodium < 900:
        return 9
    else:
        return 10

def additives_band(additives: int) -> int:
    if additives == 0:
        return 0
    elif additives == 1:
        return 1
    elif additives == 2:
        return 2
    elif additives == 3:
        return 3
    elif additives == 4:
        return 4
    else:
        return 5    

def fiber_band(fiber: float) -> int:
    if fiber < 0.9:
        return 0
    elif fiber < 1.9:
        return 1
    elif fiber < 2.8:
        return 2
    elif fiber < 3.7:
        return 3
    elif fiber < 4.7:
        return 4
    else:
        return 5

def protein_band(protein: float) -> int:
    if protein < 1.6:
        return 0
    elif protein < 3.2:
        return 1
    elif protein < 4.8:
        return 2
    elif protein < 6.4:
        return 3
    elif protein < 8:
        return 4
    else:
        return 5