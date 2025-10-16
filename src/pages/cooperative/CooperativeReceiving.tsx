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
  Package,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Camera,
  Scale,
  Thermometer,
  Droplets,
  Clock,
  Truck,
  FileText,
  Barcode,
  Calendar
} from 'lucide-react';
import { ReceivingForm } from '@/components/cooperative/ReceivingForm';
import { QualityForm } from '@/components/cooperative/QualityForm';
import { inventoryService } from '@/services/cooperative/inventoryService';
import { warehouseService } from '@/services/cooperative/warehouseService';

interface ReceivingRecord {
  id: string;
  receiptNumber: string;
  supplierName: string;
  productName: string;
  quantityOrdered: number;
  quantityReceived: number;
  unit: string;
  qualityScore: number;
  qualityStatus: 'passed' | 'failed' | 'pending';
  inspectionDate: string;
  receivedBy: string;
  warehouse: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  qualityChecks: QualityCheck[];
  photos: string[];
  notes: string;
}

interface QualityCheck {
  id: string;
  type: string;
  parameter: string;
  standard: string;
  measured: string;
  result: 'pass' | 'fail' | 'warning';
  notes: string;
}

interface ReceivingStats {
  totalReceipts: number;
  pendingInspection: number;
  passedQuality: number;
  failedQuality: number;
  averageQualityScore: number;
}

