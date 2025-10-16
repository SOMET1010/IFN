import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/format';
import {
  Tag,
  Percent,
  Gift,
  Timer,
  Target,
  TrendingUp,
  Users,
  Star,
  Plus,
  Edit,
  Trash2,
  Copy,
  Share2,
  Calendar,
  DollarSign
} from 'lucide-react';

interface Promotion {
  id: string;
  title: string;
  description: string;
  type: 'percentage' | 'fixed' | 'buy_x_get_y' | 'free_shipping' | 'bundle';
  value: number;
  minValue?: number;
  maxUses?: number;
  currentUses: number;
  startDate: string;
  endDate: string;
  code?: string;
  applicableProducts: string[];
  targetUsers: string[];
  status: 'draft' | 'active' | 'expired' | 'paused';
  autoApply: boolean;
  metrics: {
    views: number;
    uses: number;
    revenue: number;
    conversionRate: number;
  };
}

const PromotionsManager = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    activeOnly: true
  });

  useEffect(() => {
    setPromotions([
      {
        id: '1',
        title: '20% de réduction sur les fruits',
        description: 'Profitez de 20% de réduction sur tous les fruits frais',
        type: 'percentage',
        value: 20,
        minValue: 5000,
        maxUses: 100,
        currentUses: 67,
        startDate: '2024-01-15',
        endDate: '2024-02-15',
        code: 'FRUITS20',
        applicableProducts: ['1', '2', '3'],
        targetUsers: ['tous'],
        status: 'active',
        autoApply: false,
        metrics: {
          views: 1250,
          uses: 67,
          revenue: 89000,
          conversionRate: 5.4
        }
      },
      {
        id: '2',
        title: 'Livraison offerte dès 10.000 FCFA',
        description: 'Bénéficiez de la livraison gratuite sur toutes les commandes de 10.000 FCFA et plus',
        type: 'free_shipping',
        value: 0,
        minValue: 10000,
        maxUses: null,
        currentUses: 234,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        applicableProducts: [],
        targetUsers: ['tous'],
        status: 'active',
        autoApply: true,
        metrics: {
          views: 3400,
          uses: 234,
          revenue: 456000,
          conversionRate: 6.9
        }
      },
      {
        id: '3',
        title: 'Pack Légumes Bio -15%',
        description: 'Panier de légumes biologiques à prix réduit',
        type: 'bundle',
        value: 15,
        minValue: 8000,
        maxUses: 50,
        currentUses: 23,
        startDate: '2024-01-20',
        endDate: '2024-02-20',
        code: 'BIO15',
        applicableProducts: ['4', '5', '6'],
        targetUsers: ['clients-fideles'],
        status: 'active',
        autoApply: false,
        metrics: {
          views: 890,
          uses: 23,
          revenue: 125000,
          conversionRate: 2.6
        }
      }
    ]);
  }, []);

  const [newPromotion, setNewPromotion] = useState<Partial<Promotion>>({
    title: '',
    description: '',
    type: 'percentage',
    value: 0,
    minValue: 0,
    maxUses: null,
    currentUses: 0,
    startDate: '',
    endDate: '',
    code: '',
    applicableProducts: [],
    targetUsers: ['tous'],
    status: 'draft',
    autoApply: false,
    metrics: {
      views: 0,
      uses: 0,
      revenue: 0,
      conversionRate: 0
    }
  });

  const promotionTypes = [
    { value: 'percentage', label: 'Pourcentage', icon: '%' },
    { value: 'fixed', label: 'Montant fixe', icon: '€' },
    { value: 'buy_x_get_y', label: 'Achat X + Y gratuit', icon: '🎁' },
    { value: 'free_shipping', label: 'Livraison gratuite', icon: '🚚' },
    { value: 'bundle', label: 'Pack promotionnel', icon: '📦' }
  ];

  const targetUserOptions = [
    { value: 'tous', label: 'Tous les clients' },
    { value: 'clients-fideles', label: 'Clients fidèles' },
    { value: 'nouveaux-clients', label: 'Nouveaux clients' },
    { value: 'membres-premium', label: 'Membres premium' }
  ];

  const generatePromoCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const filteredPromotions = promotions.filter(promo => {
    if (filters.status !== 'all' && promo.status !== filters.status) return false;
    if (filters.type !== 'all' && promo.type !== filters.type) return false;
    if (filters.activeOnly && promo.status !== 'active') return false;
    return true;
  });

  const handleCreatePromotion = () => {
    if (newPromotion.title && newPromotion.description && newPromotion.startDate && newPromotion.endDate) {
      const promotion: Promotion = {
        id: Date.now().toString(),
        title: newPromotion.title,
        description: newPromotion.description,
        type: newPromotion.type as Promotion['type'],
        value: newPromotion.value || 0,
        minValue: newPromotion.minValue || 0,
        maxUses: newPromotion.maxUses || null,
        currentUses: 0,
        startDate: newPromotion.startDate,
        endDate: newPromotion.endDate,
        code: newPromotion.code || generatePromoCode(),
        applicableProducts: newPromotion.applicableProducts || [],
        targetUsers: newPromotion.targetUsers || ['tous'],
        status: 'draft',
        autoApply: newPromotion.autoApply || false,
        metrics: {
          views: 0,
          uses: 0,
          revenue: 0,
          conversionRate: 0
        }
      };

      setPromotions([...promotions, promotion]);
      setNewPromotion({
        title: '',
        description: '',
        type: 'percentage',
        value: 0,
        minValue: 0,
        maxUses: null,
        currentUses: 0,
        startDate: '',
        endDate: '',
        code: '',
        applicableProducts: [],
        targetUsers: ['tous'],
        status: 'draft',
        autoApply: false,
        metrics: { views: 0, uses: 0, revenue: 0, conversionRate: 0 }
      });
      setIsCreating(false);
    }
  };

  const handleUpdatePromotion = (updatedPromotion: Promotion) => {
    setPromotions(promotions.map(p => p.id === updatedPromotion.id ? updatedPromotion : p));
    setEditingPromotion(null);
  };

  const handleDeletePromotion = (promotionId: string) => {
    setPromotions(promotions.filter(p => p.id !== promotionId));
  };

  const handleStatusChange = (promotionId: string, newStatus: Promotion['status']) => {
    setPromotions(promotions.map(p =>
      p.id === promotionId ? { ...p, status: newStatus } : p
    ));
  };

  const getStatusBadge = (status: Promotion['status']) => {
    const statusConfig = {
      draft: { color: 'bg-yellow-100 text-yellow-800', label: 'Brouillon' },
      active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      expired: { color: 'bg-red-100 text-red-800', label: 'Expirée' },
      paused: { color: 'bg-orange-100 text-orange-800', label: 'En pause' }
    };

    const config = statusConfig[status];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getTypeIcon = (type: Promotion['type']) => {
    const typeConfig = {
      percentage: '%',
      fixed: '€',
      buy_x_get_y: '🎁',
      free_shipping: '🚚',
      bundle: '📦'
    };
    return typeConfig[type];
  };

  const copyPromoCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Promotions & Réductions</h2>
          <p className="text-gray-600">Créez et gérez vos offres promotionnelles</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Nouvelle promotion</span>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Promotions actives</p>
                <p className="text-2xl font-bold">{promotions.filter(p => p.status === 'active').length}</p>
              </div>
              <Tag className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total utilisations</p>
                <p className="text-2xl font-bold">
                  {promotions.reduce((sum, p) => sum + p.currentUses, 0)}
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
                <p className="text-sm text-gray-600">Revenus générés</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(promotions.reduce((sum, p) => sum + p.metrics.revenue, 0))}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taux de conversion</p>
                <p className="text-2xl font-bold">
                  {promotions.length > 0
                    ? (promotions.reduce((sum, p) => sum + p.metrics.conversionRate, 0) / promotions.length).toFixed(1)
                    : '0'
                  }%
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
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Label className="text-sm">Statut:</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="active">Actives</SelectItem>
                  <SelectItem value="draft">Brouillons</SelectItem>
                  <SelectItem value="expired">Expirées</SelectItem>
                  <SelectItem value="paused">En pause</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Label className="text-sm">Type:</Label>
              <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  {promotionTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="activeOnly"
                checked={filters.activeOnly}
                onCheckedChange={(checked) => setFilters({...filters, activeOnly: checked})}
              />
              <Label htmlFor="activeOnly" className="text-sm">Actives uniquement</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Promotion Creation Form */}
      <AnimatePresence>
        {(isCreating || editingPromotion) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingPromotion ? 'Modifier la promotion' : 'Nouvelle promotion'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Titre</Label>
                    <Input
                      id="title"
                      value={editingPromotion ? editingPromotion.title : newPromotion.title || ''}
                      onChange={(e) =>
                        editingPromotion
                          ? setEditingPromotion({...editingPromotion, title: e.target.value})
                          : setNewPromotion({...newPromotion, title: e.target.value})
                      }
                      placeholder="Titre de la promotion"
                    />
                  </div>

                  <div>
                    <Label htmlFor="type">Type de promotion</Label>
                    <Select
                      value={editingPromotion ? editingPromotion.type : newPromotion.type || 'percentage'}
                      onValueChange={(value) =>
                        editingPromotion
                          ? setEditingPromotion({...editingPromotion, type: value as Promotion['type']})
                          : setNewPromotion({...newPromotion, type: value as Promotion['type']})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {promotionTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="value">Valeur</Label>
                    <Input
                      id="value"
                      type="number"
                      value={editingPromotion ? editingPromotion.value : newPromotion.value || 0}
                      onChange={(e) =>
                        editingPromotion
                          ? setEditingPromotion({...editingPromotion, value: parseInt(e.target.value) || 0})
                          : setNewPromotion({...newPromotion, value: parseInt(e.target.value) || 0})
                      }
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="minValue">Min. d'achat</Label>
                    <Input
                      id="minValue"
                      type="number"
                      value={editingPromotion ? editingPromotion.minValue : newPromotion.minValue || 0}
                      onChange={(e) =>
                        editingPromotion
                          ? setEditingPromotion({...editingPromotion, minValue: parseInt(e.target.value) || 0})
                          : setNewPromotion({...newPromotion, minValue: parseInt(e.target.value) || 0})
                      }
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="code">Code promo (optionnel)</Label>
                    <Input
                      id="code"
                      value={editingPromotion ? editingPromotion.code : newPromotion.code || ''}
                      onChange={(e) =>
                        editingPromotion
                          ? setEditingPromotion({...editingPromotion, code: e.target.value})
                          : setNewPromotion({...newPromotion, code: e.target.value})
                      }
                      placeholder="Laisser vide pour générer automatiquement"
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxUses">Max. utilisations (optionnel)</Label>
                    <Input
                      id="maxUses"
                      type="number"
                      value={editingPromotion ? editingPromotion.maxUses || '' : newPromotion.maxUses || ''}
                      onChange={(e) =>
                        editingPromotion
                          ? setEditingPromotion({...editingPromotion, maxUses: e.target.value ? parseInt(e.target.value) : null})
                          : setNewPromotion({...newPromotion, maxUses: e.target.value ? parseInt(e.target.value) : null})
                      }
                      placeholder="Illimité"
                    />
                  </div>

                  <div>
                    <Label htmlFor="startDate">Date de début</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={editingPromotion ? editingPromotion.startDate : newPromotion.startDate || ''}
                      onChange={(e) =>
                        editingPromotion
                          ? setEditingPromotion({...editingPromotion, startDate: e.target.value})
                          : setNewPromotion({...newPromotion, startDate: e.target.value})
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="endDate">Date de fin</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={editingPromotion ? editingPromotion.endDate : newPromotion.endDate || ''}
                      onChange={(e) =>
                        editingPromotion
                          ? setEditingPromotion({...editingPromotion, endDate: e.target.value})
                          : setNewPromotion({...newPromotion, endDate: e.target.value})
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editingPromotion ? editingPromotion.description : newPromotion.description || ''}
                    onChange={(e) =>
                      editingPromotion
                        ? setEditingPromotion({...editingPromotion, description: e.target.value})
                        : setNewPromotion({...newPromotion, description: e.target.value})
                    }
                    placeholder="Description de la promotion"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoApply"
                    checked={editingPromotion ? editingPromotion.autoApply : newPromotion.autoApply || false}
                    onCheckedChange={(checked) =>
                      editingPromotion
                        ? setEditingPromotion({...editingPromotion, autoApply: checked})
                        : setNewPromotion({...newPromotion, autoApply: checked})
                    }
                  />
                  <Label htmlFor="autoApply">Appliquer automatiquement</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false);
                      setEditingPromotion(null);
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={() =>
                      editingPromotion
                        ? handleUpdatePromotion(editingPromotion)
                        : handleCreatePromotion()
                    }
                  >
                    {editingPromotion ? 'Mettre à jour' : 'Créer la promotion'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Promotions List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPromotions.map((promotion) => (
          <motion.div
            key={promotion.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{getTypeIcon(promotion.type)}</div>
                    <div>
                      <CardTitle className="text-lg">{promotion.title}</CardTitle>
                      <p className="text-sm text-gray-600">{promotion.description}</p>
                    </div>
                  </div>
                  {getStatusBadge(promotion.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {promotion.code && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-gray-600" />
                      <span className="font-mono font-bold">{promotion.code}</span>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => copyPromoCode(promotion.code)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Valeur</p>
                    <p className="font-medium">
                      {promotion.type === 'percentage' ? `${promotion.value}%` :
                       promotion.type === 'free_shipping' ? 'Gratuite' :
                       `${formatCurrency(promotion.value)}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Min. d'achat</p>
                    <p className="font-medium">{formatCurrency(promotion.minValue || 0)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Période</p>
                    <p className="font-medium">
                      {new Date(promotion.startDate).toLocaleDateString('fr-FR')} - {new Date(promotion.endDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Utilisations</p>
                    <p className="font-medium">
                      {promotion.currentUses}{promotion.maxUses ? `/${promotion.maxUses}` : ''}
                    </p>
                  </div>
                </div>

                {promotion.maxUses && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progression</span>
                      <span>{Math.round((promotion.currentUses / promotion.maxUses) * 100)}%</span>
                    </div>
                    <Progress value={(promotion.currentUses / promotion.maxUses) * 100} className="h-2" />
                  </div>
                )}

                <div className="grid grid-cols-4 gap-2 text-center text-sm">
                  <div>
                    <p className="text-xs text-gray-600">Vues</p>
                    <p className="font-bold">{promotion.metrics.views.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Utilisations</p>
                    <p className="font-bold">{promotion.metrics.uses}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Revenus</p>
                    <p className="font-bold">{(promotion.metrics.revenue / 1000).toFixed(0)}k</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Conversion</p>
                    <p className="font-bold">{promotion.metrics.conversionRate}%</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="flex space-x-2">
                    {promotion.status === 'draft' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(promotion.id, 'active')}
                      >
                        Activer
                      </Button>
                    )}
                    {promotion.status === 'active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(promotion.id, 'paused')}
                      >
                        Pauser
                      </Button>
                    )}
                    {promotion.status === 'paused' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(promotion.id, 'active')}
                      >
                        Reprendre
                      </Button>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingPromotion(promotion)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeletePromotion(promotion.id)}
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

      {filteredPromotions.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Tag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune promotion trouvée
            </h3>
            <p className="text-gray-500 mb-4">
              Créez votre première promotion pour attirer plus de clients.
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer une promotion
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PromotionsManager;
