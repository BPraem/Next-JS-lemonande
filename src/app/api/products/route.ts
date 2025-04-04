import { NextResponse } from "next/server";

// This function handles GET requests to your API route
export async function GET() {
  try {
    // Fetch drinks that include lemon as an ingredient from TheCocktailDB API
    const response = await fetch("https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=lemon");
    
    // If the response is not OK (e.g. 404 or 500), return an error response
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }

    // Parse the JSON response body
    const data = await response.json();

    // Map the fetched drinks into a product format with random prices and lemon usage
    const products = data.drinks.map((drink: any, index: number) => ({
      id: index, // Unique ID for each product based on array index
      name: drink.strDrink, // Name of the drink
      price: Math.random() * (5 - 2) + 2, // Random price between $2 and $5
      image: drink.strDrinkThumb || "/default-lemonade.jpg", // Use drink image or a fallback
      lemons: Math.floor(Math.random() * 5) + 1, // Random number of lemons between 1 and 5
    }));

    // Return the array of product objects as JSON
    return NextResponse.json(products);
  } catch (error) {
    // If anything goes wrong (e.g. network error), return an error response
    return NextResponse.json({ error: "Error fetching products" }, { status: 500 });
  }
}
