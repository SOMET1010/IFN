import { useState, useEffect } from 'react';
import {
  harvestService,
  HarvestRecord,
  HarvestForecast,
  HarvestQuality,
  HarvestProcessing,
  HarvestRecordFormData,
  HarvestForecastFormData,
  HarvestQualityFormData,
  HarvestProcessingFormData
} from '@/services/cooperative/harvestService';

export function useHarvests() {
  const [records, setRecords] = useState<HarvestRecord[]>([]);
  const [forecasts, setForecasts] = useState<HarvestForecast[]>([]);
  const [qualityChecks, setQualityChecks] = useState<HarvestQuality[]>([]);
  const [processing, setProcessing] = useState<HarvestProcessing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    try {
      const recordsData = harvestService.getAllRecords();
      const forecastsData = harvestService.getAllForecasts();
      const qualityData = harvestService.getAllQualityChecks();
      const processingData = harvestService.getAllProcessing();

      setRecords(recordsData);
      setForecasts(forecastsData);
      setQualityChecks(qualityData);
      setProcessing(processingData);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des données de récolte');
      console.error('Error loading harvest data:', err);
    } finally {
      setLoading(false);
    }
  };

  // CRUD pour les enregistrements de récolte
  const createRecord = (recordData: HarvestRecordFormData) => {
    try {
      const newRecord = harvestService.createRecord(recordData);
      setRecords(prev => [newRecord, ...prev]);
      return newRecord;
    } catch (err) {
      setError('Erreur lors de la création de l\'enregistrement de récolte');
      console.error('Error creating harvest record:', err);
      throw err;
    }
  };

  const updateRecord = (id: string, updates: Partial<HarvestRecordFormData>) => {
    try {
      const updatedRecord = harvestService.updateRecord(id, updates);
      if (updatedRecord) {
        setRecords(prev => prev.map(r => r.id === id ? updatedRecord : r));
        return updatedRecord;
      }
      throw new Error('Enregistrement de récolte non trouvé');
    } catch (err) {
      setError('Erreur lors de la mise à jour de l\'enregistrement de récolte');
      console.error('Error updating harvest record:', err);
      throw err;
    }
  };

  const deleteRecord = (id: string) => {
    try {
      const success = harvestService.deleteRecord(id);
      if (success) {
        setRecords(prev => prev.filter(r => r.id !== id));
        return true;
      }
      throw new Error('Enregistrement de récolte non trouvé');
    } catch (err) {
      setError('Erreur lors de la suppression de l\'enregistrement de récolte');
      console.error('Error deleting harvest record:', err);
      throw err;
    }
  };

  // CRUD pour les prévisions de récolte
  const createForecast = (forecastData: HarvestForecastFormData) => {
    try {
      const newForecast = harvestService.createForecast(forecastData);
      setForecasts(prev => [...prev, newForecast]);
      return newForecast;
    } catch (err) {
      setError('Erreur lors de la création de la prévision de récolte');
      console.error('Error creating harvest forecast:', err);
      throw err;
    }
  };

  const updateForecast = (id: string, updates: Partial<HarvestForecastFormData>) => {
    try {
      const updatedForecast = harvestService.updateForecast(id, updates);
      if (updatedForecast) {
        setForecasts(prev => prev.map(f => f.id === id ? updatedForecast : f));
        return updatedForecast;
      }
      throw new Error('Prévision de récolte non trouvée');
    } catch (err) {
      setError('Erreur lors de la mise à jour de la prévision de récolte');
      console.error('Error updating harvest forecast:', err);
      throw err;
    }
  };

  // CRUD pour les contrôles qualité
  const createQualityCheck = (qualityData: HarvestQualityFormData) => {
    try {
      const newQualityCheck = harvestService.createQualityCheck(qualityData);
      setQualityChecks(prev => [...prev, newQualityCheck]);
      return newQualityCheck;
    } catch (err) {
      setError('Erreur lors de la création du contrôle qualité');
      console.error('Error creating quality check:', err);
      throw err;
    }
  };

  // CRUD pour le traitement des récoltes
  const createProcessing = (processingData: HarvestProcessingFormData) => {
    try {
      const newProcessing = harvestService.createProcessing(processingData);
      setProcessing(prev => [...prev, newProcessing]);
      return newProcessing;
    } catch (err) {
      setError('Erreur lors de la création de l\'enregistrement de traitement');
      console.error('Error creating processing record:', err);
      throw err;
    }
  };

  // Recherche et filtrage
  const searchRecords = (query: string) => {
    try {
      return harvestService.searchRecords(query);
    } catch (err) {
      setError('Erreur lors de la recherche des enregistrements de récolte');
      console.error('Error searching harvest records:', err);
      return [];
    }
  };

  const filterRecordsByStatus = (status: string) => {
    try {
      return harvestService.filterRecordsByStatus(status);
    } catch (err) {
      setError('Erreur lors du filtrage des enregistrements par statut');
      console.error('Error filtering records by status:', err);
      return [];
    }
  };

  const filterRecordsByProduct = (product: string) => {
    try {
      return harvestService.filterRecordsByProduct(product);
    } catch (err) {
      setError('Erreur lors du filtrage des enregistrements par produit');
      console.error('Error filtering records by product:', err);
      return [];
    }
  };

  const filterRecordsByMember = (memberId: string) => {
    try {
      return harvestService.filterRecordsByMember(memberId);
    } catch (err) {
      setError('Erreur lors du filtrage des enregistrements par membre');
      console.error('Error filtering records by member:', err);
      return [];
    }
  };

  // Statistiques
  const getStats = () => {
    try {
      return harvestService.getHarvestStats();
    } catch (err) {
      setError('Erreur lors du calcul des statistiques');
      console.error('Error getting harvest stats:', err);
      return {
        totalRecords: 0,
        totalHarvested: 0,
        totalValue: 0,
        averageYield: 0,
        activeForecasts: 0,
        qualityChecks: 0,
        qualityDistribution: {},
        byProduct: {},
        thisMonth: 0
      };
    }
  };

  // Export
  const exportRecordsToCSV = () => {
    try {
      return harvestService.exportRecordsToCSV();
    } catch (err) {
      setError('Erreur lors de l\'export des enregistrements');
      console.error('Error exporting harvest records:', err);
      return '';
    }
  };

  // Validation
  const validateRecord = (record: Partial<HarvestRecordFormData>) => {
    try {
      return harvestService.validateRecord(record);
    } catch (err) {
      setError('Erreur lors de la validation de l\'enregistrement');
      console.error('Error validating harvest record:', err);
      return { isValid: false, errors: ['Erreur de validation'] };
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    // Données
    records,
    forecasts,
    qualityChecks,
    processing,
    loading,
    error,

    // CRUD Enregistrements
    createRecord,
    updateRecord,
    deleteRecord,

    // CRUD Prévisions
    createForecast,
    updateForecast,

    // CRUD Qualité
    createQualityRecord: createQualityCheck,

    // CRUD Traitement
    createProcessing,

    // Recherche et filtrage
    searchRecords,
    filterRecordsByStatus,
    filterRecordsByProduct,
    filterRecordsByMember,

    // Utilitaires
    getHarvestStats: getStats,
    exportToCSV: exportRecordsToCSV,
    validateRecord,
    refresh: loadData,
  };
}
