import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/format';
import { Switch } from '@/components/ui/switch';
import {
  Calendar,
  Megaphone,
  Gift,
  Target,
  Users,
  TrendingUp,
  Clock,
  Star,
  Award,
  Plus,
  Edit,
  Trash2,
  Eye,
  Share2
} from 'lucide-react';

interface Campaign {
  id: string;
  title: string;
  description: string;
  type: 'discount' | 'bundle' | 'loyalty' | 'seasonal';
  targetAudience: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: 'draft' | 'active' | 'paused' | 'completed';
  metrics: {
    reach: number;
    engagement: number;
    conversions: number;
    roi: number;
  };
  visual?: string;
}

const MarketingCampaignManager = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    dateRange: 'all'
  });

  // Mock campaigns data
  useEffect(() => {
    setCampaigns([
      {
        id: '1',
        title: 'Promotion Fruits de Saison',
        description: '20% de réduction sur tous les fruits frais',
        type: 'discount',
        targetAudience: 'clients-fideles',
        startDate: '2024-01-15',
        endDate: '2024-01-31',
        budget: 50000,
        status: 'active',
        metrics: {
          reach: 2500,
          engagement: 380,
          conversions: 95,
          roi: 1.8
        },
        visual: '🍎'
      },
      {
        id: '2',
        title: 'Pack Légumes Bio',
        description: 'Panier mixte de légumes biologiques à prix préférentiel',
        type: 'bundle',
        targetAudience: 'nouveaux-clients',
        startDate: '2024-02-01',
        endDate: '2024-02-28',
        budget: 75000,
        status: 'draft',
        metrics: {
          reach: 0,
          engagement: 0,
          conversions: 0,
          roi: 0
        },
        visual: '🥬'
      },
      {
        id: '3',
        title: 'Programme de Fidélité',
        description: 'Cumulez des points et bénéficiez d\'avantages exclusifs',
        type: 'loyalty',
        targetAudience: 'tous',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        budget: 200000,
        status: 'active',
        metrics: {
          reach: 5000,
          engagement: 1200,
          conversions: 300,
          roi: 2.5
        },
        visual: '⭐'
      }
    ]);
  }, []);

  const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({
    title: '',
    description: '',
    type: 'discount',
    targetAudience: 'tous',
    startDate: '',
    endDate: '',
    budget: 0,
    status: 'draft',
    metrics: {
      reach: 0,
      engagement: 0,
      conversions: 0,
      roi: 0
    }
  });

  const campaignTypes = [
    { value: 'discount', label: 'Réduction', icon: '💰' },
    { value: 'bundle', label: 'Pack/Bundle', icon: '📦' },
    { value: 'loyalty', label: 'Fidélité', icon: '⭐' },
    { value: 'seasonal', label: 'Saisonnier', icon: '🌞' }
  ];

  const targetAudiences = [
    { value: 'tous', label: 'Tous les clients' },
    { value: 'clients-fideles', label: 'Clients fidèles' },
    { value: 'nouveaux-clients', label: 'Nouveaux clients' },
    { value: 'grands-comptes', label: 'Grands comptes' }
  ];

  const statusOptions = [
    { value: 'all', label: 'Tous', color: 'gray' },
    { value: 'draft', label: 'Brouillon', color: 'yellow' },
    { value: 'active', label: 'Actif', color: 'green' },
    { value: 'paused', label: 'En pause', color: 'orange' },
    { value: 'completed', label: 'Terminé', color: 'blue' }
  ];

  const filteredCampaigns = campaigns.filter(campaign => {
    if (filters.status !== 'all' && campaign.status !== filters.status) return false;
    if (filters.type !== 'all' && campaign.type !== filters.type) return false;
    return true;
  });

  const handleCreateCampaign = () => {
    if (newCampaign.title && newCampaign.description && newCampaign.startDate && newCampaign.endDate) {
      const campaign: Campaign = {
        id: Date.now().toString(),
        title: newCampaign.title,
        description: newCampaign.description,
        type: newCampaign.type as Campaign['type'],
        targetAudience: newCampaign.targetAudience!,
        startDate: newCampaign.startDate,
        endDate: newCampaign.endDate,
        budget: newCampaign.budget || 0,
        status: 'draft',
        metrics: {
          reach: 0,
          engagement: 0,
          conversions: 0,
          roi: 0
        },
        visual: campaignTypes.find(t => t.value === newCampaign.type)?.icon || '📢'
      };

      setCampaigns([...campaigns, campaign]);
      setNewCampaign({
        title: '',
        description: '',
        type: 'discount',
        targetAudience: 'tous',
        startDate: '',
        endDate: '',
        budget: 0,
        status: 'draft',
        metrics: { reach: 0, engagement: 0, conversions: 0, roi: 0 }
      });
      setIsCreating(false);
    }
  };

  const handleUpdateCampaign = (updatedCampaign: Campaign) => {
    setCampaigns(campaigns.map(c => c.id === updatedCampaign.id ? updatedCampaign : c));
    setEditingCampaign(null);
  };

  const handleDeleteCampaign = (campaignId: string) => {
    setCampaigns(campaigns.filter(c => c.id !== campaignId));
  };

  const handleStatusChange = (campaignId: string, newStatus: Campaign['status']) => {
    setCampaigns(campaigns.map(c =>
      c.id === campaignId ? { ...c, status: newStatus } : c
    ));
  };

  const getStatusBadge = (status: Campaign['status']) => {
    const statusConfig = {
      draft: { color: 'bg-yellow-100 text-yellow-800', label: 'Brouillon' },
      active: { color: 'bg-green-100 text-green-800', label: 'Actif' },
      paused: { color: 'bg-orange-100 text-orange-800', label: 'En pause' },
      completed: { color: 'bg-blue-100 text-blue-800', label: 'Terminé' }
    };

    const config = statusConfig[status];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getTypeIcon = (type: Campaign['type']) => {
    const typeConfig = {
      discount: '💰',
      bundle: '📦',
      loyalty: '⭐',
      seasonal: '🌞'
    };
    return typeConfig[type];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Campagnes Marketing</h2>
          <p className="text-gray-600">Créez et gérez vos campagnes promotionnelles</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Nouvelle campagne</span>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Campagnes actives</p>
                <p className="text-2xl font-bold">{campaigns.filter(c => c.status === 'active').length}</p>
              </div>
              <Megaphone className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reach total</p>
                <p className="text-2xl font-bold">
                  {campaigns.reduce((sum, c) => sum + c.metrics.reach, 0).toLocaleString()}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversions</p>
                <p className="text-2xl font-bold">
                  {campaigns.reduce((sum, c) => sum + c.metrics.conversions, 0)}
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ROI moyen</p>
                <p className="text-2xl font-bold">
                  {campaigns.length > 0
                    ? (campaigns.reduce((sum, c) => sum + c.metrics.roi, 0) / campaigns.length).toFixed(1)
                    : '0'
                  }x
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Label className="text-sm">Statut:</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Label className="text-sm">Type:</Label>
              <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  {campaignTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Creation Form */}
      <AnimatePresence>
        {(isCreating || editingCampaign) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingCampaign ? 'Modifier la campagne' : 'Nouvelle campagne'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Titre</Label>
                    <Input
                      id="title"
                      value={editingCampaign ? editingCampaign.title : newCampaign.title || ''}
                      onChange={(e) =>
                        editingCampaign
                          ? setEditingCampaign({...editingCampaign, title: e.target.value})
                          : setNewCampaign({...newCampaign, title: e.target.value})
                      }
                      placeholder="Titre de la campagne"
                    />
                  </div>

                  <div>
                    <Label htmlFor="type">Type de campagne</Label>
                    <Select
                      value={editingCampaign ? editingCampaign.type : newCampaign.type || 'discount'}
                      onValueChange={(value) =>
                        editingCampaign
                          ? setEditingCampaign({...editingCampaign, type: value as Campaign['type']})
                          : setNewCampaign({...newCampaign, type: value as Campaign['type']})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {campaignTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="target">Cible</Label>
                    <Select
                      value={editingCampaign ? editingCampaign.targetAudience : newCampaign.targetAudience || 'tous'}
                      onValueChange={(value) =>
                        editingCampaign
                          ? setEditingCampaign({...editingCampaign, targetAudience: value})
                          : setNewCampaign({...newCampaign, targetAudience: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {targetAudiences.map(audience => (
                          <SelectItem key={audience.value} value={audience.value}>
                            {audience.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="budget">Budget (FCFA)</Label>
                    <Input
                      id="budget"
                      type="number"
                      value={editingCampaign ? editingCampaign.budget : newCampaign.budget || 0}
                      onChange={(e) =>
                        editingCampaign
                          ? setEditingCampaign({...editingCampaign, budget: parseInt(e.target.value) || 0})
                          : setNewCampaign({...newCampaign, budget: parseInt(e.target.value) || 0})
                      }
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="startDate">Date de début</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={editingCampaign ? editingCampaign.startDate : newCampaign.startDate || ''}
                      onChange={(e) =>
                        editingCampaign
                          ? setEditingCampaign({...editingCampaign, startDate: e.target.value})
                          : setNewCampaign({...newCampaign, startDate: e.target.value})
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="endDate">Date de fin</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={editingCampaign ? editingCampaign.endDate : newCampaign.endDate || ''}
                      onChange={(e) =>
                        editingCampaign
                          ? setEditingCampaign({...editingCampaign, endDate: e.target.value})
                          : setNewCampaign({...newCampaign, endDate: e.target.value})
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editingCampaign ? editingCampaign.description : newCampaign.description || ''}
                    onChange={(e) =>
                      editingCampaign
                        ? setEditingCampaign({...editingCampaign, description: e.target.value})
                        : setNewCampaign({...newCampaign, description: e.target.value})
                    }
                    placeholder="Description de la campagne"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false);
                      setEditingCampaign(null);
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={() =>
                      editingCampaign
                        ? handleUpdateCampaign(editingCampaign)
                        : handleCreateCampaign()
                    }
                  >
                    {editingCampaign ? 'Mettre à jour' : 'Créer la campagne'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Campaigns List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCampaigns.map((campaign) => (
          <motion.div
            key={campaign.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{getTypeIcon(campaign.type)}</div>
                    <div>
                      <CardTitle className="text-lg">{campaign.title}</CardTitle>
                      <p className="text-sm text-gray-600">{campaign.description}</p>
                    </div>
                  </div>
                  {getStatusBadge(campaign.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Période</p>
                    <p className="font-medium">
                      {new Date(campaign.startDate).toLocaleDateString('fr-FR')} - {new Date(campaign.endDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Budget</p>
                    <p className="font-medium">{formatCurrency(campaign.budget)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <p className="text-xs text-gray-600">Reach</p>
                    <p className="font-bold text-sm">{campaign.metrics.reach.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Engagement</p>
                    <p className="font-bold text-sm">{campaign.metrics.engagement}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Conversions</p>
                    <p className="font-bold text-sm">{campaign.metrics.conversions}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">ROI</p>
                    <p className="font-bold text-sm">{campaign.metrics.roi}x</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="flex space-x-2">
                    {campaign.status === 'draft' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(campaign.id, 'active')}
                      >
                        Activer
                      </Button>
                    )}
                    {campaign.status === 'active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(campaign.id, 'paused')}
                      >
                        Pauser
                      </Button>
                    )}
                    {campaign.status === 'paused' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(campaign.id, 'active')}
                      >
                        Reprendre
                      </Button>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingCampaign(campaign)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteCampaign(campaign.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredCampaigns.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Megaphone className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune campagne trouvée
            </h3>
            <p className="text-gray-500 mb-4">
              Créez votre première campagne marketing pour commencer à promouvoir vos produits.
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer une campagne
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MarketingCampaignManager;
