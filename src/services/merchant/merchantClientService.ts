import { MerchantClient, ClientPurchaseHistory, ProductRecommendation } from '@/types/merchant';

export interface ClientSearchFilters {
  name?: string;
  phone?: string;
  email?: string;
  category?: string;
  loyaltyLevel?: string;
  isActive?: boolean;
  minSpent?: number;
  maxSpent?: number;
  visitCount?: number;
}

export interface ClientSegment {
  id: string;
  name: string;
  description: string;
  criteria: ClientSearchFilters;
  clientCount: number;
  totalSpent: number;
  averageSpent: number;
  createdAt: Date;
}

export interface LoyaltyProgram {
  id: string;
  name: string;
  description: string;
  levels: Array<{
    name: string;
    minPoints: number;
    benefits: string[];
    discountRate: number;
  }>;
  isActive: boolean;
}

export interface CommunicationLog {
  id: string;
  clientId: string;
  type: 'email' | 'sms' | 'notification';
  channel: string;
  message: string;
  sentDate: Date;
  status: 'sent' | 'failed' | 'pending';
  metadata?: Record<string, any>;
}

export class MerchantClientService {
  private static instance: MerchantClientService;
  private clients: MerchantClient[] = [];
  private purchaseHistory: ClientPurchaseHistory[] = [];
  private clientSegments: ClientSegment[] = [];
  private loyaltyPrograms: LoyaltyProgram[] = [];
  private communicationLogs: CommunicationLog[] = [];

  static getInstance(): MerchantClientService {
    if (!MerchantClientService.instance) {
      MerchantClientService.instance = new MerchantClientService();
      MerchantClientService.instance.initializeMockData();
    }
    return MerchantClientService.instance;
  }

  private initializeMockData() {
    this.initializeMockClients();
    this.initializeLoyaltyPrograms();
    this.initializeClientSegments();
  }

  private initializeMockClients() {
    const mockClients: Omit<MerchantClient, 'id' | 'loyaltyPoints' | 'totalSpent' | 'visitCount' | 'lastVisit' | 'createdAt' | 'isActive'>[] = [
      {
        name: 'Kouadio Jean',
        phone: '+2250712345678',
        email: 'kouadio.jean@email.com',
        address: 'Abidjan, Cocody',
        preferences: ['légumes', 'fruits', 'biologique']
      },
      {
        name: 'Awa Touré',
        phone: '+2250787654321',
        email: 'awa.toure@email.com',
        address: 'Abidjan, Yopougon',
        preferences: ['fruits', 'produits laitiers']
      },
      {
        name: 'Yao Koffi',
        phone: '+2250509876543',
        email: 'yao.koffi@email.com',
        address: 'Bouaké',
        preferences: ['céréales', 'volaille']
      },
      {
        name: 'Fatoumata Bamba',
        phone: '+2250711123456',
        preferences: ['poissons', 'légumes']
      },
      {
        name: 'Mamadou Koné',
        phone: '+2250788990011',
        email: 'mamadou.kone@email.com',
        address: 'Abidjan, Treichville',
        preferences: ['fruits', 'céréales', 'produits locaux']
      }
    ];

    mockClients.forEach(clientData => {
      const newClient: MerchantClient = {
        ...clientData,
        id: this.generateId(),
        loyaltyPoints: Math.floor(Math.random() * 1000),
        totalSpent: Math.floor(Math.random() * 500000),
        visitCount: Math.floor(Math.random() * 50) + 1,
        lastVisit: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        isActive: true
      };
      this.clients.push(newClient);
    });
  }

  private initializeLoyaltyPrograms() {
    this.loyaltyPrograms = [
      {
        id: 'standard',
        name: 'Programme Standard',
        description: 'Programme de fidélité standard pour tous les clients',
        levels: [
          { name: 'Bronze', minPoints: 0, benefits: ['Accès aux promotions'], discountRate: 0 },
          { name: 'Argent', minPoints: 200, benefits: ['5% de réduction', 'Offres exclusives'], discountRate: 5 },
          { name: 'Or', minPoints: 500, benefits: ['10% de réduction', 'Service prioritaire', 'Cadeaux exclusifs'], discountRate: 10 }
        ],
        isActive: true
      }
    ];
  }

  private initializeClientSegments() {
    this.clientSegments = [
      {
        id: 'high_value',
        name: 'Clients à Valeur Élevée',
        description: 'Clients ayant dépensé plus de 100,000 FCFA',
        criteria: { minSpent: 100000 },
        clientCount: 0,
        totalSpent: 0,
        averageSpent: 0,
        createdAt: new Date()
      },
      {
        id: 'frequent_buyers',
        name: 'Acheteurs Fréquents',
        description: 'Clients ayant visité plus de 20 fois',
        criteria: { visitCount: 20 },
        clientCount: 0,
        totalSpent: 0,
        averageSpent: 0,
        createdAt: new Date()
      },
      {
        id: 'new_customers',
        name: 'Nouveaux Clients',
        description: 'Clients inscrits depuis moins de 30 jours',
        criteria: { isActive: true },
        clientCount: 0,
        totalSpent: 0,
        averageSpent: 0,
        createdAt: new Date()
      }
    ];
  }

