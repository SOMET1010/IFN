import { BarcodeScan, VoiceCommand } from '@/types/merchant';

export interface ProductInfo {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  description?: string;
  imageUrl?: string;
  expiryDate?: string;
  supplier?: string;
  weight?: number;
  dimensions?: {length: number, width: number, height: number};
}

export interface ScanResult {
  success: boolean;
  product?: ProductInfo;
  error?: string;
  confidence: number;
  scanTime: number;
}

export interface VoiceCommandResult {
  success: boolean;
  command?: VoiceCommand;
  error?: string;
  alternatives?: VoiceCommand[];
}

export class MerchantBarcodeService {
  private static instance: MerchantBarcodeService;
  private isScanning: boolean = false;
  private voiceRecognition: any = null;
  private productDatabase: Map<string, ProductInfo> = new Map();
  private scanHistory: BarcodeScan[] = [];
  private voiceCommandHistory: VoiceCommand[] = [];

  static getInstance(): MerchantBarcodeService {
    if (!MerchantBarcodeService.instance) {
      MerchantBarcodeService.instance = new MerchantBarcodeService();
      MerchantBarcodeService.instance.initializeProductDatabase();
    }
    return MerchantBarcodeService.instance;
  }

  private initializeProductDatabase() {
    const products: ProductInfo[] = [
      {
        id: '1',
        name: 'Tomates fraîches',
        category: 'légumes',
        price: 500,
        stock: 100,
        unit: 'kg',
        description: 'Tomates rouges mûres, cultivées localement',
        supplier: 'Ferme Kouadio',
        weight: 1000,
        dimensions: {length: 20, width: 15, height: 10}
      },
      {
        id: '2',
        name: 'Oranges',
        category: 'fruits',
        price: 300,
        stock: 80,
        unit: 'kg',
        description: 'Oranges juteuses et sucrées',
        supplier: 'Plantation Yamoussoukro',
        weight: 1000,
        dimensions: {length: 25, width: 20, height: 15}
      },
      {
        id: '3',
        name: 'Poulet entier',
        category: 'volaille',
        price: 2500,
        stock: 30,
        unit: 'pièce',
        description: 'Poulet fermier élevé en plein air',
        supplier: 'Élevage Moderne',
        weight: 1500,
        dimensions: {length: 30, width: 20, height: 15}
      },
      {
        id: '4',
        name: 'Poisson frais',
        category: 'poissons',
        price: 1500,
        stock: 25,
        unit: 'kg',
        description: 'Poisson frais pêché ce matin',
        supplier: 'Pêcherie d\'Abidjan',
        weight: 1000,
        expiryDate: '2024-12-26'
      },
      {
        id: '5',
        name: 'Riz local',
        category: 'céréales',
        price: 800,
        stock: 150,
        unit: 'kg',
        description: 'Riz blanc de qualité supérieure',
        supplier: 'Rizerie du Nord',
        weight: 1000,
        dimensions: {length: 40, width: 30, height: 20}
      },
      {
        id: '6',
        name: 'Bananes',
        category: 'fruits',
        price: 200,
        stock: 120,
        unit: 'kg',
        description: 'Bananes plantain mûres',
        supplier: 'Coopérative Agricole',
        weight: 1000,
        dimensions: {length: 30, width: 15, height: 10}
      },
      {
        id: '7',
        name: 'Carottes',
        category: 'légumes',
        price: 400,
        stock: 90,
        unit: 'kg',
        description: 'Carottes fraîches et croquantes',
        supplier: 'Ferme Bio',
        weight: 1000,
        dimensions: {length: 15, width: 10, height: 8}
      },
      {
        id: '8',
        name: 'Œufs',
        category: 'volaille',
        price: 100,
        stock: 200,
        unit: 'douzaine',
        description: 'Œufs frais de poules élevées en plein air',
        supplier: 'Élevage Traditionnel',
        weight: 600,
        dimensions: {length: 20, width: 15, height: 10}
      }
    ];

    products.forEach(product => {
      this.productDatabase.set(product.id, product);
    });
  }

  async scanBarcode(): Promise<ScanResult> {
    this.isScanning = true;
    const startTime = Date.now();

    try {
      await this.delay(2000);

      const mockBarcodes = [
        { barcode: '1234567890123', productId: '1' },
        { barcode: '2345678901234', productId: '2' },
        { barcode: '3456789012345', productId: '3' },
        { barcode: '4567890123456', productId: '4' },
        { barcode: '5678901234567', productId: '5' }
      ];

      const randomBarcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
      const product = this.productDatabase.get(randomBarcode.productId);

      const scanResult: BarcodeScan = {
        barcode: randomBarcode.barcode,
        productId: randomBarcode.productId,
        timestamp: new Date(),
        isValid: true
      };

      this.scanHistory.push(scanResult);

      return {
        success: true,
        product,
        confidence: 0.95 + Math.random() * 0.05,
        scanTime: Date.now() - startTime
      };
    } catch (error) {
      const failedScan: BarcodeScan = {
        barcode: '',
        timestamp: new Date(),
        isValid: false
      };
      this.scanHistory.push(failedScan);

      return {
        success: false,
        error: 'Échec du scan du code-barres',
        confidence: 0,
        scanTime: Date.now() - startTime
      };
    } finally {
      this.isScanning = false;
    }
  }

