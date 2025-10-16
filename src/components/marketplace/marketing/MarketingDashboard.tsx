import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Megaphone,
  Tag,
  Star,
  TrendingUp,
  Users,
  Target,
  DollarSign,
  Calendar,
  BarChart3,
  Gift,
  Crown,
  Settings,
  Plus,
  Eye,
  Share2
} from 'lucide-react';
import MarketingCampaignManager from './MarketingCampaignManager';
import PromotionsManager from './PromotionsManager';
import LoyaltyProgramManager from './LoyaltyProgramManager';

const MarketingDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for overview
  const overviewStats = {
    totalCampaigns: 12,
    activeCampaigns: 5,
    totalPromotions: 8,
    activePromotions: 6,
    loyaltyMembers: 342,
    engagementRate: 78,
    totalRevenue: 2500000,
    roi: 2.8
  };

  const recentCampaigns = [
    {
      id: '1',
      title: 'Promo Fruits de Saison',
      type: 'campaign',
      status: 'active',
      performance: '+45%',
      reach: 2500,
      conversions: 95
    },
    {
      id: '2',
      title: '20% de réduction',
      type: 'promotion',
      status: 'active',
      performance: '+32%',
      reach: 1800,
      conversions: 67
    },
    {
      id: '3',
      title: 'Programme de Fidélité',
      type: 'loyalty',
      status: 'active',
      performance: '+28%',
      reach: 5000,
      conversions: 234
    }
  ];

  const upcomingActivities = [
    {
      date: '2024-01-25',
      title: 'Lancement campagne légumes bio',
      type: 'campaign',
      priority: 'high'
    },
    {
      date: '2024-01-28',
      title: 'Fin promotion livraison offerte',
      type: 'promotion',
      priority: 'medium'
    },
    {
      date: '2024-02-01',
      title: 'Nouveau niveau Platine',
      type: 'loyalty',
      priority: 'low'
    }
  ];

  const getPerformanceColor = (performance: string) => {
    return parseFloat(performance.replace('+', '').replace('%', '')) > 30
      ? 'text-green-600'
      : parseFloat(performance.replace('+', '').replace('%', '')) > 15
      ? 'text-yellow-600'
      : 'text-red-600';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800'
    };
    return colors[priority as keyof typeof colors] || colors.low;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketing & Promotions</h1>
          <p className="text-gray-600">Gérez vos campagnes, promotions et programme de fidélité</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Exporter les rapports
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle campagne
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Campagnes actives</p>
                <p className="text-2xl font-bold">{overviewStats.activeCampaigns}</p>
                <p className="text-xs text-green-600">+2 cette semaine</p>
              </div>
              <Megaphone className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Promotions actives</p>
                <p className="text-2xl font-bold">{overviewStats.activePromotions}</p>
                <p className="text-xs text-green-600">+1 cette semaine</p>
              </div>
              <Tag className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Membres fidélité</p>
                <p className="text-2xl font-bold">{overviewStats.loyaltyMembers}</p>
                <p className="text-xs text-green-600">+12 ce mois</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ROI moyen</p>
                <p className="text-2xl font-bold">{overviewStats.roi}x</p>
                <p className="text-xs text-green-600">+0.3 ce mois</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Vue d'ensemble</span>
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center space-x-2">
            <Megaphone className="h-4 w-4" />
            <span>Campagnes</span>
          </TabsTrigger>
          <TabsTrigger value="promotions" className="flex items-center space-x-2">
            <Tag className="h-4 w-4" />
            <span>Promotions</span>
          </TabsTrigger>
          <TabsTrigger value="loyalty" className="flex items-center space-x-2">
            <Star className="h-4 w-4" />
            <span>Fidélité</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Performance */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Performance récente</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentCampaigns.map((campaign) => (
                      <motion.div
                        key={campaign.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-white rounded-lg">
                            {campaign.type === 'campaign' && <Megaphone className="h-5 w-5 text-blue-600" />}
                            {campaign.type === 'promotion' && <Tag className="h-5 w-5 text-green-600" />}
                            {campaign.type === 'loyalty' && <Star className="h-5 w-5 text-yellow-600" />}
                          </div>
                          <div>
                            <h3 className="font-medium">{campaign.title}</h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Users className="h-3 w-3" />
                              <span>{campaign.reach.toLocaleString()} atteints</span>
                              <Target className="h-3 w-3 ml-2" />
                              <span>{campaign.conversions} conversions</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            className={`${
                              campaign.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {campaign.status === 'active' ? 'Active' : 'Inactive'}
                          </Badge>
                          <span className={`font-bold ${getPerformanceColor(campaign.performance)}`}>
                            {campaign.performance}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5" />
                    <span>Revenus générés</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {(overviewStats.totalRevenue * 0.45 / 1000000).toFixed(1)}M
                      </p>
                      <p className="text-sm text-gray-600">Campagnes</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        {(overviewStats.totalRevenue * 0.35 / 1000000).toFixed(1)}M
                      </p>
                      <p className="text-sm text-gray-600">Promotions</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-yellow-600">
                        {(overviewStats.totalRevenue * 0.20 / 1000000).toFixed(1)}M
                      </p>
                      <p className="text-sm text-gray-600">Fidélité</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Activities */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Activités à venir</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingActivities.map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium">{activity.title}</p>
                            <p className="text-xs text-gray-600">
                              {new Date(activity.date).toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <Badge className={getPriorityColor(activity.priority)}>
                            {activity.priority === 'high' ? 'Haute' :
                             activity.priority === 'medium' ? 'Moyenne' : 'Basse'}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions rapides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('campaigns')}>
                    <Megaphone className="h-4 w-4 mr-2" />
                    Créer une campagne
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('promotions')}>
                    <Tag className="h-4 w-4 mr-2" />
                    Ajouter une promotion
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('loyalty')}>
                    <Gift className="h-4 w-4 mr-2" />
                    Gérer la fidélité
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Voir les rapports
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="mt-6">
          <MarketingCampaignManager />
        </TabsContent>

        <TabsContent value="promotions" className="mt-6">
          <PromotionsManager />
        </TabsContent>

        <TabsContent value="loyalty" className="mt-6">
          <LoyaltyProgramManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketingDashboard;