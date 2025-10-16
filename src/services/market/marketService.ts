// Mock marketplace publication service

export interface MarketOffer {
  id: string;
  productName: string;
  category?: string;
  quantity: number;
  unit: string;
  priceTarget?: number;
  publishedAt: string;
  status: 'published' | 'archived';
}

const LS_MARKET = 'market_offers';

function load(): MarketOffer[] {
  try {
    const raw = localStorage.getItem(LS_MARKET);
    return raw ? (JSON.parse(raw) as MarketOffer[]) : [];
  } catch {
    return [];
  }
}

function save(data: MarketOffer[]) {
  try { localStorage.setItem(LS_MARKET, JSON.stringify(data)); } catch {
    // Silently ignore localStorage errors as this is non-critical data
    // In production, this could be logged to an error tracking service
  }
}

export const marketService = {
  list(): MarketOffer[] { return load(); },
  publish(input: Omit<MarketOffer, 'id' | 'publishedAt' | 'status'>): MarketOffer {
    const items = load();
    const offer: MarketOffer = {
      id: `mk_${Date.now()}`,
      publishedAt: new Date().toISOString(),
      status: 'published',
      ...input,
    };
    items.unshift(offer);
    save(items);
    return offer;
  },
  archive(id: string) {
    const items = load().map(o => (o.id === id ? { ...o, status: 'archived' as const } : o));
    save(items);
  },
};

