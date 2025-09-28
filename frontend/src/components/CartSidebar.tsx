"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import '../styles/CartSidebar.css';

type CartItem = {
  stockId: number;
  name: string;
  quantity: number;
  price: number;
};

type Props = {
  onClose: () => void;
  show?: boolean; 
};

export default function CartSidebar({ onClose, show = false }: Props) {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([
    { stockId: 1, name: "Apple Inc.", quantity: 1, price: 150 },
    { stockId: 2, name: "Microsoft Corp.", quantity: 2, price: 280 },
    { stockId: 3, name: "Google LLC", quantity: 1, price: 2700 },
  ]);

  const incrementQuantity = (stockId: number) => {
    setCart(prev =>
      prev.map(item =>
        item.stockId === stockId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decrementQuantity = (stockId: number) => {
    setCart(prev =>
      prev
        .map(item =>
          item.stockId === stockId && item.quantity > 1
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  const removeItem = (stockId: number) => {
    setCart(prev => prev.filter(item => item.stockId !== stockId));
  };

  const total = cart.reduce((acc, p) => acc + p.price * p.quantity, 0);

  const handleFinishPurchase = () => {
    router.push("/purchase-sale");
  };

  return (
    <div className={`cartSidebar ${show ? 'show' : ''}`}>
      <button className="cartCloseBtn" onClick={onClose}>×</button>

      <h2 className="cartHeader">Shopping Cart</h2>

      <div className="cartList">
        {cart.length === 0 ? (
          <p className="cartEmpty">Your cart is empty</p>
        ) : (
          cart.map(item => (
            <div key={item.stockId} className="cartItem">
              <div>
                <p>{item.name}</p>
                <div className="cartItemButtons">
                  <button className="cartBtn" onClick={() => decrementQuantity(item.stockId)}>-</button>
                  <span>Qty: {item.quantity}</span>
                  <button className="cartBtn" onClick={() => incrementQuantity(item.stockId)}>+</button>
                  <button className="cartBtnRemove" onClick={() => removeItem(item.stockId)}>Remove</button>
                </div>
              </div>
              <p>${item.price * item.quantity}</p>
            </div>
          ))
        )}
      </div>

      <div className="cartTotal">Total: ${total}</div>
      <button
        className="cartFinishBtn"
        onClick={handleFinishPurchase}
        disabled={cart.length === 0}
      >
        Finish Purchase
      </button>
    </div>
  );
}
