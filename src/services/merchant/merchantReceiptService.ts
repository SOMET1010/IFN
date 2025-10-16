import { DigitalReceipt, ReceiptItem } from '@/types/merchant';

export interface ReceiptTemplate {
  id: string;
  name: string;
  header: string;
  footer: string;
  includeTax: boolean;
  includeDiscount: boolean;
  includeLogo: boolean;
  colorScheme: 'default' | 'professional' | 'modern' | 'minimal';
}

export interface ReceiptConfig {
  autoPrint: boolean;
  autoEmail: boolean;
  autoSMS: boolean;
  templateId: string;
  emailSubject: string;
  smsTemplate: string;
}

export class MerchantReceiptService {
  private static instance: MerchantReceiptService;
  private templates: ReceiptTemplate[] = [];
  private config: ReceiptConfig;
  private receipts: DigitalReceipt[] = [];
  private readonly STORAGE_KEY = 'merchant_receipts_encrypted';

  static getInstance(): MerchantReceiptService {
    if (!MerchantReceiptService.instance) {
      MerchantReceiptService.instance = new MerchantReceiptService();
      MerchantReceiptService.instance.initializeTemplates();
      MerchantReceiptService.instance.initializeConfig();
      MerchantReceiptService.instance.loadPersisted().catch(() => {});
    }
    return MerchantReceiptService.instance;
  }

  private async loadPersisted() {
    try {
      const { secureStorage } = await import('@/lib/secureStorage');
      const raw = await secureStorage.getJSON<DigitalReceipt[]>(this.STORAGE_KEY);
      if (raw) {
        this.receipts = raw.map(r => ({ ...r, transactionDate: new Date(r.transactionDate) }));
      }
    } catch {
      // Silently ignore secureStorage errors during initialization
      // This allows the service to function with in-memory data only
    }
  }

  private async persist() {
    try {
      const { secureStorage } = await import('@/lib/secureStorage');
      await secureStorage.setJSON(this.STORAGE_KEY, this.receipts);
    } catch {
      // Silently ignore secureStorage errors during persistence
      // Receipts remain in memory but won't persist across sessions
    }
  }

  private initializeTemplates() {
    this.templates = [
      {
        id: 'default',
        name: 'Standard',
        header: 'INCLUSION NUMERIQUE - RECEU',
        footer: 'Merci pour votre confiance!\nContact: +225 XX XX XX XX',
        includeTax: false,
        includeDiscount: true,
        includeLogo: true,
        colorScheme: 'default'
      },
      {
        id: 'professional',
        name: 'Professionnel',
        header: 'FACTURE\nINCLUSION NUMERIQUE SARL\nRCCM: CI-ABJ-2024-B-12345',
        footer: 'Conditions de vente: https://inclusion.ci/cgv\nSupport: support@inclusion.ci',
        includeTax: true,
        includeDiscount: true,
        includeLogo: false,
        colorScheme: 'professional'
      },
      {
        id: 'modern',
        name: 'Moderne',
        header: '🛒 INCLUSION NUMERIQUE',
        footer: 'Suivez-nous sur @inclusion_numerique\n#AgricultureInclusive',
        includeTax: false,
        includeDiscount: true,
        includeLogo: false,
        colorScheme: 'modern'
      },
      {
        id: 'minimal',
        name: 'Minimal',
        header: 'Reçu',
        footer: 'Merci!',
        includeTax: false,
        includeDiscount: false,
        includeLogo: false,
        colorScheme: 'minimal'
      }
    ];
  }

  private initializeConfig() {
    this.config = {
      autoPrint: false,
      autoEmail: true,
      autoSMS: true,
      templateId: 'default',
      emailSubject: 'Votre reçu d\'achat - Inclusion Numérique',
      smsTemplate: 'Votre reçu {receiptNumber}: {total} FCFA. Merci pour votre achat!'
    };
  }

  async generateReceipt(
    saleData: {
      saleId: string;
      clientInfo: { name: string; phone: string; email?: string };
      items: ReceiptItem[];
      subtotal: number;
      tax?: number;
      discount?: number;
      total: number;
      paymentMethod: string;
    },
    templateId?: string
  ): Promise<DigitalReceipt> {
    await this.delay(500);

    const template = this.templates.find(t => t.id === (templateId || this.config.templateId)) || this.templates[0];

    const receipt: DigitalReceipt = {
      id: this.generateId(),
      saleId: saleData.saleId,
      receiptNumber: 'REC' + Date.now().toString().slice(-8),
      clientInfo: saleData.clientInfo,
      items: saleData.items,
      subtotal: saleData.subtotal,
      tax: saleData.tax || 0,
      discount: saleData.discount || 0,
      total: saleData.total,
      paymentMethod: saleData.paymentMethod,
      transactionDate: new Date(),
      status: 'generated'
    };
    this.receipts.unshift(receipt);
    await this.persist();
    return receipt;
  }

