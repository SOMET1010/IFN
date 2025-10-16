import React, { useState } from "react";
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { OrderForm } from '@/components/cooperative/OrderForm';
import { useOrders } from '@/hooks/cooperative/useOrders';
import {
  Users,
  Package,
  Target,
  Search,
  Download,
  Plus,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  DollarSign,
  Calendar,
  Clock,
} from 'lucide-react';

const CooperativeOrders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');

  const {
    orders,
    loading,
    error,
    createOrder,
    updateOrder,
    deleteOrder,
    searchOrders,
    filterOrdersByStatus,
    filterOrdersByType,
    getStats,
    exportOrders,
    refresh,
  } = useOrders();

  // Effet de recherche et filtrage
  const getFilteredOrders = () => {
    let filtered = orders;

    if (searchTerm) {
      filtered = searchOrders(searchTerm);
    }

    if (statusFilter !== 'all') {
      filtered = filterOrdersByStatus(statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filterOrdersByType(typeFilter);
    }

    return filtered;
  };

  const filteredOrders = getFilteredOrders();
  const stats = getStats();

  const orderStats = [
    { 
      title: "Commandes actives", 
      value: stats.activeOrders.toString(), 
      icon: Package, 
      change: `+${Math.floor(stats.activeOrders * 0.2)}` 
    },
    { 
      title: "Valeur totale", 
      value: `${(stats.totalAmount / 1000000).toFixed(1)}M FCFA`, 
      icon: DollarSign, 
      change: "+12M" 
    },
    { 
      title: "Participants", 
      value: stats.totalParticipants.toString(), 
      icon: Users, 
      change: `+${Math.floor(stats.totalParticipants * 0.15)}` 
    },
    { 
      title: "Taux de complétion", 
      value: `${stats.completionRate}%`, 
      icon: TrendingUp, 
      change: "+5%" 
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      completed: "secondary",
      pending: "outline",
      draft: "outline",
      cancelled: "destructive"
    } as const;

    const labels = {
      active: "Active",
      completed: "Terminée",
      pending: "En attente",
      draft: "Brouillon",
      cancelled: "Annulée"
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: "outline",
      medium: "secondary",
      high: "default",
      urgent: "destructive"
    } as const;

    const labels = {
      low: "Basse",
      medium: "Moyenne",
      high: "Élevée",
      urgent: "Urgente"
    };

    return (
      <Badge variant={variants[priority as keyof typeof variants]}>
        {labels[priority as keyof typeof labels]}
      </Badge>
    );
  };

  const getParticipationPercentage = (current: number, target: number) => {
    return Math.round((current / target) * 100);
  };

  const getParticipationColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-blue-600";
  };

  // CRUD Operations
  const handleCreateOrder = (data) => {
    createOrder(data);
    setIsDialogOpen(false);
    setEditingOrder(null);
  };

  const handleUpdateOrder = (data) => {
    updateOrder(data.id, data);
    setIsDialogOpen(false);
    setEditingOrder(null);
  };

  const handleDeleteOrder = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      deleteOrder(id);
    }
  };

  const openCreateDialog = () => {
    setDialogMode('create');
    setEditingOrder(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (order) => {
    setDialogMode('edit');
    setEditingOrder(order);
    setIsDialogOpen(true);
  };

  const openViewDialog = (order) => {
    setDialogMode('view');
    setViewingOrder(order);
    setIsDialogOpen(true);
  };

  const handleSubmit = (data) => {
    if (dialogMode === 'create') {
      handleCreateOrder(data);
    } else if (dialogMode === 'edit') {
      handleUpdateOrder(data);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingOrder(null);
    setViewingOrder(null);
  };

  const handleExport = () => {
    const csvContent = exportOrders();
    if (csvContent) {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `commandes_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Commandes Groupées" subtitle="Gérez les commandes collectives de la coopérative">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Chargement des commandes...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Commandes Groupées" subtitle="Gérez les commandes collectives de la coopérative">
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-red-600">
            <p>{error}</p>
            <Button onClick={refresh} className="mt-4">Réessayer</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Commandes Groupées" subtitle="Gérez les commandes collectives de la coopérative">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {orderStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-green-600">{stat.change}</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom, produit, organisateur..."
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
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="active">Actives</SelectItem>
                    <SelectItem value="completed">Terminées</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="draft">Brouillons</SelectItem>
                    <SelectItem value="cancelled">Annulées</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="purchase">Achats</SelectItem>
                    <SelectItem value="collecte">Collectes</SelectItem>
                    <SelectItem value="service">Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Commandes ({filteredOrders.length})</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              Exporter
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ivoire" className="gap-2" onClick={openCreateDialog}>
                  <Plus className="h-4 w-4" />
                  Nouvelle Commande
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {dialogMode === 'create' && 'Nouvelle commande groupée'}
                    {dialogMode === 'edit' && 'Modifier la commande groupée'}
                    {dialogMode === 'view' && 'Détails de la commande'}
                  </DialogTitle>
                </DialogHeader>
                {dialogMode === 'view' && viewingOrder ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <strong>Nom:</strong> {viewingOrder.name}
                      </div>
                      <div>
                        <strong>Type:</strong> {viewingOrder.type}
                      </div>
                      <div>
                        <strong>Statut:</strong> {getStatusBadge(viewingOrder.status)}
                      </div>
                      <div>
                        <strong>Priorité:</strong> {getPriorityBadge(viewingOrder.priority)}
                      </div>
                      <div>
                        <strong>Organisateur:</strong> {viewingOrder.organizer}
                      </div>
                      <div>
                        <strong>Contact:</strong> {viewingOrder.organizerContact}
                      </div>
                      <div>
                        <strong>Montant total:</strong> {viewingOrder.totalAmount.toLocaleString()} {viewingOrder.currency}
                      </div>
                      <div>
                        <strong>Date limite:</strong> {viewingOrder.deadline}
                      </div>
                    </div>
                    <div>
                      <strong>Description:</strong>
                      <p className="mt-1">{viewingOrder.description}</p>
                    </div>
                    <div>
                      <strong>Articles:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {viewingOrder.items.map((item, index) => (
                          <li key={index}>
                            {item.product} - {item.quantity} {item.unit} - {item.unitPrice.toLocaleString()} {viewingOrder.currency}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={handleCloseDialog}>
                        Fermer
                      </Button>
                      <Button onClick={() => openEditDialog(viewingOrder)}>
                        Modifier
                      </Button>
                    </div>
                  </div>
                ) : (
                  <OrderForm
                    item={editingOrder}
                    onSubmit={handleSubmit}
                    onCancel={handleCloseDialog}
                  />
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-6">
          {filteredOrders.map((order) => {
            const participationPercentage = getParticipationPercentage(order.currentParticipants, order.targetParticipants);

            return (
              <Card key={order.id} className="transition-all hover:shadow-md">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {order.name}
                        {getStatusBadge(order.status)}
                        {getPriorityBadge(order.priority)}
                        <Badge variant="outline">{order.type}</Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Organisé par {order.organizer} • #{order.id}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {order.totalAmount.toLocaleString()} {order.currency}
                      </p>
                      <p className="text-sm text-muted-foreground">Total commande</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Articles</span>
                      </div>
                      <p className="text-lg font-semibold">{order.items.length} article(s)</p>
                      <div className="space-y-1">
                        {order.items.slice(0, 2).map((item, index) => (
                          <p key={index} className="text-sm text-muted-foreground">
                            {item.product} - {item.quantity} {item.unit}
                          </p>
                        ))}
                        {order.items.length > 2 && (
                          <p className="text-sm text-muted-foreground">
                            +{order.items.length - 2} autre(s) article(s)
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Participation</span>
                      </div>
                      <p className={`text-lg font-semibold ${getParticipationColor(participationPercentage)}`}>
                        {order.currentParticipants}/{order.targetParticipants} membres
                      </p>
                      <Progress 
                        value={participationPercentage} 
                        className="h-2"
                      />
                      <p className="text-sm text-muted-foreground">
                        {participationPercentage}% atteint
                        {order.minimumParticipants && (
                          <span> • Minimum: {order.minimumParticipants}</span>
                        )}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Échéances</span>
                      </div>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date limite:</span>
                          <span>{order.deadline}</span>
                        </div>
                        {order.estimatedDelivery && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Livraison estimée:</span>
                            <span>{order.estimatedDelivery}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Conditions:</span>
                          <span>{order.paymentTerms}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Récapitulatif des articles</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium text-sm">{item.product}</p>
                              <p className="text-xs text-muted-foreground">{item.category}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {item.quantity} {item.unit}
                            </Badge>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Prix unitaire:</span>
                            <span>{item.unitPrice.toLocaleString()} {order.currency}</span>
                          </div>
                          <div className="flex justify-between text-sm font-medium">
                            <span>Total:</span>
                            <span>{item.totalPrice.toLocaleString()} {order.currency}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Participants Preview */}
                  {order.participants && order.participants.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Participants ({order.participants.length})</h4>
                      <div className="flex flex-wrap gap-2">
                        {order.participants.slice(0, 5).map((participant, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {participant.name}
                          </Badge>
                        ))}
                        {order.participants.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{order.participants.length - 5} autre(s)
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openViewDialog(order)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Voir détails
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openEditDialog(order)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                    {order.status === 'active' && (
                      <Button variant="default" size="sm">
                        Inviter membres
                      </Button>
                    )}
                    {order.status === 'pending' && (
                      <Button variant="ivoire" size="sm">
                        Lancer commande
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteOrder(order.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucune commande trouvée</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Essayez de modifier vos filtres de recherche.'
                  : 'Commencez par créer votre première commande groupée.'}
              </p>
              <Button onClick={openCreateDialog} className="gap-2">
                <Plus className="h-4 w-4" />
                Créer une commande
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CooperativeOrders;
