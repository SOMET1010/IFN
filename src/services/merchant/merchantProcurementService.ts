import { MerchantOrder } from './merchantService';
import { merchantMockService } from './merchantMockService';

export class MerchantProcurementService {
  private static instance: MerchantProcurementService;
  static getInstance(): MerchantProcurementService {
    if (!MerchantProcurementService.instance) {
      MerchantProcurementService.instance = new MerchantProcurementService();
    }
    return MerchantProcurementService.instance;
  }

  async createPurchaseOrder(params: {
    supplier: string;
    items: Array<{ name: string; quantity: string; price: number }>;
    expectedDate: string;
  }): Promise<MerchantOrder> {
    const total = params.items.reduce((s, it) => s + it.price, 0);
    const id = `PO-${Date.now().toString().slice(-6)}`;
    const order: MerchantOrder = {
      id,
      client: params.supplier,
      products: params.items,
      total: `${total.toLocaleString()} FCFA`,
      date: new Date().toISOString().split('T')[0],
      deliveryDate: params.expectedDate,
      status: 'confirmed',
      clientInfo: { phone: '+225 00 00 00 00 00', address: '—' },
    };
    return merchantMockService.createOrder(order);
  }
}