  async quickRegisterClient(clientData: Omit<MerchantClient, 'id' | 'loyaltyPoints' | 'totalSpent' | 'visitCount' | 'lastVisit' | 'createdAt' | 'isActive'>): Promise<MerchantClient> {
    await this.delay(300);

    const existingClient = this.clients.find(c => c.phone === clientData.phone);
    if (existingClient) {
      return existingClient;
    }

    const newClient: MerchantClient = {
      ...clientData,
      id: this.generateId(),
      loyaltyPoints: 0,
      totalSpent: 0,
      visitCount: 0,
      lastVisit: new Date(),
      createdAt: new Date(),
      isActive: true
    };

    this.clients.push(newClient);
    return newClient;
  }

  async getClientPurchaseHistory(clientId: string, limit: number = 50): Promise<ClientPurchaseHistory[]> {
    await this.delay(200);

    const clientHistory = this.purchaseHistory
      .filter(purchase => purchase.clientId === clientId)
      .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
      .slice(0, limit);

    return clientHistory;
  }

  async getClientByPhone(phone: string): Promise<MerchantClient | null> {
    await this.delay(100);
    return this.clients.find(client => client.phone === phone) || null;
  }

  async updateClientVisit(clientId: string, amountSpent: number): Promise<MerchantClient> {
    await this.delay(200);

    const client = this.clients.find(c => c.id === clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    client.visitCount += 1;
    client.lastVisit = new Date();
    client.totalSpent += amountSpent;

    const pointsEarned = Math.floor(amountSpent / 100);
    client.loyaltyPoints += pointsEarned;

    return client;
  }

  async getProductRecommendations(clientId: string): Promise<ProductRecommendation[]> {
    await this.delay(300);

    const client = this.clients.find(c => c.id === clientId);
    if (!client) {
      return [];
    }

    const purchaseHistory = await this.getClientPurchaseHistory(clientId);
    const purchasedCategories = this.extractPurchaseCategories(purchaseHistory);
    const preferences = this.analyzePurchasePatterns(purchaseHistory);

    const recommendations: ProductRecommendation[] = [];

    purchasedCategories.forEach(category => {
      const similarProducts = this.getSimilarProducts(category, preferences);
      recommendations.push(...similarProducts);
    });

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  async addPurchaseToHistory(purchase: Omit<ClientPurchaseHistory, 'id'>): Promise<ClientPurchaseHistory> {
    await this.delay(200);

    const newPurchase: ClientPurchaseHistory = {
      ...purchase,
      id: this.generateId()
    };

    this.purchaseHistory.push(newPurchase);

    await this.updateClientVisit(purchase.clientId, purchase.totalAmount);

    return newPurchase;
  }

  async getClientStats(clientId: string): Promise<{
    totalPurchases: number;
    totalSpent: number;
    averagePurchase: number;
    favoriteCategory: string;
    loyaltyLevel: string;
  }> {
    await this.delay(150);

    const client = this.clients.find(c => c.id === clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    const history = await this.getClientPurchaseHistory(clientId);
    const totalPurchases = history.length;
    const totalSpent = client.totalSpent;
    const averagePurchase = totalPurchases > 0 ? totalSpent / totalPurchases : 0;

    const categoryCount = this.extractPurchaseCategories(history).reduce((acc, cat) => {
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const favoriteCategory = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

    const loyaltyLevel = this.getLoyaltyLevel(client.loyaltyPoints);

    return {
      totalPurchases,
      totalSpent,
      averagePurchase,
      favoriteCategory,
      loyaltyLevel
    };
  }

  private extractPurchaseCategories(history: ClientPurchaseHistory[]): string[] {
    const categories = new Set<string>();
    history.forEach(purchase => {
      purchase.products.forEach(product => {
        categories.add(product.category);
      });
    });
    return Array.from(categories);
  }

  private analyzePurchasePatterns(history: ClientPurchaseHistory[]): string[] {
    const patterns = new Set<string>();

    history.forEach(purchase => {
      if (purchase.totalAmount > 5000) {
        patterns.add('high_value');
      }
      if (purchase.products.length > 5) {
        patterns.add('bulk_buyer');
      }
      if (new Date().getHours() < 12) {
        patterns.add('morning_shopper');
      }
    });

    return Array.from(patterns);
  }

  private getSimilarProducts(category: string, preferences: string[]): ProductRecommendation[] {
    const mockProducts = this.getMockProducts();

    return mockProducts
      .filter(product => product.category === category)
      .map(product => ({
        productId: product.id,
        productName: product.name,
        score: Math.random() * 0.5 + 0.5,
        reason: `Basé sur vos achats précédents de ${category}`,
        category: product.category,
        price: product.price,
        stock: product.stock
      }));
  }

  private getLoyaltyLevel(points: number): string {
    if (points >= 1000) return 'Or';
    if (points >= 500) return 'Argent';
    if (points >= 200) return 'Bronze';
    return 'Standard';
  }

  private getMockProducts(): Array<{id: string, name: string, category: string, price: number, stock: number}> {
    return [
      { id: '1', name: 'Tomates fraîches', category: 'légumes', price: 500, stock: 100 },
      { id: '2', name: 'Oranges', category: 'fruits', price: 300, stock: 80 },
      { id: '3', name: 'Poulet entier', category: 'volaille', price: 2500, stock: 30 },
      { id: '4', name: 'Poisson frais', category: 'poissons', price: 1500, stock: 25 },
      { id: '5', name: 'Riz local', category: 'céréales', price: 800, stock: 150 },
      { id: '6', name: 'Bananes', category: 'fruits', price: 200, stock: 120 },
      { id: '7', name: 'Carottes', category: 'légumes', price: 400, stock: 90 },
      { id: '8', name: 'Œufs', category: 'volaille', price: 100, stock: 200 }
    ];
  }

  async searchClients(filters: ClientSearchFilters): Promise<MerchantClient[]> {
    await this.delay(300);

    let filteredClients = this.clients;

    if (filters.name) {
      filteredClients = filteredClients.filter(client =>
        client.name.toLowerCase().includes(filters.name!.toLowerCase())
      );
    }

    if (filters.phone) {
      filteredClients = filteredClients.filter(client =>
        client.phone.includes(filters.phone!)
      );
    }

    if (filters.email) {
      filteredClients = filteredClients.filter(client =>
        client.email?.toLowerCase().includes(filters.email!.toLowerCase())
      );
    }

    if (filters.isActive !== undefined) {
      filteredClients = filteredClients.filter(client => client.isActive === filters.isActive);
    }

    if (filters.minSpent) {
      filteredClients = filteredClients.filter(client => client.totalSpent >= filters.minSpent!);
    }

    if (filters.maxSpent) {
      filteredClients = filteredClients.filter(client => client.totalSpent <= filters.maxSpent!);
    }

    if (filters.visitCount) {
      filteredClients = filteredClients.filter(client => client.visitCount >= filters.visitCount!);
    }

    return filteredClients;
  }

  async getClientSegments(): Promise<ClientSegment[]> {
    await this.delay(400);

    const updatedSegments = this.clientSegments.map(segment => {
      const segmentClients = this.clients.filter(client => {
        if (segment.criteria.minSpent && client.totalSpent < segment.criteria.minSpent) return false;
        if (segment.criteria.visitCount && client.visitCount < segment.criteria.visitCount) return false;
        if (segment.criteria.isActive !== undefined && client.isActive !== segment.criteria.isActive) return false;
        return true;
      });

      const totalSpent = segmentClients.reduce((sum, client) => sum + client.totalSpent, 0);
      const averageSpent = segmentClients.length > 0 ? totalSpent / segmentClients.length : 0;

      return {
        ...segment,
        clientCount: segmentClients.length,
        totalSpent,
        averageSpent
      };
    });

    this.clientSegments = updatedSegments;
    return updatedSegments;
  }

  async createClientSegment(
    name: string,
    description: string,
    criteria: ClientSearchFilters
  ): Promise<ClientSegment> {
    await this.delay(500);

    const segmentClients = await this.searchClients(criteria);
    const totalSpent = segmentClients.reduce((sum, client) => sum + client.totalSpent, 0);
    const averageSpent = segmentClients.length > 0 ? totalSpent / segmentClients.length : 0;

    const newSegment: ClientSegment = {
      id: this.generateId(),
      name,
      description,
      criteria,
      clientCount: segmentClients.length,
      totalSpent,
      averageSpent,
      createdAt: new Date()
    };

    this.clientSegments.push(newSegment);
    return newSegment;
  }

  async getClientLoyaltyLevel(clientId: string): Promise<{
    level: string;
    points: number;
    benefits: string[];
    discountRate: number;
    nextLevel?: string;
    pointsToNextLevel?: number;
  }> {
    await this.delay(200);

    const client = this.clients.find(c => c.id === clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    const program = this.loyaltyPrograms.find(p => p.isActive);
    if (!program) {
      return {
        level: 'Standard',
        points: client.loyaltyPoints,
        benefits: ['Accès aux promotions'],
        discountRate: 0
      };
    }

    const currentLevel = program.levels
      .filter(level => client.loyaltyPoints >= level.minPoints)
      .sort((a, b) => b.minPoints - a.minPoints)[0];

    const nextLevel = program.levels.find(level => level.minPoints > client.loyaltyPoints);

    return {
      level: currentLevel.name,
      points: client.loyaltyPoints,
      benefits: currentLevel.benefits,
      discountRate: currentLevel.discountRate,
      nextLevel: nextLevel?.name,
      pointsToNextLevel: nextLevel ? nextLevel.minPoints - client.loyaltyPoints : undefined
    };
  }

  async sendClientCommunication(
    clientId: string,
    message: string,
    type: 'email' | 'sms' | 'notification',
    channel: string,
    metadata?: Record<string, any>
  ): Promise<CommunicationLog> {
    await this.delay(800);

    const client = this.clients.find(c => c.id === clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    const mockSuccessRate = type === 'email' ? 0.9 : type === 'sms' ? 0.85 : 0.95;
    const status = Math.random() < mockSuccessRate ? 'sent' : 'failed';

    const log: CommunicationLog = {
      id: this.generateId(),
      clientId,
      type,
      channel,
      message,
      sentDate: new Date(),
      status,
      metadata
    };

    this.communicationLogs.push(log);
    return log;
  }

  async getClientCommunicationHistory(clientId: string, limit: number = 50): Promise<CommunicationLog[]> {
    await this.delay(300);
    return this.communicationLogs
      .filter(log => log.clientId === clientId)
      .sort((a, b) => new Date(b.sentDate).getTime() - new Date(a.sentDate).getTime())
      .slice(0, limit);
  }

  async getClientAnalytics(clientId: string): Promise<{
    totalSpent: number;
    totalVisits: number;
    averagePurchase: number;
    favoriteCategories: string[];
    purchaseFrequency: number;
    lastPurchase: Date | null;
    loyaltyProgress: {current: number, max: number, level: string};
  }> {
    await this.delay(500);

    const client = this.clients.find(c => c.id === clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    const history = await this.getClientPurchaseHistory(clientId);
    const favoriteCategories = this.extractPurchaseCategories(history);
    const firstPurchase = history[history.length - 1];
    const lastPurchase = history[0];

    const daysBetweenFirstAndLast = firstPurchase && lastPurchase ?
      (new Date(lastPurchase.purchaseDate).getTime() - new Date(firstPurchase.purchaseDate).getTime()) / (1000 * 60 * 60 * 24) : 0;
    const purchaseFrequency = daysBetweenFirstAndLast > 0 ? history.length / daysBetweenFirstAndLast : 0;

    const loyaltyInfo = await this.getClientLoyaltyLevel(clientId);
    const nextLevelPoints = loyaltyInfo.pointsToNextLevel || loyaltyInfo.points;
    const currentLevelPoints = loyaltyInfo.points - (loyaltyInfo.pointsToNextLevel ? 0 : 0);

    return {
      totalSpent: client.totalSpent,
      totalVisits: client.visitCount,
      averagePurchase: client.visitCount > 0 ? client.totalSpent / client.visitCount : 0,
      favoriteCategories,
      purchaseFrequency,
      lastPurchase: lastPurchase ? new Date(lastPurchase.purchaseDate) : null,
      loyaltyProgress: {
        current: currentLevelPoints,
        max: nextLevelPoints,
        level: loyaltyInfo.level
      }
    };
  }

  async updateClientPreferences(clientId: string, preferences: string[]): Promise<MerchantClient> {
    await this.delay(300);

    const client = this.clients.find(c => c.id === clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    client.preferences = [...new Set([...client.preferences, ...preferences])];
    return client;
  }

  async deactivateClient(clientId: string): Promise<MerchantClient> {
    await this.delay(200);

    const client = this.clients.find(c => c.id === clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    client.isActive = false;
    return client;
  }

  async reactivateClient(clientId: string): Promise<MerchantClient> {
    await this.delay(200);

    const client = this.clients.find(c => c.id === clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    client.isActive = true;
    return client;
  }

  async getClientsByLoyaltyLevel(level: string): Promise<MerchantClient[]> {
    await this.delay(400);

    return this.clients.filter(client => {
      const clientLevel = this.getLoyaltyLevel(client.loyaltyPoints);
      return clientLevel === level;
    });
  }

  async getTopClients(limit: number = 10, sortBy: 'totalSpent' | 'visitCount' | 'loyaltyPoints' = 'totalSpent'): Promise<MerchantClient[]> {
    await this.delay(300);

    return this.clients
      .sort((a, b) => b[sortBy] - a[sortBy])
      .slice(0, limit);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}