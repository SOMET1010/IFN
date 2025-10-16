// Service CRUD complet pour la gestion des membres de la coopérative
import { MembershipApplication, membershipService } from './membershipService';

export interface CooperativeMember {
  id: string;
  name: string;
  role: 'Producteur' | 'Marchand' | 'Transformateur' | 'Éleveur' | 'Pêcheur';
  location: string;
  phone: string;
  email?: string;
  joinDate: string;
  contribution: number;
  products: string[];
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  farmSize?: number; // en hectares
  mainCrop?: string;
  monthlyProduction?: number;
  certifications?: string[];
  bankingInfo?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  notes?: string;
  lastActive?: string;
  photoUrl?: string;
}

const LS_KEY = 'cooperative_members';

function loadMembers(): CooperativeMember[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMembers(members: CooperativeMember[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(members));
  } catch {
    // ignore localStorage errors
  }
}

export const memberService = {
  // CRUD de base
  getAll(): CooperativeMember[] {
    return loadMembers();
  },

  getById(id: string): CooperativeMember | undefined {
    const members = loadMembers();
    return members.find(m => m.id === id);
  },

  create(memberData: Omit<CooperativeMember, 'id' | 'joinDate' | 'status'>): CooperativeMember {
    const members = loadMembers();
    const newMember: CooperativeMember = {
      id: `member_${Date.now()}`,
      joinDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      ...memberData,
    };

    members.push(newMember);
    saveMembers(members);

    // Synchroniser avec le service de membership
    membershipService.submit({
      name: newMember.name,
      phone: newMember.phone,
      role: newMember.role,
      location: newMember.location,
      documents: []
    });

    return newMember;
  },

  update(id: string, updates: Partial<CooperativeMember>): CooperativeMember | null {
    const members = loadMembers();
    const index = members.findIndex(m => m.id === id);

    if (index === -1) return null;

    members[index] = { ...members[index], ...updates };
    saveMembers(members);

    return members[index];
  },

  delete(id: string): boolean {
    const members = loadMembers();
    const index = members.findIndex(m => m.id === id);

    if (index === -1) return false;

    members.splice(index, 1);
    saveMembers(members);

    return true;
  },

  // Opérations spécifiques
  activateMember(id: string): boolean {
    const success = this.update(id, { status: 'active', lastActive: new Date().toISOString() });
    if (success) {
      // Synchroniser avec le service de membership
      const member = this.getById(id);
      if (member) {
        membershipService.activate(id.replace('member_', 'mb_'));
      }
    }
    return !!success;
  },

  suspendMember(id: string, reason?: string): boolean {
    const success = this.update(id, {
      status: 'suspended',
      notes: reason ? `${success?.notes || ''}\nSuspendu: ${reason}` : success?.notes
    });
    return !!success;
  },

  addContribution(id: string, amount: number): boolean {
    const member = this.getById(id);
    if (!member) return false;

    const newContribution = member.contribution + amount;
    return !!this.update(id, { contribution: newContribution });
  },

  updateProducts(id: string, products: string[]): boolean {
    return !!this.update(id, { products });
  },

  // Statistiques
  getStats() {
    const members = loadMembers();
    const active = members.filter(m => m.status === 'active');
    const totalContributions = members.reduce((sum, m) => sum + m.contribution, 0);

    return {
      total: members.length,
      active: active.length,
      pending: members.filter(m => m.status === 'pending').length,
      suspended: members.filter(m => m.status === 'suspended').length,
      inactive: members.filter(m => m.status === 'inactive').length,
      totalContributions,
      averageContribution: active.length > 0 ? totalContributions / active.length : 0,
      newThisMonth: members.filter(m => {
        const joinDate = new Date(m.joinDate);
        const now = new Date();
        return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
      }).length,
      roleDistribution: members.reduce((acc, m) => {
        acc[m.role] = (acc[m.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  },

  // Recherche et filtrage
  search(query: string): CooperativeMember[] {
    const members = loadMembers();
    const lowercaseQuery = query.toLowerCase();

    return members.filter(member =>
      member.name.toLowerCase().includes(lowercaseQuery) ||
      member.role.toLowerCase().includes(lowercaseQuery) ||
      member.location.toLowerCase().includes(lowercaseQuery) ||
      member.products.some(p => p.toLowerCase().includes(lowercaseQuery))
    );
  },

  filterByRole(role: string): CooperativeMember[] {
    const members = loadMembers();
    return members.filter(m => m.role === role);
  },

  filterByStatus(status: string): CooperativeMember[] {
    const members = loadMembers();
    return members.filter(m => m.status === status);
  },

  filterByLocation(location: string): CooperativeMember[] {
    const members = loadMembers();
    return members.filter(m => m.location.toLowerCase().includes(location.toLowerCase()));
  },

  // Export
  exportToCSV(): string {
    const members = loadMembers();
    const headers = [
      'ID', 'Nom', 'Rôle', 'Localisation', 'Téléphone', 'Email',
      'Date adhésion', 'Contribution', 'Statut', 'Produits'
    ];

    const rows = members.map(member => [
      member.id,
      member.name,
      member.role,
      member.location,
      member.phone,
      member.email || '',
      member.joinDate,
      member.contribution.toString(),
      member.status,
      member.products.join(';')
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  },

  // Validation
  validateMember(member: Partial<CooperativeMember>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!member.name || member.name.trim().length < 2) {
      errors.push('Le nom doit contenir au moins 2 caractères');
    }

    if (!member.role || !['Producteur', 'Marchand', 'Transformateur', 'Éleveur', 'Pêcheur'].includes(member.role)) {
      errors.push('Rôle invalide');
    }

    if (!member.location || member.location.trim().length < 2) {
      errors.push('La localisation est requise');
    }

    if (!member.phone || !/^\+?\d{8,15}$/.test(member.phone.replace(/\s/g, ''))) {
      errors.push('Numéro de téléphone invalide');
    }

    if (member.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)) {
      errors.push('Email invalide');
    }

    if (member.contribution && member.contribution < 0) {
      errors.push('La contribution ne peut être négative');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};