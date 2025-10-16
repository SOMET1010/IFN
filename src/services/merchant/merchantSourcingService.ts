export interface SupplierOffer {
  id: string;
  supplier: string;
  productId: string;
  productName: string;
  quality: 'A' | 'B' | 'C';
  unitPrice: number; // XOF
  minQty: number;
  deliveryDays: number;
  rating: number; // 1-5
}

export class MerchantSourcingService {
  private static instance: MerchantSourcingService;
  private offers: SupplierOffer[] = [];

  static getInstance(): MerchantSourcingService {
    if (!MerchantSourcingService.instance) {
      MerchantSourcingService.instance = new MerchantSourcingService();
      MerchantSourcingService.instance.seed();
    }
    return MerchantSourcingService.instance;
  }

  private seed() {
    this.offers = [
      { id: 'off-1', supplier: 'Coop Yamoussoukro', productId: '1', productName: 'Tomates fraîches', quality: 'A', unitPrice: 480, minQty: 10, deliveryDays: 1, rating: 4.6 },
      { id: 'off-2', supplier: 'Ferme Kouadio', productId: '1', productName: 'Tomates fraîches', quality: 'B', unitPrice: 450, minQty: 20, deliveryDays: 2, rating: 4.2 },
      { id: 'off-3', supplier: 'Plantation Yopougon', productId: '2', productName: 'Oranges', quality: 'A', unitPrice: 260, minQty: 15, deliveryDays: 1, rating: 4.8 },
      { id: 'off-4', supplier: 'Élevage Moderne', productId: '3', productName: 'Poulet entier', quality: 'A', unitPrice: 2300, minQty: 5, deliveryDays: 3, rating: 4.4 },
      { id: 'off-5', supplier: 'Pêcherie Abidjan', productId: '4', productName: 'Poisson frais', quality: 'A', unitPrice: 1400, minQty: 10, deliveryDays: 1, rating: 4.1 },
    ];
  }

  async listOffers(query?: { productName?: string; maxDays?: number; minRating?: number; }): Promise<SupplierOffer[]> {
    await this.delay(200);
    let res = [...this.offers];
    if (query?.productName) {
      const q = query.productName.toLowerCase();
      res = res.filter(o => o.productName.toLowerCase().includes(q));
    }
    if (query?.maxDays != null) {
      res = res.filter(o => o.deliveryDays <= query.maxDays!);
    }
    if (query?.minRating != null) {
      res = res.filter(o => o.rating >= query.minRating!);
    }
    return res;
  }

  private delay(ms: number) { return new Promise(res => setTimeout(res, ms)); }
}

