import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Handshake,
  TrendingUp,
  DollarSign,
  Users,
  MessageSquare,
  Calendar,
  Star,
  Award,
  Target,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  FileText,
  Download,
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  Zap,
  Shield,
  Brain,
  Mic
} from 'lucide-react';
import { CooperativeNegotiationInterface } from '@/components/cooperative/NegotiationInterface';
import { NegotiationForm } from '@/components/cooperative/NegotiationForm';

interface NegotiationSession {
  id: string;
  title: string;
  supplier: string;
  product: string;
  quantity: number;
  unit: string;
  targetPrice: number;
  currentOffer: number;
  status: 'active' | 'pending' | 'completed' | 'cancelled';
  startDate: string;
  expectedCloseDate: string;
  participants: number;
  messages: number;
  savings: number;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface SupplierPerformance {
  id: string;
  name: string;
  rating: number;
  reliability: number;
  quality: number;
  priceCompetitiveness: number;
  delivery: number;
  communication: number;
  totalNegotiations: number;
  successRate: number;
  averageSavings: number;
  certifications: string[];
  lastActivity: string;
}

interface NegotiationStats {
  totalSessions: number;
  activeNegotiations: number;
  completedNegotiations: number;
  totalSavings: number;
  averageSavingsRate: number;
  successRate: number;
  suppliersCount: number;
}

const CooperativeNegotiation = () => {
  const [sessions, setSessions] = useState<NegotiationSession[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<NegotiationStats | null>(null);
  const [recordingMode, setRecordingMode] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      // Mock data for demonstration
      const mockSessions: NegotiationSession[] = [
        {
          id: 'neg1',
          title: 'Engrais NPK 15-15-15 - Saison principale',
          supplier: 'AgriSupply Côte d\'Ivoire',
          product: 'Engrais NPK 15-15-15',
          quantity: 225,
          unit: 'kg',
          targetPrice: 800,
          currentOffer: 820,
          status: 'active',
          startDate: '2024-03-20',
          expectedCloseDate: '2024-03-25',
          participants: 3,
          messages: 15,
          savings: 6750,
          confidence: 85,
          priority: 'high'
        },
        {
          id: 'neg2',
          title: 'Semences de cacao améliorées',
          supplier: 'Semenco CI',
          product: 'Semences hybrides',
          quantity: 50,
          unit: 'kg',
          targetPrice: 15000,
          currentOffer: 14800,
          status: 'active',
          startDate: '2024-03-18',
          expectedCloseDate: '2024-03-28',
          participants: 2,
          messages: 8,
          savings: 10000,
          confidence: 92,
          priority: 'medium'
        },
        {
          id: 'neg3',
          title: 'Matériel d\'irrigation goutte-à-goutte',
          supplier: 'Irrigation Plus',
          product: 'Système d\'irrigation',
          quantity: 5,
          unit: 'système',
          targetPrice: 250000,
          currentOffer: 245000,
          status: 'pending',
          startDate: '2024-03-15',
          expectedCloseDate: '2024-04-01',
          participants: 2,
          messages: 5,
          savings: 25000,
          confidence: 78,
          priority: 'low'
        }
      ];

      const mockSuppliers: SupplierPerformance[] = [
        {
          id: 'sup1',
          name: 'AgriSupply Côte d\'Ivoire',
          rating: 4.5,
          reliability: 4.7,
          quality: 4.3,
          priceCompetitiveness: 4.2,
          delivery: 4.6,
          communication: 4.4,
          totalNegotiations: 12,
          successRate: 87,
          averageSavings: 12,
          certifications: ['ISO 9001', 'OAC', 'ECOCERT'],
          lastActivity: '2024-03-20'
        },
        {
          id: 'sup2',
          name: 'Semenco CI',
          rating: 4.2,
          reliability: 4.5,
          quality: 4.8,
          priceCompetitiveness: 3.9,
          delivery: 4.1,
          communication: 4.3,
          totalNegotiations: 8,
          successRate: 92,
          averageSavings: 8,
          certifications: ['ISO 9001', 'CERTIFICATION SEMENCES'],
          lastActivity: '2024-03-18'
        },
        {
          id: 'sup3',
          name: 'Irrigation Plus',
          rating: 4.0,
          reliability: 4.2,
          quality: 4.1,
          priceCompetitiveness: 4.3,
          delivery: 3.8,
          communication: 4.0,
          totalNegotiations: 5,
          successRate: 80,
          averageSavings: 15,
          certifications: ['ISO 9001'],
          lastActivity: '2024-03-15'
        }
      ];

      const totalSessions = mockSessions.length;
      const activeNegotiations = mockSessions.filter(s => s.status === 'active').length;
      const completedNegotiations = mockSessions.filter(s => s.status === 'completed').length;
      const totalSavings = mockSessions.reduce((sum, s) => sum + s.savings, 0);
      const averageSavingsRate = mockSessions.length > 0
        ? mockSessions.reduce((sum, s) => sum + ((s.targetPrice - s.currentOffer) / s.targetPrice * 100), 0) / mockSessions.length
        : 0;
      const successRate = mockSessions.length > 0 ? (completedNegotiations / totalSessions) * 100 : 0;

      setSessions(mockSessions);
      setSuppliers(mockSuppliers);
      setStats({
        totalSessions,
        activeNegotiations,
        completedNegotiations,
        totalSavings,
        averageSavingsRate: Math.abs(Math.round(averageSavingsRate)),
        successRate: Math.round(successRate),
        suppliersCount: mockSuppliers.length
      });
    } catch (error) {
      console.error('Error loading negotiation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.product.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || session.priority === priorityFilter;
    const matchesSupplier = supplierFilter === 'all' || session.supplier === supplierFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesSupplier;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      pending: 'secondary',
      completed: 'default',
      cancelled: 'destructive'
    } as const;

    const labels = {
      active: 'Active',
      pending: 'En attente',
      completed: 'Terminée',
      cancelled: 'Annulée'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: 'outline',
      medium: 'secondary',
      high: 'default',
      urgent: 'destructive'
    } as const;

    const labels = {
      low: 'Basse',
      medium: 'Moyenne',
      high: 'Élevée',
      urgent: 'Urgente'
    };

    return (
      <Badge variant={variants[priority as keyof typeof variants]}>
        {labels[priority as keyof typeof labels]}
      </Badge>
    );
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStarRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating}</span>
      </div>
    );
  };

  const startNegotiation = () => {
    setIsDialogOpen(true);
  };

  const toggleRecording = () => {
    setRecordingMode(!recordingMode);
    if (!recordingMode) {
      // Start voice recording logic here
      console.log('Starting voice recording for negotiation...');
    } else {
      // Stop voice recording logic here
      console.log('Stopping voice recording...');
    }
  };

  const negotiationStats = [
    {
      title: "Négociations actives",
      value: stats?.activeNegotiations.toString() || "0",
      icon: Handshake,
      change: "En cours"
    },
    {
      title: "Économies réalisées",
      value: stats ? `${(stats.totalSavings / 1000000).toFixed(1)}M FCFA` : "0 FCFA",
      icon: DollarSign,
      change: `${stats?.averageSavingsRate || 0}% moyenne`
    },
    {
      title: "Taux de réussite",
      value: `${stats?.successRate || 0}%`,
      icon: TrendingUp,
      change: "Ce trimestre"
    },
    {
      title: "Fournisseurs",
      value: stats?.suppliersCount.toString() || "0",
      icon: Users,
      change: "Actifs"
    }
  ];

  if (loading) {
    return (
      <DashboardLayout title="Négociation Fournisseurs" subtitle="Gérez les négociations avec les fournisseurs et optimisez vos achats">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Chargement des données...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Négociation Fournisseurs" subtitle="Gérez les négociations avec les fournisseurs et optimisez vos achats">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {negotiationStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.change}</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6" onClick={startNegotiation}>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Plus className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">Nouvelle négociation</h3>
                  <p className="text-sm text-muted-foreground">Démarrer une nouvelle négociation</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6" onClick={toggleRecording}>
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${recordingMode ? 'bg-red-100' : 'bg-green-100'}`}>
                  <Mic className={`h-6 w-6 ${recordingMode ? 'text-red-600' : 'text-green-600'}`} />
                </div>
                <div>
                  <h3 className="font-medium">Mode vocal</h3>
                  <p className="text-sm text-muted-foreground">
                    {recordingMode ? 'Enregistrement en cours...' : 'Activer la reconnaissance vocale'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Brain className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium">Assistant IA</h3>
                  <p className="text-sm text-muted-foreground">Conseils de négociation</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="suppliers">Fournisseurs</TabsTrigger>
            <TabsTrigger value="analytics">Analytiques</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Negotiations */}
              <Card>
                <CardHeader>
                  <CardTitle>Négociations actives</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sessions.filter(s => s.status === 'active').slice(0, 3).map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{session.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {session.supplier} • {session.quantity} {session.unit}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            {session.savings.toLocaleString()} FCFA économisés
                          </p>
                          <Badge className="text-xs">
                            {Math.round(((session.targetPrice - session.currentOffer) / session.targetPrice) * 100)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Performers */}
              <Card>
                <CardHeader>
                  <CardTitle>Meilleurs fournisseurs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {suppliers.slice(0, 3).map((supplier) => (
                      <div key={supplier.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{supplier.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {getStarRating(supplier.rating)}
                            <span className="text-xs text-muted-foreground">
                              {supplier.totalNegotiations} négociations
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            {supplier.averageSavings}% économies
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {supplier.successRate}% succès
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Full Negotiation Interface */}
            <Card>
              <CardHeader>
                <CardTitle>Interface de négociation</CardTitle>
              </CardHeader>
              <CardContent>
                <CooperativeNegotiationInterface />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher des négociations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="active">Actives</SelectItem>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="completed">Terminées</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Priorité" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes</SelectItem>
                        <SelectItem value="low">Basse</SelectItem>
                        <SelectItem value="medium">Moyenne</SelectItem>
                        <SelectItem value="high">Élevée</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Fournisseur" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        {suppliers.map(supplier => (
                          <SelectItem key={supplier.id} value={supplier.name}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={startNegotiation} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Nouvelle
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sessions Table */}
            <Card>
              <CardHeader>
                <CardTitle>Sessions de négociation</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titre</TableHead>
                      <TableHead>Fournisseur</TableHead>
                      <TableHead>Produit</TableHead>
                      <TableHead>Prix cible/offre</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Confiance</TableHead>
                      <TableHead>Économies</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium">{session.title}</TableCell>
                        <TableCell>{session.supplier}</TableCell>
                        <TableCell>{session.product}</TableCell>
                        <TableCell>
                          <div>
                            <span className="text-sm">{session.targetPrice.toLocaleString()} FCFA</span>
                            <span className="mx-1">→</span>
                            <span className="font-medium">{session.currentOffer.toLocaleString()} FCFA</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(session.status)}</TableCell>
                        <TableCell>
                          <span className={`font-medium ${getConfidenceColor(session.confidence)}`}>
                            {session.confidence}%
                          </span>
                        </TableCell>
                        <TableCell className="font-medium text-green-600">
                          {session.savings.toLocaleString()} FCFA
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-6">
            <div className="grid gap-6">
              {suppliers.map((supplier) => (
                <Card key={supplier.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {supplier.name}
                          <Badge variant="outline" className="text-xs">
                            {supplier.totalNegotiations} négociations
                          </Badge>
                        </CardTitle>
                        <div className="flex items-center gap-4 mt-2">
                          {getStarRating(supplier.rating)}
                          <span className="text-sm text-muted-foreground">
                            Dernière activité: {new Date(supplier.lastActivity).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          {supplier.averageSavings}% économies
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {supplier.successRate}% taux de succès
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="text-center">
                        <p className="text-sm font-medium">Fiabilité</p>
                        <div className="mt-1">
                          <Progress value={(supplier.reliability / 5) * 100} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">{supplier.reliability}/5</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">Qualité</p>
                        <div className="mt-1">
                          <Progress value={(supplier.quality / 5) * 100} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">{supplier.quality}/5</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">Prix</p>
                        <div className="mt-1">
                          <Progress value={(supplier.priceCompetitiveness / 5) * 100} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">{supplier.priceCompetitiveness}/5</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">Livraison</p>
                        <div className="mt-1">
                          <Progress value={(supplier.delivery / 5) * 100} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">{supplier.delivery}/5</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">Communication</p>
                        <div className="mt-1">
                          <Progress value={(supplier.communication / 5) * 100} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">{supplier.communication}/5</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {supplier.certifications.map((cert, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Voir détails
                      </Button>
                      <Button variant="default" size="sm">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Contacter
                      </Button>
                      <Button variant="ivoire" size="sm">
                        <Handshake className="h-4 w-4 mr-1" />
                        Négocier
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance des négociations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Taux de réussite global</span>
                      <span className="font-bold text-green-600">{stats?.successRate || 0}%</span>
                    </div>
                    <Progress value={stats?.successRate || 0} className="h-2" />
                    <div className="flex justify-between items-center">
                      <span>Économies moyennes</span>
                      <span className="font-bold text-blue-600">{stats?.averageSavingsRate || 0}%</span>
                    </div>
                    <Progress value={stats?.averageSavingsRate || 0} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Préférences des fournisseurs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>AgriSupply Côte d'Ivoire</span>
                      <span className="font-bold">45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                    <div className="flex justify-between items-center">
                      <span>Semenco CI</span>
                      <span className="font-bold">30%</span>
                    </div>
                    <Progress value={30} className="h-2" />
                    <div className="flex justify-between items-center">
                      <span>Autres</span>
                      <span className="font-bold">25%</span>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recommandations IA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">Opportunité d'économie</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Analyse des prix du marché suggère une négociation potentielle de 15% sur les engrais NPK avec de nouveaux fournisseurs.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-900">Stratégie recommandée</h4>
                        <p className="text-sm text-green-700 mt-1">
                          Regrouper les commandes avec 3 autres coopératives pour obtenir des tarifs de volume avantageux.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-orange-900">Alerte qualité</h4>
                        <p className="text-sm text-orange-700 mt-1">
                          Vérifier les certifications ISO 9001 de Semenco CI, l'audit expire dans 30 jours.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* New Negotiation Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Nouvelle négociation</DialogTitle>
            </DialogHeader>
            <NegotiationForm
              suppliers={suppliers}
              onSubmit={(data) => {
                console.log('Creating new negotiation:', data);
                setIsDialogOpen(false);
                loadData();
              }}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default CooperativeNegotiation;