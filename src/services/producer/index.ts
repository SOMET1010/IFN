/**
 * Services producteurs - Index principal
 * Centralise tous les services liés aux fonctionnalités des producteurs
 */

// Services de base (existants - localStorage)
export * from './accountService';
export * from './analyticsService';
export * from './logisticsService';
export * from './marketTrendsService';
export * from './producerVerificationService';

// Services avancés (nouveaux avec Supabase)
export * from './producerHarvests.service';
export * from './producerProduction.service';
export * from './producerSales.service';

// Note: Les anciens services (producerHarvestService, producerOfferService, producerSaleService)
// utilisent encore localStorage via BaseService. Ils seront graduellement remplacés par les
// nouveaux services Supabase ci-dessus.
