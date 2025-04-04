"use client"; // Enables client-side rendering

import { useState, useEffect, useRef } from "react";
import "./style.css";

// Define the structure of a Product
interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  lemons: number;
}

// Fetches the list of products from the server
const fetchProducts = async (): Promise<Product[]> => {
  const response = await fetch("/api/products"); 
  const data = await response.json();

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return data;
};

export default function Home() {
  // State for storing products fetched from API
  const [products, setProducts] = useState<Product[]>([]);
  // State for storing items added to the cart
  const [cart, setCart] = useState<Product[]>([]);
  // State for tracking lemons used by products in the cart
  const [lemonsUsed, setLemonsUsed] = useState<number>(0);
  // State for tracking profit made
  const [profit, setProfit] = useState<number>(100); 
  // State for toggling visibility of the cart
  const [cartVisible, setCartVisible] = useState<boolean>(false); 
  // Reference to the cart DOM element
  const cartRef = useRef<HTMLDivElement>(null);
  // State for tracking the number of lemons in stock
  const [lemonsStock, setLemonsStock] = useState<number>(20); 

  // Fetch products once when the component mounts
  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  // Close cart if user clicks outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setCartVisible(false);
      }
    };

    if (cartVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [cartVisible]);

  // Add a product to the cart and update lemons used
  const addToCart = (product: Product) => {
    setCart([...cart, product]);
    setLemonsUsed(lemonsUsed + product.lemons);
  };

  // Remove a product from the cart and update lemons used
  const removeFromCart = (index: number) => {
    const removedProduct = cart[index];
    setCart(cart.filter((_, i) => i !== index));
    setLemonsUsed(lemonsUsed - removedProduct.lemons);
  };

  // Handle purchase: calculate total, reset cart and lemons used
  const handlePurchase = () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    const totalCost = cart.reduce((sum, product) => sum + product.price, 0);
    setProfit(profit + totalCost); 
    setCart([]);  
    setLemonsUsed(0);  
    alert("🍋🍋 Purchase complete! 🍋🍋");
  };

  // Buy one lemon if the user has enough profit
  const buyLemons = () => {
    if (profit >= 5) {
      setLemonsStock(lemonsStock + 1);
      setProfit(profit - 5); 
    } else {
      alert("Not enough money to buy lemons!");
    }
  };

  // Sell one lemon if there are any in stock
  const sellLemons = () => {
    if (lemonsStock > 0) {
      setLemonsStock(lemonsStock - 1);
      setProfit(profit + 3); 
    } else {
      alert("No lemons left to sell!");
    }
  };

  return (
    <div>
      {/* Header section showing title, profit, lemon stock, and buttons */}
      <header>
        <h1>🍋 Lemonade Stand 🍋</h1>
        <div className="profitSection">
          <h2>Total Profit: ${profit.toFixed(2)}</h2>
          <h3>Lemons in Stock: {lemonsStock}</h3>
          <button onClick={buyLemons} className="button">Buy Lemons (-$5)</button>
          <button onClick={sellLemons} className="button">Sell Lemons (+$3)</button>
        </div>
        <button onClick={() => setCartVisible(!cartVisible)} className="cartButton">
          Cart ({cart.length})
        </button>
      </header>

      {/* Cart overlay with cart contents and purchase button */}
      {cartVisible && (
        <div className="cartOverlay">
          <div className="cartWindow" ref={cartRef}>
            <button className="closeButton" onClick={() => setCartVisible(false)}>×</button>
            <h2>Your Cart</h2>
            {cart.length === 0 ? (
              <p>No items in cart.</p>
            ) : (
              <ul>
                {cart.map((item, index) => (
                  <li key={index}>
                    {item.name} - ${item.price.toFixed(2)} (Lemons: {item.lemons})
                    <button onClick={() => removeFromCart(index)} className="button3">Remove</button>
                  </li>
                ))}
              </ul>
            )}
            <p>Total Lemons Used: {lemonsUsed}</p>
            <p className="payout">Total: ${cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</p>
            <button onClick={handlePurchase} className="button2">Buy Now</button>
          </div>
        </div>
      )}

      {/* Display all available products */}
      <h1 className="productsTitle">Our Products:</h1>
      <div className="productLayout">
        {products.map((product) => (
          <div key={product.id} className="productCard">
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p>${product.price.toFixed(2)}</p>
            <p>Lemons used: {product.lemons}</p>
            <button onClick={() => addToCart(product)} className="button">Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
}
