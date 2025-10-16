import * as React from 'react';
import { Order, CartItem } from '@/types';

interface OrderContextType {
  orders: Order[];
  createOrder: (cartItems: CartItem[], deliveryInfo: Record<string, unknown>, paymentInfo: Record<string, unknown>) => Promise<Order>;
  getOrder: (orderId: string) => Order | undefined;
  updateOrderStatus: (orderId: string, status: string, message?: string) => void;
  getUserOrders: (userId: string) => Order[];
  getSellerOrders: (sellerId: string) => Order[];
  isLoading: boolean;
}

const OrderContext = React.createContext<OrderContextType | undefined>(undefined);

export const useOrder = () => {
  const context = React.useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  // Load orders from localStorage on mount
  React.useEffect(() => {
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  // Save orders to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  const generateOrderId = () => {
    return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const generateTrackingNumber = () => {
    return 'TRK' + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const createOrder = async (
    cartItems: CartItem[],
    deliveryInfo: Record<string, unknown>,
    paymentInfo: Record<string, unknown>
  ): Promise<Order> => {
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const deliveryFee = deliveryInfo.deliveryMethod === 'delivery' ? 1000 : 0;
    const totalAmount = subtotal + deliveryFee;

    const newOrder: Order = {
      id: generateOrderId(),
      products: cartItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        product_name: item.product.name,
        product_image: item.product.image
      })),
      buyer_id: 'current-user', // This would come from auth context
      buyer_info: {
        name: deliveryInfo.fullName,
        phone: deliveryInfo.phone,
        address: deliveryInfo.address,
        city: deliveryInfo.city
      },
      seller_id: cartItems[0]?.product.producer || 'default-seller',
      seller_info: {
        name: cartItems[0]?.product.producer || 'Producteur',
        phone: '+225 XX XX XX XX',
        location: cartItems[0]?.product.location || 'Côte d\'Ivoire'
      },
      total_amount: totalAmount,
      delivery_fee: deliveryFee,
      status: 'pending',
      order_date: new Date().toISOString(),
      estimated_delivery: calculateEstimatedDelivery(),
      payment_status: 'paid',
      payment_method: {
        type: paymentInfo.paymentMethod,
        provider: paymentInfo.mobileProvider,
        last4: paymentInfo.cardNumber?.slice(-4)
      },
      delivery_method: deliveryInfo.deliveryMethod,
      delivery_instructions: deliveryInfo.deliveryInstructions,
      tracking_number: generateTrackingNumber(),
      updates: [
        {
          status: 'pending',
          message: 'Commande reçue et en attente de confirmation',
          timestamp: new Date().toISOString(),
          location: 'Système'
        }
      ]
    };

    setOrders(prev => [newOrder, ...prev]);
    setIsLoading(false);

    return newOrder;
  };

  const calculateEstimatedDelivery = () => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 2); // 2 days delivery
    return deliveryDate.toISOString();
  };

  const getOrder = (orderId: string) => {
    return orders.find(order => order.id === orderId);
  };

  const updateOrderStatus = (orderId: string, status: string, message?: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const updatedOrder = {
          ...order,
          status: status as Order['status'],
          updates: [
            ...order.updates,
            {
              status,
              message: message || getStatusMessage(status),
              timestamp: new Date().toISOString(),
              location: getStatusLocation(status)
            }
          ]
        };

        // Update actual delivery date if delivered
        if (status === 'delivered') {
          updatedOrder.actual_delivery = new Date().toISOString();
        }

        return updatedOrder;
      }
      return order;
    }));
  };

  const getStatusMessage = (status: string) => {
    const messages = {
      pending: 'Commande reçue et en attente de confirmation',
      confirmed: 'Commande confirmée par le vendeur',
      preparing: 'Commande en cours de préparation',
      shipped: 'Commande expédiée',
      delivered: 'Commande livrée avec succès',
      cancelled: 'Commande annulée'
    };
    return messages[status as keyof typeof messages] || 'Statut mis à jour';
  };

  const getStatusLocation = (status: string) => {
    const locations = {
      pending: 'Système',
      confirmed: 'Vendeur',
      preparing: 'Entrepôt',
      shipped: 'En transit',
      delivered: 'Destination',
      cancelled: 'Système'
    };
    return locations[status as keyof typeof locations] || 'Inconnu';
  };

  const getUserOrders = (userId: string) => {
    return orders.filter(order => order.buyer_id === userId)
      .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());
  };

  const getSellerOrders = (sellerId: string) => {
    return orders.filter(order => order.seller_id === sellerId)
      .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());
  };

  return (
    <OrderContext.Provider value={{
      orders,
      createOrder,
      getOrder,
      updateOrderStatus,
      getUserOrders,
      getSellerOrders,
      isLoading
    }}>
      {children}
    </OrderContext.Provider>
  );
};