interface Nutrients {
  calories: number;
  fat: number;
  saturated_fat: number;
  carbohydrates: number;
  sugars: number;
  protein: number;
  fiber: number;
  salt: number;
  sodium: number;
}

interface RatingBreakdown {
  energy_points: number;
  sugar_points: number;
  satfat_points: number;
  sodium_points: number;
  fiber_points: number;
  protein_points: number;
}

interface Rating {
  score: number;
  breakdown: RatingBreakdown;
}

export interface Product {
  barcode: string;
  name: string;
  ingredients: string[];
  nutrients: Nutrients;
  rating: Rating;
  serving_quantity: number;
  serving_size: string;
  additives_n: number;
}
