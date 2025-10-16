import { useState, useEffect } from 'react';

interface OrderItem {
  id: string;
  product: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  category: string;
  supplier?: string;
  deliveryDate?: string;
  deliveryLocation?: string;
  specifications?: string[];
}

interface GroupOrder {
  id: string;
  name: string;
  description?: string;
  type: 'purchase' | 'collecte' | 'service';
  status: 'draft' | 'active' | 'completed' | 'cancelled' | 'pending';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  organizer: string;
  organizerContact: string;
  targetParticipants: number;
  currentParticipants: number;
  minimumParticipants?: number;
  deadline: string;
  estimatedDelivery?: string;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  paymentTerms: string;
  notes?: string;
  terms?: string;
  participants: Array<{
    id: string;
    name: string;
    contact: string;
    joinDate: string;
    status: 'confirmed' | 'pending' | 'cancelled';
    quantity?: number;
    amount?: number;
  }>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface UseOrdersReturn {
  orders: GroupOrder[];
  loading: boolean;
  error: string | null;
  
  // CRUD Operations
  createOrder: (order: Omit<GroupOrder, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateOrder: (id: string, order: Partial<GroupOrder>) => void;
  deleteOrder: (id: string) => void;
  
  // Utility Functions
  searchOrders: (query: string) => GroupOrder[];
  filterOrdersByStatus: (status: string) => GroupOrder[];
  filterOrdersByType: (type: string) => GroupOrder[];
  getOrdersByOrganizer: (organizer: string) => GroupOrder[];
  
  // Stats
  getStats: () => {
    totalOrders: number;
    activeOrders: number;
    completedOrders: number;
    pendingOrders: number;
    totalParticipants: number;
    totalAmount: number;
    averageOrderValue: number;
    completionRate: number;
  };
  
  // Export
  exportOrders: () => string;
  
  // Refresh
  refresh: () => void;
}

const mockOrders: GroupOrder[] = [
  {
    id: "GRP-001",
    name: "Commande groupée d'engrais bio",
    description: "Engrais organiques certifiés pour la campagne cacao 2024",
    type: "purchase",
    status: "active",
    priority: "high",
    organizer: "Koné Ibrahim",
    organizerContact: "+225 07 08 09 10",
    targetParticipants: 15,
    currentParticipants: 12,
    minimumParticipants: 10,
    deadline: "2024-03-25",
    estimatedDelivery: "2024-04-05",
    items: [
      {
        id: "ITM-001",
        product: "Engrais NPK 15-15-15",
        description: "Engrais équilibré certifié bio",
        quantity: 500,
        unit: "kg",
        unitPrice: 800,
        totalPrice: 400000,
        category: "Engrais",
        supplier: "AgroSupply CI",
        specifications: ["Certifié BIO", "NPK 15-15-15", "Sac de 50kg"]
      }
    ],
    totalAmount: 400000,
    currency: "FCFA",
    paymentTerms: "50% à la commande, 50% à la livraison",
    notes: "Livraison prévue au dépôt central",
    terms: "Minimum 10 participants pour valider la commande",
    participants: [
      {
        id: "P-001",
        name: "Kouadio Amani",
        contact: "+225 01 02 03 04",
        joinDate: "2024-03-10",
        status: "confirmed",
        quantity: 50,
        amount: 40000
      }
    ],
    createdAt: "2024-03-01T10:00:00Z",
    updatedAt: "2024-03-20T15:30:00Z",
    createdBy: "admin"
  },
  {
    id: "GRP-002",
    name: "Semences de cacao améliorées",
    description: "Semences hybrides résistantes à la maladie du swollen shoot",
    type: "purchase",
    status: "completed",
    priority: "medium",
    organizer: "Fatou Traoré",
    organizerContact: "+225 05 06 07 08",
    targetParticipants: 10,
    currentParticipants: 8,
    minimumParticipants: 8,
    deadline: "2024-03-30",
    estimatedDelivery: "2024-04-15",
    items: [
      {
        id: "ITM-002",
        product: "Semences de cacao CATAM",
        description: "Variété résistante au CSSV",
        quantity: 200,
        unit: "kg",
        unitPrice: 1200,
        totalPrice: 240000,
        category: "Semences",
        supplier: "SEMA-CI",
        specifications: ["Certifié CSSV", "Rendement élevé", "Germination > 90%"]
      }
    ],
    totalAmount: 240000,
    currency: "FCFA",
    paymentTerms: "Paiement à la livraison",
    participants: [
      {
        id: "P-002",
        name: "Yao N'Guessan",
        contact: "+225 09 10 11 12",
        joinDate: "2024-03-05",
        status: "confirmed",
        quantity: 30,
        amount: 36000
      }
    ],
    createdAt: "2024-02-28T14:00:00Z",
    updatedAt: "2024-03-25T11:20:00Z",
    createdBy: "admin"
  },
  {
    id: "GRP-003",
    name: "Outils agricoles et équipements",
    description: "Matériel de plantation et entretien pour les petits exploitants",
    type: "purchase",
    status: "pending",
    priority: "low",
    organizer: "Amani Koffi",
    organizerContact: "+225 11 12 13 14",
    targetParticipants: 20,
    currentParticipants: 5,
    minimumParticipants: 15,
    deadline: "2024-04-10",
    estimatedDelivery: "2024-04-25",
    items: [
      {
        id: "ITM-003",
        product: "Machettes professionnelles",
        description: "Machettes de haute qualité",
        quantity: 25,
        unit: "unités",
        unitPrice: 15000,
        totalPrice: 375000,
        category: "Outils",
        supplier: "AgroTools CI",
        specifications: ["Acier trempé", "Manche en bois d'iroko", "Garantie 2 ans"]
      }
    ],
    totalAmount: 375000,
    currency: "FCFA",
    paymentTerms: "Paiement comptant",
    participants: [],
    createdAt: "2024-03-15T09:00:00Z",
    updatedAt: "2024-03-15T09:00:00Z",
    createdBy: "admin"
  }
];

export const useOrders = (): UseOrdersReturn => {
  const [orders, setOrders] = useState<GroupOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate API call
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setOrders(mockOrders);
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement des commandes');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // CRUD Operations
  const createOrder = (orderData: Omit<GroupOrder, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newOrder: GroupOrder = {
      ...orderData,
      id: `GRP-${String(orders.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setOrders([...orders, newOrder]);
  };

  const updateOrder = (id: string, orderData: Partial<GroupOrder>) => {
    setOrders(orders.map(order => 
      order.id === id 
        ? { ...order, ...orderData, updatedAt: new Date().toISOString() }
        : order
    ));
  };

  const deleteOrder = (id: string) => {
    setOrders(orders.filter(order => order.id !== id));
  };

  // Utility Functions
  const searchOrders = (query: string): GroupOrder[] => {
    const lowercaseQuery = query.toLowerCase();
    return orders.filter(order =>
      order.name.toLowerCase().includes(lowercaseQuery) ||
      order.description?.toLowerCase().includes(lowercaseQuery) ||
      order.organizer.toLowerCase().includes(lowercaseQuery) ||
      order.items.some(item => 
        item.product.toLowerCase().includes(lowercaseQuery)
      )
    );
  };

  const filterOrdersByStatus = (status: string): GroupOrder[] => {
    return orders.filter(order => order.status === status);
  };

  const filterOrdersByType = (type: string): GroupOrder[] => {
    return orders.filter(order => order.type === type);
  };

  const getOrdersByOrganizer = (organizer: string): GroupOrder[] => {
    return orders.filter(order => order.organizer === organizer);
  };

  // Stats
  const getStats = () => {
    const totalOrders = orders.length;
    const activeOrders = orders.filter(o => o.status === 'active').length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    
    const totalParticipants = orders.reduce((sum, order) => sum + order.currentParticipants, 0);
    const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const averageOrderValue = totalOrders > 0 ? totalAmount / totalOrders : 0;
    const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

    return {
      totalOrders,
      activeOrders,
      completedOrders,
      pendingOrders,
      totalParticipants,
      totalAmount,
      averageOrderValue: Math.round(averageOrderValue),
      completionRate: Math.round(completionRate)
    };
  };

  // Export
  const exportOrders = (): string => {
    const headers = [
      'ID',
      'Nom',
      'Type',
      'Statut',
      'Priorité',
      'Organisateur',
      'Participants',
      'Montant total',
      'Devise',
      'Date limite',
      'Date de création'
    ];

    const rows = orders.map(order => [
      order.id,
      order.name,
      order.type,
      order.status,
      order.priority,
      order.organizer,
      `${order.currentParticipants}/${order.targetParticipants}`,
      order.totalAmount.toString(),
      order.currency,
      order.deadline,
      new Date(order.createdAt).toLocaleDateString('fr-FR')
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  };

  // Refresh
  const refresh = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setOrders(mockOrders);
      setError(null);
    } catch (err) {
      setError('Erreur lors du rafraîchissement des commandes');
    } finally {
      setLoading(false);
    }
  };

  return {
    orders,
    loading,
    error,
    createOrder,
    updateOrder,
    deleteOrder,
    searchOrders,
    filterOrdersByStatus,
    filterOrdersByType,
    getOrdersByOrganizer,
    getStats,
    exportOrders,
    refresh
  };
};
