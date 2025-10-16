import { useState, useEffect } from 'react';
import { memberService, CooperativeMember } from '@/services/cooperative/memberService';

export function useMembers() {
  const [members, setMembers] = useState<CooperativeMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMembers = () => {
    try {
      const data = memberService.getAll();
      setMembers(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des membres');
      console.error('Error loading members:', err);
    } finally {
      setLoading(false);
    }
  };

  const addMember = (memberData: Omit<CooperativeMember, 'id' | 'joinDate' | 'status'>) => {
    try {
      const newMember = memberService.create(memberData);
      setMembers(prev => [...prev, newMember]);
      return newMember;
    } catch (err) {
      setError('Erreur lors de l\'ajout du membre');
      console.error('Error adding member:', err);
      throw err;
    }
  };

  const updateMember = (id: string, updates: Partial<CooperativeMember>) => {
    try {
      const updatedMember = memberService.update(id, updates);
      if (updatedMember) {
        setMembers(prev => prev.map(m => m.id === id ? updatedMember : m));
        return updatedMember;
      }
      throw new Error('Membre non trouvé');
    } catch (err) {
      setError('Erreur lors de la mise à jour du membre');
      console.error('Error updating member:', err);
      throw err;
    }
  };

  const deleteMember = (id: string) => {
    try {
      const success = memberService.delete(id);
      if (success) {
        setMembers(prev => prev.filter(m => m.id !== id));
        return true;
      }
      throw new Error('Membre non trouvé');
    } catch (err) {
      setError('Erreur lors de la suppression du membre');
      console.error('Error deleting member:', err);
      throw err;
    }
  };

  const activateMember = (id: string) => {
    try {
      const success = memberService.activateMember(id);
      if (success) {
        setMembers(prev => prev.map(m => m.id === id ? { ...m, status: 'active' as const } : m));
        return true;
      }
      throw new Error('Membre non trouvé');
    } catch (err) {
      setError('Erreur lors de l\'activation du membre');
      console.error('Error activating member:', err);
      throw err;
    }
  };

  const searchMembers = (query: string) => {
    try {
      return memberService.search(query);
    } catch (err) {
      setError('Erreur lors de la recherche');
      console.error('Error searching members:', err);
      return [];
    }
  };

  const filterMembers = (filters: { status?: string; role?: string; location?: string }) => {
    try {
      let filtered = members;

      if (filters.status) {
        filtered = memberService.filterByStatus(filters.status);
      }

      if (filters.role) {
        filtered = filtered.filter(m => m.role === filters.role);
      }

      if (filters.location) {
        filtered = memberService.filterByLocation(filters.location);
      }

      return filtered;
    } catch (err) {
      setError('Erreur lors du filtrage');
      console.error('Error filtering members:', err);
      return [];
    }
  };

  const getStats = () => {
    try {
      return memberService.getStats();
    } catch (err) {
      setError('Erreur lors du calcul des statistiques');
      console.error('Error getting stats:', err);
      return {
        total: 0,
        active: 0,
        pending: 0,
        suspended: 0,
        inactive: 0,
        totalContributions: 0,
        averageContribution: 0,
        newThisMonth: 0,
        roleDistribution: {}
      };
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  return {
    members,
    loading,
    error,
    addMember,
    updateMember,
    deleteMember,
    activateMember,
    searchMembers,
    filterMembers,
    getStats,
    refresh: loadMembers
  };
}