const CooperativeReceiving = () => {
  const [records, setRecords] = useState<ReceivingRecord[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [qualityFilter, setQualityFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isQualityDialogOpen, setIsQualityDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ReceivingRecord | null>(null);
  const [qualityRecord, setQualityRecord] = useState<ReceivingRecord | null>(null);
  const [activeTab, setActiveTab] = useState('receiving');
  const [stats, setStats] = useState<ReceivingStats | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const recordsData = inventoryService.getReceivingRecords();
      const warehousesData = warehouseService.getAll();

      setRecords(recordsData);
      setWarehouses(warehousesData);

      const pendingInspection = recordsData.filter(r => r.qualityStatus === 'pending').length;
      const passedQuality = recordsData.filter(r => r.qualityStatus === 'passed').length;
      const failedQuality = recordsData.filter(r => r.qualityStatus === 'failed').length;
      const averageQualityScore = recordsData.length > 0
        ? recordsData.reduce((sum, r) => sum + r.qualityScore, 0) / recordsData.length
        : 0;

      setStats({
        totalReceipts: recordsData.length,
        pendingInspection,
        passedQuality,
        failedQuality,
        averageQualityScore: Math.round(averageQualityScore)
      });
    } catch (error) {
      console.error('Error loading receiving data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesQuality = qualityFilter === 'all' || record.qualityStatus === qualityFilter;

    return matchesSearch && matchesStatus && matchesQuality;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'outline',
      in_progress: 'default',
      completed: 'secondary',
      rejected: 'destructive'
    } as const;

    const labels = {
      pending: 'En attente',
      in_progress: 'En cours',
      completed: 'Terminé',
      rejected: 'Rejeté'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getQualityBadge = (status: string) => {
    const variants = {
      passed: 'default',
      failed: 'destructive',
      pending: 'outline'
    } as const;

    const labels = {
      passed: 'Conforme',
      failed: 'Non conforme',
      pending: 'En attente'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleCreateRecord = (data) => {
    inventoryService.addReceivingRecord(data);
    setIsDialogOpen(false);
    loadData();
  };

  const handleUpdateRecord = (data) => {
    inventoryService.updateReceivingRecord(data.id, data);
    setIsDialogOpen(false);
    setEditingRecord(null);
    loadData();
  };

  const handleQualityCheck = (data) => {
    inventoryService.updateQualityCheck(qualityRecord?.id || '', data);
    setIsQualityDialogOpen(false);
    setQualityRecord(null);
    loadData();
  };

  const handleDeleteRecord = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet enregistrement ?')) {
      inventoryService.deleteReceivingRecord(id);
      loadData();
    }
  };

  const startQualityCheck = (record: ReceivingRecord) => {
    setQualityRecord(record);
    setIsQualityDialogOpen(true);
  };

  const receivingStats = [
    {
      title: "Total réceptions",
      value: stats?.totalReceipts.toString() || "0",
      icon: Package,
      change: "+12 ce mois"
    },
    {
      title: "Contrôles qualité",
      value: stats?.pendingInspection.toString() || "0",
      icon: AlertTriangle,
      change: "En attente"
    },
    {
      title: "Qualité moyenne",
      value: stats ? `${stats.averageQualityScore}%` : "0%",
      icon: CheckCircle,
      change: stats?.averageQualityScore >= 80 ? "Bon" : "À améliorer"
    },
    {
      title: "Taux de conformité",
      value: stats && stats.totalReceipts > 0
        ? `${Math.round((stats.passedQuality / stats.totalReceipts) * 100)}%`
        : "0%",
      icon: CheckCircle,
      change: stats && stats.failedQuality > 0 ? `${stats.failedQuality} rejets` : "Aucun rejet"
    }
  ];

  if (loading) {
    return (
      <DashboardLayout title="Réception & Qualité" subtitle="Gérez la réception des marchandises et le contrôle qualité">
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
    <DashboardLayout title="Réception & Qualité" subtitle="Gérez la réception des marchandises et le contrôle qualité">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {receivingStats.map((stat, index) => (
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

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="receiving">Réception</TabsTrigger>
            <TabsTrigger value="quality">Contrôle Qualité</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
          </TabsList>

          <TabsContent value="receiving" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher par fournisseur, produit..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous statuts</SelectItem>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="in_progress">En cours</SelectItem>
                        <SelectItem value="completed">Terminé</SelectItem>
                        <SelectItem value="rejected">Rejeté</SelectItem>
                      </SelectContent>
                    </Select>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={() => setEditingRecord(null)} className="gap-2">
                          <Plus className="h-4 w-4" />
                          Nouvelle réception
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>
                            {editingRecord ? 'Modifier la réception' : 'Nouvelle réception'}
                          </DialogTitle>
                        </DialogHeader>
                        <ReceivingForm
                          item={editingRecord}
                          warehouses={warehouses}
                          onSubmit={editingRecord ? handleUpdateRecord : handleCreateRecord}
                          onCancel={() => {
                            setIsDialogOpen(false);
                            setEditingRecord(null);
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Receiving Records Table */}
            <Card>
              <CardHeader>
                <CardTitle>Enregistrements de réception</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>N° Réception</TableHead>
                      <TableHead>Fournisseur</TableHead>
                      <TableHead>Produit</TableHead>
                      <TableHead>Quantité</TableHead>
                      <TableHead>Qualité</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{new Date(record.inspectionDate).toLocaleDateString()}</TableCell>
                        <TableCell className="font-mono text-sm">{record.receiptNumber}</TableCell>
                        <TableCell className="font-medium">{record.supplierName}</TableCell>
                        <TableCell>{record.productName}</TableCell>
                        <TableCell>
                          <div>
                            <span className="font-medium">{record.quantityReceived} {record.unit}</span>
                            <div className="text-xs text-muted-foreground">
                              Commandé: {record.quantityOrdered} {record.unit}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <span className={`font-medium ${getQualityColor(record.qualityScore)}`}>
                              {record.qualityScore}%
                            </span>
                            <div>{getQualityBadge(record.qualityStatus)}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {record.qualityStatus === 'pending' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => startQualityCheck(record)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
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

          <TabsContent value="quality" className="space-y-6">
            <div className="grid gap-6">
              {filteredRecords.filter(r => r.qualityStatus !== 'pending').map((record) => (
                <Card key={record.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {record.productName}
                          {getQualityBadge(record.qualityStatus)}
                          <Badge variant="outline">{record.receiptNumber}</Badge>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Fournisseur: {record.supplierName} • Contrôlé par {record.receivedBy}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${getQualityColor(record.qualityScore)}`}>
                          {record.qualityScore}%
                        </p>
                        <p className="text-sm text-muted-foreground">Score qualité</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-medium">Contrôles qualité</h4>
                        <div className="space-y-3">
                          {record.qualityChecks.map((check) => (
                            <div key={check.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-medium text-sm">{check.parameter}</p>
                                <p className="text-xs text-muted-foreground">{check.type}</p>
                              </div>
                              <div className="text-right">
                                <Badge
                                  variant={check.result === 'pass' ? 'default' : check.result === 'fail' ? 'destructive' : 'outline'}
                                  className="text-xs"
                                >
                                  {check.result === 'pass' ? 'Conforme' : check.result === 'fail' ? 'Non conforme' : 'Attention'}
                                </Badge>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {check.measured} / {check.standard}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium">Conditions de réception</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 border rounded-lg">
                            <Thermometer className="h-6 w-6 mx-auto mb-1 text-red-600" />
                            <p className="text-sm font-medium">22°C</p>
                            <p className="text-xs text-muted-foreground">Température</p>
                          </div>
                          <div className="text-center p-3 border rounded-lg">
                            <Droplets className="h-6 w-6 mx-auto mb-1 text-blue-600" />
                            <p className="text-sm font-medium">65%</p>
                            <p className="text-xs text-muted-foreground">Humidité</p>
                          </div>
                          <div className="text-center p-3 border rounded-lg">
                            <Scale className="h-6 w-6 mx-auto mb-1 text-green-600" />
                            <p className="text-sm font-medium">{record.quantityReceived} {record.unit}</p>
                            <p className="text-xs text-muted-foreground">Poids reçu</p>
                          </div>
                          <div className="text-center p-3 border rounded-lg">
                            <Clock className="h-6 w-6 mx-auto mb-1 text-orange-600" />
                            <p className="text-sm font-medium">{new Date(record.inspectionDate).toLocaleDateString()}</p>
                            <p className="text-xs text-muted-foreground">Date contrôle</p>
                          </div>
                        </div>

                        {record.photos && record.photos.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium mb-2">Photos ({record.photos.length})</h5>
                            <div className="flex flex-wrap gap-2">
                              {record.photos.slice(0, 3).map((photo, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  <Camera className="h-3 w-3 mr-1" />
                                  Photo {index + 1}
                                </Badge>
                              ))}
                              {record.photos.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{record.photos.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {record.notes && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm"><strong>Notes:</strong> {record.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Historique des réceptions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredRecords.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Package className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{record.productName}</p>
                          <p className="text-sm text-muted-foreground">
                            {record.supplierName} • {new Date(record.inspectionDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{record.quantityReceived} {record.unit}</p>
                        <div className="flex items-center justify-end gap-2">
                          {getQualityBadge(record.qualityStatus)}
                          {getStatusBadge(record.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quality Check Dialog */}
        <Dialog open={isQualityDialogOpen} onOpenChange={setIsQualityDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Contrôle qualité - {qualityRecord?.productName}</DialogTitle>
            </DialogHeader>
            {qualityRecord && (
              <QualityForm
                record={qualityRecord}
                onSubmit={handleQualityCheck}
                onCancel={() => {
                  setIsQualityDialogOpen(false);
                  setQualityRecord(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default CooperativeReceiving;