  async formatReceiptAsText(receipt: DigitalReceipt, templateId?: string): Promise<string> {
    await this.delay(200);

    const template = this.templates.find(t => t.id === (templateId || this.config.templateId)) || this.templates[0];

    let text = `${template.header}\n`;
    text += '='.repeat(50) + '\n';
    text += `Reçu N°: ${receipt.receiptNumber}\n`;
    text += `Date: ${receipt.transactionDate.toLocaleString()}\n`;
    text += `Client: ${receipt.clientInfo.name}\n`;
    text += `Téléphone: ${receipt.clientInfo.phone}\n`;
    if (receipt.clientInfo.email) {
      text += `Email: ${receipt.clientInfo.email}\n`;
    }
    text += '\n';

    text += 'DÉTAIL DES ARTICLES\n';
    text += '-'.repeat(50) + '\n';
    receipt.items.forEach(item => {
      text += `${item.productName.padEnd(20)} ${item.quantity}x${formatCurrency(item.unitPrice)} = ${formatCurrency(item.totalPrice)}\n`;
    });

    text += '\n' + '-'.repeat(50) + '\n';
    text += `Sous-total: ${formatCurrency(receipt.subtotal)}\n`;

    if (template.includeDiscount && receipt.discount > 0) {
      text += `Remise: -${formatCurrency(receipt.discount)}\n`;
    }

    if (template.includeTax && receipt.tax > 0) {
      text += `Taxes: ${formatCurrency(receipt.tax)}\n`;
    }

    text += 'TOTAL: ' + '='.repeat(20) + '\n';
    text += `${formatCurrency(receipt.total)}\n`;
    text += '\n';

    text += `Paiement: ${this.getPaymentMethodText(receipt.paymentMethod)}\n`;
    text += '\n';

    text += `${template.footer}\n`;

    return text;
  }

