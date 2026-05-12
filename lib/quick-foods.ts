// Hand-curated list of common foods with macros per 100g.
// Used by the Quick-add tab on /console/log so users can pick from a list
// instead of typing macros from memory. Numbers sourced from USDA FoodData
// Central averages.

export interface QuickFood {
  name: string;
  category: "protein" | "carb" | "fat" | "veg" | "fruit" | "dairy" | "drink" | "snack";
  kcalPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  defaultServingG: number;
  servingLabel?: string;
}

export const QUICK_FOODS: QuickFood[] = [
  // Proteins
  { name: "Chicken breast (cooked)", category: "protein", kcalPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6, defaultServingG: 150 },
  { name: "Salmon fillet (cooked)", category: "protein", kcalPer100g: 208, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 13, defaultServingG: 140 },
  { name: "Tuna (canned in water)", category: "protein", kcalPer100g: 116, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 1, defaultServingG: 85, servingLabel: "1 can drained" },
  { name: "Ground beef 80/20 (cooked)", category: "protein", kcalPer100g: 254, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 17, defaultServingG: 113 },
  { name: "Eggs (whole)", category: "protein", kcalPer100g: 155, proteinPer100g: 13, carbsPer100g: 1.1, fatPer100g: 11, defaultServingG: 50, servingLabel: "1 large" },
  { name: "Tofu (firm)", category: "protein", kcalPer100g: 144, proteinPer100g: 17, carbsPer100g: 2.8, fatPer100g: 9, defaultServingG: 100 },
  { name: "Greek yogurt (non-fat)", category: "dairy", kcalPer100g: 59, proteinPer100g: 10, carbsPer100g: 3.6, fatPer100g: 0.4, defaultServingG: 170, servingLabel: "1 cup" },
  { name: "Cottage cheese (low-fat)", category: "dairy", kcalPer100g: 84, proteinPer100g: 11, carbsPer100g: 4.3, fatPer100g: 2.3, defaultServingG: 113 },
  { name: "Whey protein powder", category: "protein", kcalPer100g: 380, proteinPer100g: 76, carbsPer100g: 10, fatPer100g: 4, defaultServingG: 30, servingLabel: "1 scoop" },
  { name: "Shrimp (cooked)", category: "protein", kcalPer100g: 99, proteinPer100g: 24, carbsPer100g: 0.2, fatPer100g: 0.3, defaultServingG: 120 },

  // Carbs
  { name: "White rice (cooked)", category: "carb", kcalPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28, fatPer100g: 0.3, defaultServingG: 195, servingLabel: "1 cup" },
  { name: "Brown rice (cooked)", category: "carb", kcalPer100g: 123, proteinPer100g: 2.7, carbsPer100g: 26, fatPer100g: 1, defaultServingG: 195, servingLabel: "1 cup" },
  { name: "Quinoa (cooked)", category: "carb", kcalPer100g: 120, proteinPer100g: 4.4, carbsPer100g: 21, fatPer100g: 1.9, defaultServingG: 185, servingLabel: "1 cup" },
  { name: "Oats (cooked)", category: "carb", kcalPer100g: 71, proteinPer100g: 2.5, carbsPer100g: 12, fatPer100g: 1.5, defaultServingG: 240, servingLabel: "1 cup" },
  { name: "Sweet potato (baked)", category: "carb", kcalPer100g: 90, proteinPer100g: 2, carbsPer100g: 21, fatPer100g: 0.1, defaultServingG: 200, servingLabel: "1 medium" },
  { name: "Whole-grain bread", category: "carb", kcalPer100g: 247, proteinPer100g: 13, carbsPer100g: 41, fatPer100g: 3.4, defaultServingG: 28, servingLabel: "1 slice" },
  { name: "Sourdough bread", category: "carb", kcalPer100g: 289, proteinPer100g: 12, carbsPer100g: 56, fatPer100g: 1.8, defaultServingG: 36, servingLabel: "1 slice" },
  { name: "Pasta (cooked)", category: "carb", kcalPer100g: 158, proteinPer100g: 5.8, carbsPer100g: 31, fatPer100g: 0.9, defaultServingG: 200, servingLabel: "1 cup" },
  { name: "Potato (baked)", category: "carb", kcalPer100g: 93, proteinPer100g: 2.5, carbsPer100g: 21, fatPer100g: 0.1, defaultServingG: 173, servingLabel: "1 medium" },
  { name: "Tortilla (flour, 8-inch)", category: "carb", kcalPer100g: 304, proteinPer100g: 8, carbsPer100g: 50, fatPer100g: 7, defaultServingG: 49, servingLabel: "1 tortilla" },

  // Fats
  { name: "Avocado", category: "fat", kcalPer100g: 160, proteinPer100g: 2, carbsPer100g: 9, fatPer100g: 15, defaultServingG: 100, servingLabel: "1/2 medium" },
  { name: "Almonds", category: "fat", kcalPer100g: 579, proteinPer100g: 21, carbsPer100g: 22, fatPer100g: 50, defaultServingG: 28, servingLabel: "1 oz (~23)" },
  { name: "Peanut butter", category: "fat", kcalPer100g: 588, proteinPer100g: 25, carbsPer100g: 20, fatPer100g: 50, defaultServingG: 32, servingLabel: "2 tbsp" },
  { name: "Olive oil", category: "fat", kcalPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, defaultServingG: 14, servingLabel: "1 tbsp" },
  { name: "Butter", category: "fat", kcalPer100g: 717, proteinPer100g: 0.9, carbsPer100g: 0.1, fatPer100g: 81, defaultServingG: 14, servingLabel: "1 tbsp" },
  { name: "Cheddar cheese", category: "dairy", kcalPer100g: 404, proteinPer100g: 23, carbsPer100g: 3.4, fatPer100g: 33, defaultServingG: 28, servingLabel: "1 oz" },

  // Vegetables
  { name: "Broccoli (cooked)", category: "veg", kcalPer100g: 35, proteinPer100g: 2.4, carbsPer100g: 7, fatPer100g: 0.4, defaultServingG: 156, servingLabel: "1 cup" },
  { name: "Spinach (raw)", category: "veg", kcalPer100g: 23, proteinPer100g: 2.9, carbsPer100g: 3.6, fatPer100g: 0.4, defaultServingG: 30, servingLabel: "1 cup" },
  { name: "Asparagus (cooked)", category: "veg", kcalPer100g: 22, proteinPer100g: 2.4, carbsPer100g: 4.1, fatPer100g: 0.2, defaultServingG: 90 },
  { name: "Carrots (raw)", category: "veg", kcalPer100g: 41, proteinPer100g: 0.9, carbsPer100g: 10, fatPer100g: 0.2, defaultServingG: 128, servingLabel: "1 cup" },
  { name: "Bell pepper (raw)", category: "veg", kcalPer100g: 31, proteinPer100g: 1, carbsPer100g: 6, fatPer100g: 0.3, defaultServingG: 149 },

  // Fruits
  { name: "Banana", category: "fruit", kcalPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 23, fatPer100g: 0.3, defaultServingG: 118, servingLabel: "1 medium" },
  { name: "Apple", category: "fruit", kcalPer100g: 52, proteinPer100g: 0.3, carbsPer100g: 14, fatPer100g: 0.2, defaultServingG: 182, servingLabel: "1 medium" },
  { name: "Blueberries", category: "fruit", kcalPer100g: 57, proteinPer100g: 0.7, carbsPer100g: 14, fatPer100g: 0.3, defaultServingG: 148, servingLabel: "1 cup" },
  { name: "Strawberries", category: "fruit", kcalPer100g: 32, proteinPer100g: 0.7, carbsPer100g: 7.7, fatPer100g: 0.3, defaultServingG: 152, servingLabel: "1 cup" },
  { name: "Orange", category: "fruit", kcalPer100g: 47, proteinPer100g: 0.9, carbsPer100g: 12, fatPer100g: 0.1, defaultServingG: 131, servingLabel: "1 medium" },

  // Drinks
  { name: "Whole milk", category: "drink", kcalPer100g: 61, proteinPer100g: 3.2, carbsPer100g: 4.8, fatPer100g: 3.3, defaultServingG: 244, servingLabel: "1 cup" },
  { name: "Almond milk (unsweetened)", category: "drink", kcalPer100g: 17, proteinPer100g: 0.5, carbsPer100g: 0.3, fatPer100g: 1.5, defaultServingG: 240, servingLabel: "1 cup" },
  { name: "Espresso", category: "drink", kcalPer100g: 9, proteinPer100g: 0.1, carbsPer100g: 1.5, fatPer100g: 0.2, defaultServingG: 30, servingLabel: "1 shot" },
  { name: "Black coffee", category: "drink", kcalPer100g: 1, proteinPer100g: 0.1, carbsPer100g: 0, fatPer100g: 0, defaultServingG: 240, servingLabel: "1 cup" },
  { name: "Orange juice", category: "drink", kcalPer100g: 45, proteinPer100g: 0.7, carbsPer100g: 10, fatPer100g: 0.2, defaultServingG: 240, servingLabel: "1 cup" },

  // Snacks
  { name: "Dark chocolate (70%)", category: "snack", kcalPer100g: 598, proteinPer100g: 7.8, carbsPer100g: 46, fatPer100g: 43, defaultServingG: 28, servingLabel: "1 oz" },
  { name: "Hummus", category: "snack", kcalPer100g: 166, proteinPer100g: 7.9, carbsPer100g: 14, fatPer100g: 9.6, defaultServingG: 60, servingLabel: "2 tbsp" },
  { name: "Granola bar", category: "snack", kcalPer100g: 471, proteinPer100g: 10, carbsPer100g: 64, fatPer100g: 20, defaultServingG: 40, servingLabel: "1 bar" },
  { name: "Protein bar (avg)", category: "snack", kcalPer100g: 380, proteinPer100g: 30, carbsPer100g: 35, fatPer100g: 10, defaultServingG: 60, servingLabel: "1 bar" },
];

export function searchQuickFoods(query: string, limit = 8): QuickFood[] {
  if (!query.trim()) return QUICK_FOODS.slice(0, limit);
  const q = query.toLowerCase();
  const exact = QUICK_FOODS.filter((f) => f.name.toLowerCase().startsWith(q));
  const partial = QUICK_FOODS.filter(
    (f) => !f.name.toLowerCase().startsWith(q) && f.name.toLowerCase().includes(q),
  );
  return [...exact, ...partial].slice(0, limit);
}

export function macrosForServing(food: QuickFood, grams: number) {
  const ratio = grams / 100;
  return {
    kcal: Math.round(food.kcalPer100g * ratio),
    protein: Math.round(food.proteinPer100g * ratio * 10) / 10,
    carbs: Math.round(food.carbsPer100g * ratio * 10) / 10,
    fat: Math.round(food.fatPer100g * ratio * 10) / 10,
  };
}
