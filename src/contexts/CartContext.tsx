import * as React from 'react';
import { Cart, CartItem, Product } from '@/types';

interface CartContextType {
  cart: Cart | null;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalAmount: () => number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = React.createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = React.useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = React.useState<Cart | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  // Load cart from localStorage on mount
  React.useEffect(() => {
    const savedCart = localStorage.getItem('shoppingCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } else {
      // Initialize empty cart
      const newCart: Cart = {
        id: 'cart-' + Date.now(),
        user_id: 'current-user', // This would come from auth context
        items: [],
        total_amount: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setCart(newCart);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  React.useEffect(() => {
    if (cart) {
      localStorage.setItem('shoppingCart', JSON.stringify(cart));
    }
  }, [cart]);

  const addItem = (product: Product, quantity: number = 1) => {
    if (!cart) return;

    const existingItemIndex = cart.items.findIndex(item => item.product_id === product.id);

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const updatedItems = [...cart.items];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + quantity
      };

      const updatedCart = {
        ...cart,
        items: updatedItems,
        total_amount: calculateTotal(updatedItems),
        updated_at: new Date().toISOString()
      };

      setCart(updatedCart);
    } else {
      // Add new item
      const newItem: CartItem = {
        product_id: product.id,
        product,
        quantity,
        price: product.price,
        added_at: new Date().toISOString()
      };

      const updatedCart = {
        ...cart,
        items: [...cart.items, newItem],
        total_amount: calculateTotal([...cart.items, newItem]),
        updated_at: new Date().toISOString()
      };

      setCart(updatedCart);
    }
  };

  const removeItem = (productId: string) => {
    if (!cart) return;

    const updatedItems = cart.items.filter(item => item.product_id !== productId);
    const updatedCart = {
      ...cart,
      items: updatedItems,
      total_amount: calculateTotal(updatedItems),
      updated_at: new Date().toISOString()
    };

    setCart(updatedCart);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (!cart || quantity <= 0) {
      removeItem(productId);
      return;
    }

    const updatedItems = cart.items.map(item =>
      item.product_id === productId
        ? { ...item, quantity }
        : item
    );

    const updatedCart = {
      ...cart,
      items: updatedItems,
      total_amount: calculateTotal(updatedItems),
      updated_at: new Date().toISOString()
    };

    setCart(updatedCart);
  };

  const clearCart = () => {
    if (!cart) return;

    const updatedCart = {
      ...cart,
      items: [],
      total_amount: 0,
      updated_at: new Date().toISOString()
    };

    setCart(updatedCart);
  };

  const getTotalItems = () => {
    return cart ? cart.items.reduce((total, item) => total + item.quantity, 0) : 0;
  };

  const getTotalAmount = () => {
    return cart ? cart.total_amount : 0;
  };

  const calculateTotal = (items: CartItem[]): number => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{
      cart,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalAmount,
      isOpen,
      setIsOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};