  async formatReceiptAsHTML(receipt: DigitalReceipt, templateId?: string): Promise<string> {
    await this.delay(300);

    const template = this.templates.find(t => t.id === (templateId || this.config.templateId)) || this.templates[0];

    let html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0; color: #333;">${template.header.replace(/\n/g, '<br>')}</h2>
        </div>

        <div style="border: 1px solid #ddd; padding: 20px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <div>
              <strong>Reçu N°:</strong> ${receipt.receiptNumber}<br>
              <strong>Date:</strong> ${receipt.transactionDate.toLocaleString()}
            </div>
          </div>

          <div style="margin-bottom: 15px;">
            <strong>Client:</strong><br>
            ${receipt.clientInfo.name}<br>
            ${receipt.clientInfo.phone}<br>
            ${receipt.clientInfo.email ? receipt.clientInfo.email + '<br>' : ''}
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Article</th>
                <th style="padding: 8px; text-align: right; border: 1px solid #ddd;">Qté</th>
                <th style="padding: 8px; text-align: right; border: 1px solid #ddd;">Prix</th>
                <th style="padding: 8px; text-align: right; border: 1px solid #ddd;">Total</th>
              </tr>
            </thead>
            <tbody>
    `;

    receipt.items.forEach(item => {
      html += `
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;">${item.productName}</td>
                <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${item.quantity}</td>
                <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${formatCurrency(item.unitPrice)}</td>
                <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${formatCurrency(item.totalPrice)}</td>
              </tr>
      `;
    });

    html += `
            </tbody>
          </table>

          <div style="text-align: right;">
            <div>Sous-total: ${formatCurrency(receipt.subtotal)}</div>
    `;

    if (template.includeDiscount && receipt.discount > 0) {
      html += `<div>Remise: -${formatCurrency(receipt.discount)}</div>`;
    }

    if (template.includeTax && receipt.tax > 0) {
      html += `<div>Taxes: ${formatCurrency(receipt.tax)}</div>`;
    }

    html += `
            <div style="font-size: 18px; font-weight: bold; margin-top: 10px;">
              TOTAL: ${formatCurrency(receipt.total)}
            </div>
          </div>

          <div style="margin-top: 15px;">
            <strong>Méthode de paiement:</strong> ${this.getPaymentMethodText(receipt.paymentMethod)}
          </div>
        </div>

        <div style="text-align: center; font-size: 12px; color: #666;">
          ${template.footer.replace(/\n/g, '<br>')}
        </div>
      </div>
    `;

    return html;
  }

  async sendReceiptByEmail(receipt: DigitalReceipt, email: string, templateId?: string): Promise<boolean> {
    await this.delay(1000);

    const htmlContent = await this.formatReceiptAsHTML(receipt, templateId);
    const subject = this.config.emailSubject;

    console.log(`Sending email to ${email}:`, {
      subject,
      html: htmlContent
    });

    const mockSuccessRate = 0.9;
    const ok = Math.random() < mockSuccessRate;
    if (ok) {
      const updated = { ...receipt, status: 'sent' as const };
      this.receipts = [updated, ...this.receipts.filter(r => r.id !== receipt.id)];
      await this.persist();
    }
    return ok;
  }

  async sendReceiptBySMS(receipt: DigitalReceipt, phone: string): Promise<boolean> {
    await this.delay(1500);

    const message = this.config.smsTemplate
      .replace('{receiptNumber}', receipt.receiptNumber)
      .replace('{total}', formatCurrency(receipt.total));

    console.log(`Sending SMS to ${phone}:`, message);

    const mockSuccessRate = 0.85;
    return Math.random() < mockSuccessRate;
  }

  async printReceipt(receipt: DigitalReceipt, templateId?: string): Promise<boolean> {
    await this.delay(800);

    const textContent = await this.formatReceiptAsText(receipt, templateId);
    console.log('Printing receipt:', textContent);

    const mockSuccessRate = 0.95;
    const ok = Math.random() < mockSuccessRate;
    if (ok) {
      const updated = { ...receipt, status: 'printed' as const };
      this.receipts = [updated, ...this.receipts.filter(r => r.id !== receipt.id)];
      await this.persist();
    }
    return ok;
  }

  async getReceiptTemplates(): Promise<ReceiptTemplate[]> {
    await this.delay(200);
    return this.templates;
  }

  async updateConfig(config: Partial<ReceiptConfig>): Promise<ReceiptConfig> {
    await this.delay(300);
    this.config = { ...this.config, ...config };
    return this.config;
  }

  async getConfig(): Promise<ReceiptConfig> {
    await this.delay(100);
    return this.config;
  }

  async getRecentReceipts(limit = 50): Promise<DigitalReceipt[]> {
    await this.delay(80);
    return this.receipts.slice(0, limit);
  }

  async generateReceiptPDF(receipt: DigitalReceipt, templateId?: string): Promise<Blob> {
    await this.delay(1000);

    const htmlContent = await this.formatReceiptAsHTML(receipt, templateId);

    console.log('Generating PDF receipt:', receipt.receiptNumber);

    const mockPDF = new Blob(['Mock PDF content'], { type: 'application/pdf' });
    return mockPDF;
  }

  async createCustomTemplate(template: Omit<ReceiptTemplate, 'id'>): Promise<ReceiptTemplate> {
    await this.delay(500);

    const newTemplate: ReceiptTemplate = {
      ...template,
      id: this.generateId()
    };

    this.templates.push(newTemplate);
    return newTemplate;
  }

  async updateTemplate(id: string, updates: Partial<ReceiptTemplate>): Promise<ReceiptTemplate> {
    await this.delay(300);

    const index = this.templates.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Template not found');
    }

    this.templates[index] = { ...this.templates[index], ...updates };
    return this.templates[index];
  }

  async deleteTemplate(id: string): Promise<void> {
    await this.delay(200);
    this.templates = this.templates.filter(t => t.id !== id);
  }

  async duplicateTemplate(id: string, newName: string): Promise<ReceiptTemplate> {
    await this.delay(400);

    const originalTemplate = this.templates.find(t => t.id === id);
    if (!originalTemplate) {
      throw new Error('Template not found');
    }

    const duplicatedTemplate: ReceiptTemplate = {
      ...originalTemplate,
      id: this.generateId(),
      name: newName
    };

    this.templates.push(duplicatedTemplate);
    return duplicatedTemplate;
  }

  async getReceiptStatistics(startDate?: Date, endDate?: Date): Promise<{
    totalReceipts: number;
    totalRevenue: number;
    averageTransactionValue: number;
    receiptsByPaymentMethod: Record<string, number>;
    receiptsByTemplate: Record<string, number>;
    receiptsByStatus: Record<string, number>;
  }> {
    await this.delay(600);

    const mockReceipts = this.generateMockReceipts();
    let filteredReceipts = mockReceipts;

    if (startDate) {
      filteredReceipts = filteredReceipts.filter(r => r.transactionDate >= startDate);
    }
    if (endDate) {
      filteredReceipts = filteredReceipts.filter(r => r.transactionDate <= endDate);
    }

    const totalReceipts = filteredReceipts.length;
    const totalRevenue = filteredReceipts.reduce((sum, r) => sum + r.total, 0);
    const averageTransactionValue = totalReceipts > 0 ? totalRevenue / totalReceipts : 0;

    const receiptsByPaymentMethod: Record<string, number> = {};
    const receiptsByTemplate: Record<string, number> = {};
    const receiptsByStatus: Record<string, number> = {};

    filteredReceipts.forEach(receipt => {
      receiptsByPaymentMethod[receipt.paymentMethod] = (receiptsByPaymentMethod[receipt.paymentMethod] || 0) + 1;
      receiptsByTemplate[this.config.templateId] = (receiptsByTemplate[this.config.templateId] || 0) + 1;
      receiptsByStatus[receipt.status] = (receiptsByStatus[receipt.status] || 0) + 1;
    });

    return {
      totalReceipts,
      totalRevenue,
      averageTransactionValue,
      receiptsByPaymentMethod,
      receiptsByTemplate,
      receiptsByStatus
    };
  }

  async sendBulkReceipts(
    receipts: DigitalReceipt[],
    method: 'email' | 'sms' | 'print'
  ): Promise<{success: number, failed: number, errors: string[]}> {
    await this.delay(1500);

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const receipt of receipts) {
      try {
        let result = false;

        switch (method) {
          case 'email':
            if (receipt.clientInfo.email) {
              result = await this.sendReceiptByEmail(receipt, receipt.clientInfo.email);
            } else {
              errors.push(`No email for receipt ${receipt.receiptNumber}`);
              failed++;
              continue;
            }
            break;
          case 'sms':
            result = await this.sendReceiptBySMS(receipt, receipt.clientInfo.phone);
            break;
          case 'print':
            result = await this.printReceipt(receipt);
            break;
        }

        if (result) {
          success++;
        } else {
          failed++;
          errors.push(`Failed to send receipt ${receipt.receiptNumber}`);
        }
      } catch (error) {
        failed++;
        errors.push(`Error with receipt ${receipt.receiptNumber}: ${error}`);
      }
    }

    return { success, failed, errors };
  }

  async scheduleAutomaticReceipts(
    saleData: {
      saleId: string;
      clientInfo: { name: string; phone: string; email?: string };
      items: ReceiptItem[];
      subtotal: number;
      tax?: number;
      discount?: number;
      total: number;
      paymentMethod: string;
    },
    schedule: {
      sendEmail: boolean;
      sendSMS: boolean;
      sendPrint: boolean;
      delayMinutes?: number;
    }
  ): Promise<{receipt: DigitalReceipt, scheduled: string[]}> {
    await this.delay(800);

    const receipt = await this.generateReceipt(saleData);
    const scheduled: string[] = [];

    if (schedule.sendEmail && saleData.clientInfo.email) {
      scheduled.push('email');
    }
    if (schedule.sendSMS) {
      scheduled.push('sms');
    }
    if (schedule.sendPrint) {
      scheduled.push('print');
    }

    console.log(`Scheduled automatic receipt delivery for ${receipt.receiptNumber}:`, scheduled);

    return { receipt, scheduled };
  }

  private generateMockReceipts(): DigitalReceipt[] {
    const mockReceipts: DigitalReceipt[] = [];
    const paymentMethods = ['orange_money', 'mtn_money', 'cash', 'bank_transfer'];

    for (let i = 0; i < 100; i++) {
      const date = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      const amount = Math.floor(Math.random() * 50000) + 1000;

      mockReceipts.push({
        id: `receipt_${i}`,
        saleId: `sale_${i}`,
        receiptNumber: `REC${String(i).padStart(6, '0')}`,
        clientInfo: {
          name: `Client ${i}`,
          phone: `+225${Math.floor(Math.random() * 100000000)}`,
          email: `client${i}@example.com`
        },
        items: [
          {
            productId: '1',
            productName: 'Tomates',
            quantity: 2,
            unitPrice: 500,
            totalPrice: 1000,
            category: 'légumes'
          }
        ],
        subtotal: amount - 100,
        tax: 50,
        discount: 50,
        total: amount,
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        transactionDate: date,
        status: 'generated'
      });
    }

    return mockReceipts;
  }

  private getPaymentMethodText(method: string): string {
    const methods: Record<string, string> = {
      'orange_money': 'Orange Money',
      'mtn_money': 'MTN Mobile Money',
      'wave': 'Wave',
      'moov_money': 'Moov Money',
      'cash': 'Espèces',
      'bank_transfer': 'Virement Bancaire',
      'credit': 'Crédit Client'
    };
    return methods[method] || method;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
