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
  Star,
  Gift,
  Trophy,
  Crown,
  Target,
  Users,
  TrendingUp,
  Award,
  Plus,
  Edit,
  Trash2,
  Settings,
  BarChart3,
  Calendar,
  Zap,
  Shield,
  Diamond
} from 'lucide-react';

interface LoyaltyTier {
  id: string;
  name: string;
  description: string;
  minPoints: number;
  maxPoints?: number;
  benefits: string[];
  color: string;
  icon: string;
}

interface LoyaltyReward {
  id: string;
  title: string;
  description: string;
  type: 'discount' | 'product' | 'shipping' | 'experience';
  pointsCost: number;
  value: number;
  availability: number;
  claimed: number;
  isActive: boolean;
  image?: string;
  validUntil?: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  points: number;
  tier: string;
  joinDate: string;
  lastActivity: string;
  totalPurchases: number;
  rewardsClaimed: number;
}

const LoyaltyProgramManager = () => {
  const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'tiers' | 'rewards' | 'customers'>('overview');
  const [isCreating, setIsCreating] = useState<'tier' | 'reward' | null>(null);
  const [editingItem, setEditingItem] = useState<LoyaltyTier | LoyaltyReward | null>(null);

  useEffect(() => {
    // Initialize loyalty tiers
    setTiers([
      {
        id: 'bronze',
        name: 'Bronze',
        description: 'Début de votre aventure culinaire',
        minPoints: 0,
        maxPoints: 999,
        benefits: ['5% de réduction sur votre anniversaire', 'Accès aux offres spéciales'],
        color: 'text-amber-600',
        icon: '🥉'
      },
      {
        id: 'silver',
        name: 'Argent',
        description: 'Client fidèle et apprécié',
        minPoints: 1000,
        maxPoints: 4999,
        benefits: ['10% de réduction sur votre anniversaire', 'Livraison offerte dès 5.000 FCFA', 'Accès anticipé aux nouveautés'],
        color: 'text-gray-400',
        icon: '🥈'
      },
      {
        id: 'gold',
        name: 'Or',
        description: 'Membre premium du club',
        minPoints: 5000,
        maxPoints: 14999,
        benefits: ['15% de réduction sur votre anniversaire', 'Livraison offerte', 'Support prioritaire', 'Invitations aux événements exclusifs'],
        color: 'text-yellow-500',
        icon: '🥇'
      },
      {
        id: 'platinum',
        name: 'Platine',
        description: 'Client d\'exception',
        minPoints: 15000,
        benefits: ['20% de réduction permanente', 'Livraison express gratuite', 'Conseiller personnel', 'Accès aux produits limités', 'Événements VIP'],
        color: 'text-blue-400',
        icon: '💎'
      }
    ]);

    // Initialize rewards
    setRewards([
      {
        id: '1',
        title: '5% de réduction',
        description: 'Réduction de 5% sur votre prochaine commande',
        type: 'discount',
        pointsCost: 500,
        value: 5,
        availability: 100,
        claimed: 67,
        isActive: true,
        validUntil: '2024-12-31'
      },
      {
        id: '2',
        title: 'Livraison offerte',
        description: 'Livraison gratuite sur votre prochaine commande',
        type: 'shipping',
        pointsCost: 750,
        value: 1500,
        availability: 50,
        claimed: 23,
        isActive: true
      },
      {
        id: '3',
        title: 'Panier surprise',
        description: 'Panier de produits sélectionnés par nos experts',
        type: 'product',
        pointsCost: 2000,
        value: 5000,
        availability: 20,
        claimed: 5,
        isActive: true,
        validUntil: '2024-06-30'
      },
      {
        id: '4',
        title: 'Atelier cuisine',
        description: 'Participez à un atelier cuisine avec un chef',
        type: 'experience',
        pointsCost: 5000,
        value: 15000,
        availability: 10,
        claimed: 2,
        isActive: true,
        validUntil: '2024-05-15'
      }
    ]);

    // Initialize customers
    setCustomers([
      {
        id: '1',
        name: 'Kouadio Amani',
        email: 'amani@example.com',
        points: 2500,
        tier: 'silver',
        joinDate: '2023-06-15',
        lastActivity: '2024-01-20',
        totalPurchases: 125000,
        rewardsClaimed: 8
      },
      {
        id: '2',
        name: 'Fatou Traoré',
        email: 'fatou@example.com',
        points: 8500,
        tier: 'gold',
        joinDate: '2023-03-10',
        lastActivity: '2024-01-22',
        totalPurchases: 450000,
        rewardsClaimed: 15
      },
      {
        id: '3',
        name: 'Yao N\'Guessan',
        email: 'yao@example.com',
        points: 1200,
        tier: 'bronze',
        joinDate: '2023-11-20',
        lastActivity: '2024-01-21',
        totalPurchases: 65000,
        rewardsClaimed: 3
      }
    ]);
  }, []);

  const [newTier, setNewTier] = useState<Partial<LoyaltyTier>>({
    name: '',
    description: '',
    minPoints: 0,
    benefits: [],
    color: 'text-gray-600',
    icon: '⭐'
  });

  const [newReward, setNewReward] = useState<Partial<LoyaltyReward>>({
    title: '',
    description: '',
    type: 'discount',
    pointsCost: 0,
    value: 0,
    availability: 0,
    claimed: 0,
    isActive: true
  });

  const rewardTypes = [
    { value: 'discount', label: 'Réduction', icon: '💰' },
    { value: 'product', label: 'Produit', icon: '📦' },
    { value: 'shipping', label: 'Livraison', icon: '🚚' },
    { value: 'experience', label: 'Expérience', icon: '🎯' }
  ];

  const getTierById = (tierId: string) => {
    return tiers.find(t => t.id === tierId);
  };

  const calculateProgramStats = () => {
    const totalMembers = customers.length;
    const activeMembers = customers.filter(c => {
      const lastActivity = new Date(c.lastActivity);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return lastActivity >= thirtyDaysAgo;
    }).length;

    const totalPointsDistributed = customers.reduce((sum, c) => sum + c.points, 0);
    const totalRewardsClaimed = customers.reduce((sum, c) => sum + c.rewardsClaimed, 0);
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalPurchases, 0);

    return {
      totalMembers,
      activeMembers,
      totalPointsDistributed,
      totalRewardsClaimed,
      totalRevenue,
      engagementRate: totalMembers > 0 ? (activeMembers / totalMembers) * 100 : 0
    };
  };

  const stats = calculateProgramStats();

  const handleCreateTier = () => {
    if (newTier.name && newTier.description && newTier.minPoints !== undefined) {
      const tier: LoyaltyTier = {
        id: Date.now().toString(),
        name: newTier.name,
        description: newTier.description,
        minPoints: newTier.minPoints,
        maxPoints: newTier.maxPoints,
        benefits: newTier.benefits || [],
        color: newTier.color || 'text-gray-600',
        icon: newTier.icon || '⭐'
      };

      setTiers([...tiers, tier]);
      setNewTier({
        name: '',
        description: '',
        minPoints: 0,
        benefits: [],
        color: 'text-gray-600',
        icon: '⭐'
      });
      setIsCreating(null);
    }
  };

  const handleCreateReward = () => {
    if (newReward.title && newReward.description && newReward.pointsCost) {
      const reward: LoyaltyReward = {
        id: Date.now().toString(),
        title: newReward.title,
        description: newReward.description,
        type: newReward.type as LoyaltyReward['type'],
        pointsCost: newReward.pointsCost,
        value: newReward.value || 0,
        availability: newReward.availability || 0,
        claimed: 0,
        isActive: newReward.isActive || true,
        validUntil: newReward.validUntil
      };

      setRewards([...rewards, reward]);
      setNewReward({
        title: '',
        description: '',
        type: 'discount',
        pointsCost: 0,
        value: 0,
        availability: 0,
        claimed: 0,
        isActive: true
      });
      setIsCreating(null);
    }
  };

  const handleDeleteTier = (tierId: string) => {
    setTiers(tiers.filter(t => t.id !== tierId));
  };

  const handleDeleteReward = (rewardId: string) => {
    setRewards(rewards.filter(r => r.id !== rewardId));
  };

  const handleToggleRewardStatus = (rewardId: string) => {
    setRewards(rewards.map(r =>
      r.id === rewardId ? { ...r, isActive: !r.isActive } : r
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Programme de Fidélité</h2>
          <p className="text-gray-600">Gérez votre programme de fidélité et récompensez vos clients</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsCreating('tier')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau niveau
          </Button>
          <Button
            onClick={() => setIsCreating('reward')}
          >
            <Gift className="h-4 w-4 mr-2" />
            Nouvelle récompense
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
            { id: 'tiers', label: 'Niveaux', icon: Trophy },
            { id: 'rewards', label: 'Récompenses', icon: Gift },
            { id: 'customers', label: 'Clients', icon: Users }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'programs' | 'members' | 'analytics' | 'settings')}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Program Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Membres totaux</p>
                    <p className="text-2xl font-bold">{stats.totalMembers}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Membres actifs</p>
                    <p className="text-2xl font-bold">{stats.activeMembers}</p>
                    <p className="text-xs text-green-600">{stats.engagementRate.toFixed(1)}% d'engagement</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Points distribués</p>
                    <p className="text-2xl font-bold">{stats.totalPointsDistributed.toLocaleString()}</p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Récompenses claimées</p>
                    <p className="text-2xl font-bold">{stats.totalRewardsClaimed}</p>
                  </div>
                  <Gift className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Revenus générés</p>
                    <p className="text-2xl font-bold">{(stats.totalRevenue / 1000000).toFixed(1)}M</p>
                  </div>
                  <Crown className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tier Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribution des niveaux</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tiers.map((tier) => {
                  const customerCount = customers.filter(c => c.tier === tier.id).length;
                  const percentage = stats.totalMembers > 0 ? (customerCount / stats.totalMembers) * 100 : 0;

                  return (
                    <div key={tier.id} className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 w-32">
                        <span className="text-2xl">{tier.icon}</span>
                        <span className="font-medium">{tier.name}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>{customerCount} membres</span>
                          <span>{percentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Top Customers */}
          <Card>
            <CardHeader>
              <CardTitle>Meilleurs clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {customers
                  .sort((a, b) => b.points - a.points)
                  .slice(0, 5)
                  .map((customer) => {
                    const tier = getTierById(customer.tier);
                    return (
                      <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{tier?.icon}</span>
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-gray-600">{customer.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{customer.points.toLocaleString()} points</p>
                          <p className="text-sm text-gray-600">{customer.rewardsClaimed} récompenses</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tiers Tab */}
      {activeTab === 'tiers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((tier) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-full h-1 ${tier.color.replace('text', 'bg')}`} />
                  <CardHeader className="text-center">
                    <div className="text-4xl mb-2">{tier.icon}</div>
                    <CardTitle className={tier.color}>{tier.name}</CardTitle>
                    <p className="text-sm text-gray-600">{tier.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Points requis</p>
                      <p className="text-2xl font-bold">{tier.minPoints.toLocaleString()}</p>
                      {tier.maxPoints && (
                        <p className="text-sm text-gray-500">à {tier.maxPoints.toLocaleString()}</p>
                      )}
                    </div>

                    <div>
                      <p className="font-medium mb-2">Avantages:</p>
                      <ul className="text-sm space-y-1">
                        {tier.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-green-500 mt-0.5">✓</span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="text-center">
                      <Badge variant="outline">
                        {customers.filter(c => c.tier === tier.id).length} membres
                      </Badge>
                    </div>

                    <div className="flex justify-center pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteTier(tier.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Rewards Tab */}
      {activeTab === 'rewards' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward) => (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">
                          {rewardTypes.find(t => t.value === reward.type)?.icon}
                        </span>
                        <div>
                          <CardTitle className="text-lg">{reward.title}</CardTitle>
                          <p className="text-sm text-gray-600">{reward.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {reward.isActive ? (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Coût en points</span>
                      <span className="font-bold text-lg">{reward.pointsCost.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Valeur</span>
                      <span className="font-medium">
                        {reward.type === 'discount' ? `${reward.value}%` :
                         reward.type === 'shipping' ? 'Gratuite' :
                        `${formatCurrency(reward.value)}`}
                      </span>
                    </div>

                    {reward.validUntil && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Valable jusqu'au</span>
                        <span className="text-sm font-medium">
                          {new Date(reward.validUntil).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    )}

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Disponibilité</span>
                        <span>{reward.claimed}/{reward.availability}</span>
                      </div>
                      <Progress value={(reward.claimed / reward.availability) * 100} className="h-2" />
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <Switch
                        checked={reward.isActive}
                        onCheckedChange={() => handleToggleRewardStatus(reward.id)}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteReward(reward.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Niveau</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Achats totaux</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Récompenses</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernière activité</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => {
                  const tier = getTierById(customer.tier);
                  return (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500">{customer.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{tier?.icon}</span>
                          <span className={`text-sm font-medium ${tier?.color}`}>{tier?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {customer.points.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(customer.totalPurchases)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.rewardsClaimed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(customer.lastActivity).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Creation Modals */}
      <AnimatePresence>
        {isCreating === 'tier' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Nouveau niveau de fidélité</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tierName">Nom du niveau</Label>
                    <Input
                      id="tierName"
                      value={newTier.name || ''}
                      onChange={(e) => setNewTier({...newTier, name: e.target.value})}
                      placeholder="ex: Bronze, Argent, Or..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="minPoints">Points minimum</Label>
                    <Input
                      id="minPoints"
                      type="number"
                      value={newTier.minPoints || ''}
                      onChange={(e) => setNewTier({...newTier, minPoints: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tierIcon">Icône</Label>
                    <Input
                      id="tierIcon"
                      value={newTier.icon || ''}
                      onChange={(e) => setNewTier({...newTier, icon: e.target.value})}
                      placeholder="⭐"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tierColor">Couleur</Label>
                    <Select
                      value={newTier.color || 'text-gray-600'}
                      onValueChange={(value) => setNewTier({...newTier, color: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text-amber-600">Ambre</SelectItem>
                        <SelectItem value="text-gray-400">Argent</SelectItem>
                        <SelectItem value="text-yellow-500">Or</SelectItem>
                        <SelectItem value="text-blue-400">Platine</SelectItem>
                        <SelectItem value="text-purple-500">Violet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="tierDescription">Description</Label>
                  <Textarea
                    id="tierDescription"
                    value={newTier.description || ''}
                    onChange={(e) => setNewTier({...newTier, description: e.target.value})}
                    placeholder="Description du niveau"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreating(null)}>
                    Annuler
                  </Button>
                  <Button onClick={handleCreateTier}>
                    Créer le niveau
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {isCreating === 'reward' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Nouvelle récompense</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rewardTitle">Titre</Label>
                    <Input
                      id="rewardTitle"
                      value={newReward.title || ''}
                      onChange={(e) => setNewReward({...newReward, title: e.target.value})}
                      placeholder="Titre de la récompense"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rewardType">Type</Label>
                    <Select
                      value={newReward.type || 'discount'}
                      onValueChange={(value) => setNewReward({...newReward, type: value as LoyaltyReward['type']})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {rewardTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="pointsCost">Coût en points</Label>
                    <Input
                      id="pointsCost"
                      type="number"
                      value={newReward.pointsCost || ''}
                      onChange={(e) => setNewReward({...newReward, pointsCost: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rewardValue">Valeur</Label>
                    <Input
                      id="rewardValue"
                      type="number"
                      value={newReward.value || ''}
                      onChange={(e) => setNewReward({...newReward, value: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="availability">Disponibilité</Label>
                    <Input
                      id="availability"
                      type="number"
                      value={newReward.availability || ''}
                      onChange={(e) => setNewReward({...newReward, availability: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="validUntil">Valable jusqu'au (optionnel)</Label>
                    <Input
                      id="validUntil"
                      type="date"
                      value={newReward.validUntil || ''}
                      onChange={(e) => setNewReward({...newReward, validUntil: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="rewardDescription">Description</Label>
                  <Textarea
                    id="rewardDescription"
                    value={newReward.description || ''}
                    onChange={(e) => setNewReward({...newReward, description: e.target.value})}
                    placeholder="Description de la récompense"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreating(null)}>
                    Annuler
                  </Button>
                  <Button onClick={handleCreateReward}>
                    Créer la récompense
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoyaltyProgramManager;