  async startVoiceRecognition(): Promise<VoiceCommandResult> {
    try {
      if (!this.voiceRecognition) {
        this.voiceRecognition = this.initializeVoiceRecognition();
      }

      const result = await this.processVoiceCommand();
      this.voiceCommandHistory.push(result);

      return {
        success: true,
        command: result
      };
    } catch (error) {
      const failedCommand: VoiceCommand = {
        id: Date.now().toString(),
        command: '',
        intent: 'error',
        entities: {},
        confidence: 0,
        timestamp: new Date(),
        status: 'failed'
      };
      this.voiceCommandHistory.push(failedCommand);

      return {
        success: false,
        command: failedCommand,
        error: 'Échec de la reconnaissance vocale'
      };
    }
  }

  private initializeVoiceRecognition() {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = 'fr-FR';
      recognition.continuous = false;
      recognition.interimResults = false;
      return recognition;
    }
    return null;
  }

  private async processVoiceCommand(): Promise<VoiceCommand> {
    await this.delay(1500);

    const mockCommands = [
      {
        command: 'ajouter deux tomates',
        intent: 'add_to_cart',
        entities: { product: 'tomates', quantity: 2, productId: '1' },
        confidence: 0.95
      },
      {
        command: 'rechercher oranges',
        intent: 'search_product',
        entities: { product: 'oranges', productId: '2' },
        confidence: 0.92
      },
      {
        command: 'prix du poulet',
        intent: 'get_price',
        entities: { product: 'poulet', productId: '3' },
        confidence: 0.89
      },
      {
        command: 'payer en mobile money',
        intent: 'select_payment',
        entities: { method: 'mobile_money' },
        confidence: 0.94
      },
      {
        command: 'finaliser la vente',
        intent: 'complete_sale',
        entities: {},
        confidence: 0.96
      },
      {
        command: 'ajouter un kilo de carottes',
        intent: 'add_to_cart',
        entities: { product: 'carottes', quantity: 1, unit: 'kilo', productId: '7' },
        confidence: 0.91
      },
      {
        command: 'combien coûte le poisson',
        intent: 'get_price',
        entities: { product: 'poisson', productId: '4' },
        confidence: 0.88
      },
      {
        command: 'je veux du riz',
        intent: 'search_product',
        entities: { product: 'riz', productId: '5' },
        confidence: 0.93
      }
    ];

    const randomCommand = mockCommands[Math.floor(Math.random() * mockCommands.length)];

    const voiceCommand: VoiceCommand = {
      id: Date.now().toString(),
      command: randomCommand.command,
      intent: randomCommand.intent,
      entities: randomCommand.entities,
      confidence: randomCommand.confidence,
      timestamp: new Date(),
      status: 'processed'
    };

    return voiceCommand;
  }

  async getProductByBarcode(barcode: string): Promise<ProductInfo | null> {
    await this.delay(100);

    const barcodeMap: Record<string, string> = {
      '1234567890123': '1',
      '2345678901234': '2',
      '3456789012345': '3',
      '4567890123456': '4',
      '5678901234567': '5',
      '6789012345678': '6',
      '7890123456789': '7',
      '8901234567890': '8'
    };

    const productId = barcodeMap[barcode];
    return productId ? this.productDatabase.get(productId) || null : null;
  }

  async searchProducts(query: string): Promise<ProductInfo[]> {
    await this.delay(200);

    const normalizedQuery = query.toLowerCase().trim();
    const results: ProductInfo[] = [];

    this.productDatabase.forEach(product => {
      if (
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.category.toLowerCase().includes(normalizedQuery) ||
        product.description?.toLowerCase().includes(normalizedQuery)
      ) {
        results.push(product);
      }
    });

    return results;
  }

  async getProductById(productId: string): Promise<ProductInfo | null> {
    await this.delay(100);
    return this.productDatabase.get(productId) || null;
  }

  async getAllProducts(): Promise<ProductInfo[]> {
    await this.delay(300);
    return Array.from(this.productDatabase.values());
  }

  async getProductsByCategory(category: string): Promise<ProductInfo[]> {
    await this.delay(150);
    return Array.from(this.productDatabase.values()).filter(product =>
      product.category.toLowerCase() === category.toLowerCase()
    );
  }

  async getScanHistory(limit: number = 50): Promise<BarcodeScan[]> {
    await this.delay(100);
    return this.scanHistory
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async getVoiceCommandHistory(limit: number = 50): Promise<VoiceCommand[]> {
    await this.delay(100);
    return this.voiceCommandHistory
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async addProduct(product: Omit<ProductInfo, 'id'>): Promise<ProductInfo> {
    await this.delay(500);

    const newProduct: ProductInfo = {
      ...product,
      id: this.generateId()
    };

    this.productDatabase.set(newProduct.id, newProduct);
    return newProduct;
  }

  async updateProduct(productId: string, updates: Partial<ProductInfo>): Promise<ProductInfo> {
    await this.delay(300);

    const product = this.productDatabase.get(productId);
    if (!product) {
      throw new Error('Produit non trouvé');
    }

    const updatedProduct = { ...product, ...updates };
    this.productDatabase.set(productId, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(productId: string): Promise<void> {
    await this.delay(200);
    this.productDatabase.delete(productId);
  }

  async checkStock(productId: string): Promise<{available: boolean, stock: number, lowStock: boolean}> {
    await this.delay(100);

    const product = this.productDatabase.get(productId);
    if (!product) {
      return { available: false, stock: 0, lowStock: false };
    }

    return {
      available: product.stock > 0,
      stock: product.stock,
      lowStock: product.stock < 10
    };
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}