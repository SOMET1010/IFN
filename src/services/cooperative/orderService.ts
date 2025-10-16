import { z } from 'zod';

// Types
export interface OrderParticipant {
  id: string;
  memberId: string;
  memberName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  joinDate: string;
  status: 'pending' | 'confirmed' | 'paid' | 'delivered';
  notes?: string;
}

export interface GroupOrder {
  id: string;
  product: string;
  description?: string;
  category: string;
  totalQuantity: number;
  unit: string;
  unitPrice: number;
  totalAmount: number;
  targetParticipants: number;
  currentParticipants: number;
  deadline: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  paymentTerms: string;
  deliveryMethod: string;
  supplier: string;
  supplierContact: string;
  minQuantityPerParticipant: number;
  maxQuantityPerParticipant: number;
  participants: OrderParticipant[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  deliveryDate?: string;
  notes?: string;
}

export interface OrderMessage {
  id: string;
  orderId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'info' | 'warning' | 'update';
}

// Schémas de validation
export const orderParticipantSchema = z.object({
  memberId: z.string().min(1, 'L\'ID du membre est requis'),
  memberName: z.string().min(1, 'Le nom du membre est requis'),
  quantity: z.number().min(1, 'La quantité doit être positive'),
  unitPrice: z.number().min(0, 'Le prix unitaire ne peut être négatif'),
  totalPrice: z.number().min(0, 'Le prix total ne peut être négatif'),
  joinDate: z.string().min(1, 'La date d\'adhésion est requise'),
  status: z.enum(['pending', 'confirmed', 'paid', 'delivered']).default('pending'),
  notes: z.string().optional(),
});

export const groupOrderSchema = z.object({
  product: z.string().min(1, 'Le produit est requis'),
  description: z.string().optional(),
  category: z.string().min(1, 'La catégorie est requise'),
  totalQuantity: z.number().min(1, 'La quantité totale doit être positive'),
  unit: z.string().min(1, 'L\'unité est requise'),
  unitPrice: z.number().min(0, 'Le prix unitaire ne peut être négatif'),
  targetParticipants: z.number().min(1, 'Le nombre cible de participants doit être positif'),
  deadline: z.string().min(1, 'La date limite est requise'),
  status: z.enum(['pending', 'active', 'completed', 'cancelled']).default('pending'),
  paymentTerms: z.string().min(1, 'Les conditions de paiement sont requises'),
  deliveryMethod: z.string().min(1, 'La méthode de livraison est requise'),
  supplier: z.string().min(1, 'Le fournisseur est requis'),
  supplierContact: z.string().min(1, 'Le contact du fournisseur est requis'),
  minQuantityPerParticipant: z.number().min(1, 'La quantité minimale doit être positive'),
  maxQuantityPerParticipant: z.number().min(1, 'La quantité maximale doit être positive'),
  notes: z.string().optional(),
}).refine(data => data.maxQuantityPerParticipant >= data.minQuantityPerParticipant, {
  message: 'La quantité maximale doit être supérieure ou égale à la quantité minimale',
  path: ['maxQuantityPerParticipant'],
});

export const orderMessageSchema = z.object({
  orderId: z.string().min(1, 'L\'ID de la commande est requis'),
  senderId: z.string().min(1, 'L\'ID de l\'expéditeur est requis'),
  senderName: z.string().min(1, 'Le nom de l\'expéditeur est requis'),
  content: z.string().min(1, 'Le contenu est requis'),
  type: z.enum(['info', 'warning', 'update']).default('info'),
});

export type GroupOrderFormData = z.infer<typeof groupOrderSchema>;
export type OrderParticipantFormData = z.infer<typeof orderParticipantSchema>;
export type OrderMessageFormData = z.infer<typeof orderMessageSchema>;

// Service
class OrderService {
  private readonly STORAGE_KEYS = {
    ORDERS: 'cooperative_group_orders',
    MESSAGES: 'cooperative_order_messages',
  };

  // Générer un ID unique
  private generateId(): string {
    return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  private generateParticipantId(): string {
    return `PART-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  private generateMessageId(): string {
    return `MSG-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  // Récupérer toutes les commandes
  getAll(): GroupOrder[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.ORDERS);
      if (!stored) {
        // Initialiser avec des données par défaut
        const defaultOrders: GroupOrder[] = [
          {
            id: "GRP-001",
            product: "Engrais bio",
            description: "Engrais organique certifié pour cacaoyers",
            category: "Intrants",
            totalQuantity: 500,
            unit: "kg",
            unitPrice: 800,
            totalAmount: 400000,
            targetParticipants: 15,
            currentParticipants: 12,
            deadline: "2024-03-25",
            status: "active",
            paymentTerms: "50% à la commande, 50% à la livraison",
            deliveryMethod: "Livraison à la coopérative",
            supplier: "Agri-Chem CI",
            supplierContact: "+225 01 23 45 67",
            minQuantityPerParticipant: 20,
            maxQuantityPerParticipant: 50,
            participants: [
              {
                id: "PART-001",
                memberId: "MEM-001",
                memberName: "Kouadio Amani",
                quantity: 40,
                unitPrice: 800,
                totalPrice: 32000,
                joinDate: "2024-03-01",
                status: "confirmed"
              },
              {
                id: "PART-002",
                memberId: "MEM-002",
                memberName: "Fatou Traoré",
                quantity: 35,
                unitPrice: 800,
                totalPrice: 28000,
                joinDate: "2024-03-02",
                status: "confirmed"
              }
            ],
            createdBy: "ADMIN-001",
            createdAt: "2024-03-01T00:00:00.000Z",
            updatedAt: "2024-03-01T00:00:00.000Z"
          }
        ];
        this.saveAll(defaultOrders);
        return defaultOrders;
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error loading orders:', error);
      return [];
    }
  }

  // Sauvegarder toutes les commandes
  private saveAll(orders: GroupOrder[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (error) {
      console.error('Error saving orders:', error);
    }
  }

  // Créer une nouvelle commande
  create(data: Omit<GroupOrderFormData, 'id' | 'createdAt' | 'updatedAt' | 'totalAmount' | 'currentParticipants' | 'participants'>): GroupOrder {
    try {
      const validatedData = groupOrderSchema.parse(data);
      const orders = this.getAll();

      const totalAmount = validatedData.totalQuantity * validatedData.unitPrice;

      const newOrder: GroupOrder = {
        ...validatedData,
        id: this.generateId(),
        totalAmount,
        currentParticipants: 0,
        participants: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      orders.push(newOrder);
      this.saveAll(orders);
      return newOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // Mettre à jour une commande
  update(id: string, updates: Partial<GroupOrderFormData>): GroupOrder | null {
    try {
      const orders = this.getAll();
      const index = orders.findIndex(o => o.id === id);

      if (index === -1) return null;

      const updatedOrder = {
        ...orders[index],
        ...updates,
        totalAmount: updates.totalQuantity ? updates.totalQuantity * orders[index].unitPrice : orders[index].totalAmount,
        updatedAt: new Date().toISOString(),
      };

      // Validation
      groupOrderSchema.partial().parse(updatedOrder);

      orders[index] = updatedOrder;
      this.saveAll(orders);
      return updatedOrder;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }

  // Supprimer une commande
  delete(id: string): boolean {
    try {
      const orders = this.getAll();
      const index = orders.findIndex(o => o.id === id);

      if (index === -1) return false;

      orders.splice(index, 1);
      this.saveAll(orders);
      return true;
    } catch (error) {
      console.error('Error deleting order:', error);
      return false;
    }
  }

  // Rechercher des commandes
  search(query: string): GroupOrder[] {
    try {
      const orders = this.getAll();
      const normalizedQuery = query.toLowerCase().trim();

      if (!normalizedQuery) return orders;

      return orders.filter(order =>
        order.product.toLowerCase().includes(normalizedQuery) ||
        order.description?.toLowerCase().includes(normalizedQuery) ||
        order.category.toLowerCase().includes(normalizedQuery) ||
        order.supplier.toLowerCase().includes(normalizedQuery)
      );
    } catch (error) {
      console.error('Error searching orders:', error);
      return [];
    }
  }

  // Filtrer par statut
  filterByStatus(status: string): GroupOrder[] {
    try {
      const orders = this.getAll();
      if (status === 'all') return orders;
      return orders.filter(o => o.status === status);
    } catch (error) {
      console.error('Error filtering orders by status:', error);
      return [];
    }
  }

  // Filtrer par catégorie
  filterByCategory(category: string): GroupOrder[] {
    try {
      const orders = this.getAll();
      if (category === 'all') return orders;
      return orders.filter(o => o.category === category);
    } catch (error) {
      console.error('Error filtering orders by category:', error);
      return [];
    }
  }

  // Gestion des participants
  addParticipant(orderId: string, participantData: Omit<OrderParticipantFormData, 'id' | 'joinDate'>): OrderParticipant | null {
    try {
      const orders = this.getAll();
      const order = orders.find(o => o.id === orderId);

      if (!order) return null;

      // Vérifier si le membre participe déjà
      const existingParticipant = order.participants.find(p => p.memberId === participantData.memberId);
      if (existingParticipant) {
        throw new Error('Ce membre participe déjà à cette commande');
      }

      // Vérifier les limites de quantité
      if (participantData.quantity < order.minQuantityPerParticipant ||
          participantData.quantity > order.maxQuantityPerParticipant) {
        throw new Error(`La quantité doit être entre ${order.minQuantityPerParticipant} et ${order.maxQuantityPerParticipant} ${order.unit}`);
      }

      const newParticipant: OrderParticipant = {
        ...participantData,
        id: this.generateParticipantId(),
        joinDate: new Date().toISOString(),
        totalPrice: participantData.quantity * participantData.unitPrice,
      };

      order.participants.push(newParticipant);
      order.currentParticipants = order.participants.length;
      order.updatedAt = new Date().toISOString();

      // Mettre à jour le statut si nécessaire
      if (order.currentParticipants >= order.targetParticipants && order.status === 'active') {
        order.status = 'completed';
        order.completedAt = new Date().toISOString();
      }

      this.saveAll(orders);
      return newParticipant;
    } catch (error) {
      console.error('Error adding participant:', error);
      throw error;
    }
  }

  updateParticipant(orderId: string, participantId: string, updates: Partial<OrderParticipantFormData>): OrderParticipant | null {
    try {
      const orders = this.getAll();
      const order = orders.find(o => o.id === orderId);

      if (!order) return null;

      const participantIndex = order.participants.findIndex(p => p.id === participantId);
      if (participantIndex === -1) return null;

      order.participants[participantIndex] = {
        ...order.participants[participantIndex],
        ...updates,
        totalPrice: updates.quantity ? updates.quantity * order.participants[participantIndex].unitPrice : order.participants[participantIndex].totalPrice,
      };

      order.updatedAt = new Date().toISOString();
      this.saveAll(orders);
      return order.participants[participantIndex];
    } catch (error) {
      console.error('Error updating participant:', error);
      throw error;
    }
  }

  removeParticipant(orderId: string, participantId: string): boolean {
    try {
      const orders = this.getAll();
      const order = orders.find(o => o.id === orderId);

      if (!order) return false;

      const participantIndex = order.participants.findIndex(p => p.id === participantId);
      if (participantIndex === -1) return false;

      order.participants.splice(participantIndex, 1);
      order.currentParticipants = order.participants.length;
      order.updatedAt = new Date().toISOString();

      this.saveAll(orders);
      return true;
    } catch (error) {
      console.error('Error removing participant:', error);
      return false;
    }
  }

  // Gestion des messages
  getMessages(orderId: string): OrderMessage[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.MESSAGES);
      if (!stored) return [];

      const allMessages = JSON.parse(stored);
      return allMessages.filter((msg: OrderMessage) => msg.orderId === orderId);
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  }

  private saveMessages(messages: OrderMessage[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  }

  addMessage(messageData: Omit<OrderMessageFormData, 'id' | 'timestamp'>): OrderMessage {
    try {
      const validatedData = orderMessageSchema.parse(messageData);
      const allMessages = this.getMessages(validatedData.orderId);

      const newMessage: OrderMessage = {
        ...validatedData,
        id: this.generateMessageId(),
        timestamp: new Date().toISOString(),
      };

      allMessages.push(newMessage);

      // Récupérer tous les messages et mettre à jour
      const stored = localStorage.getItem(this.STORAGE_KEYS.MESSAGES);
      const messages = stored ? JSON.parse(stored) : [];
      messages.push(newMessage);
      this.saveMessages(messages);

      return newMessage;
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  }

  // Obtenir les statistiques
  getStats() {
    try {
      const orders = this.getAll();
      const activeOrders = orders.filter(o => o.status === 'active');
      const completedOrders = orders.filter(o => o.status === 'completed');
      const totalParticipants = orders.reduce((sum, order) => sum + order.currentParticipants, 0);
      const totalValue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

      return {
        totalOrders: orders.length,
        activeOrders: activeOrders.length,
        completedOrders: completedOrders.length,
        totalParticipants,
        totalValue,
        averageOrderValue: orders.length > 0 ? totalValue / orders.length : 0,
      };
    } catch (error) {
      console.error('Error getting order stats:', error);
      return {
        totalOrders: 0,
        activeOrders: 0,
        completedOrders: 0,
        totalParticipants: 0,
        totalValue: 0,
        averageOrderValue: 0,
      };
    }
  }

  // Export CSV
  exportToCSV(): string {
    try {
      const orders = this.getAll();
      const headers = [
        'ID', 'Produit', 'Catégorie', 'Quantité Totale', 'Prix Unitaire',
        'Montant Total', 'Participants Cibles', 'Participants Actuels',
        'Statut', 'Date Limite', 'Fournisseur', 'Date Création'
      ];

      const rows = orders.map(o => [
        o.id,
        o.product,
        o.category,
        `${o.totalQuantity} ${o.unit}`,
        `${o.unitPrice} FCFA`,
        `${o.totalAmount} FCFA`,
        o.targetParticipants,
        o.currentParticipants,
        o.status,
        o.deadline,
        o.supplier,
        o.createdAt
      ]);

      return [headers, ...rows].map(row => row.join(',')).join('\n');
    } catch (error) {
      console.error('Error exporting orders:', error);
      return '';
    }
  }
}

export const orderService = new OrderService();