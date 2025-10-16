import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Truck, 
  Package, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Search,
  Filter,
  Download,
  Plus
} from 'lucide-react';
import { 
  SupplyOrder, 
  SupplyOrderStatus, 
  Product,
  MerchantEnrollment,
  merchantEnrollmentService,
  supplyOrderService 
} from '@/services';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Types pour l'approvisionnement
interface SupplyFilters {
  status?: SupplyOrderStatus;
  merchantId?: string;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}

interface SupplyManagementProps {
  merchantId?: string;
  onOrderCreate?: (order: Partial<SupplyOrder>) => void;
}

export const SupplyManagement: React.FC<SupplyManagementProps> = ({ 
  merchantId,
  onOrderCreate 
}) => {
  const [orders, setOrders] = useState<SupplyOrder[]>([]);
  const [merchants, setMerchants] = useState<MerchantEnrollment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SupplyFilters>({});
  const [selectedOrder, setSelectedOrder] = useState<SupplyOrder | null>(null);
  const [showCreateOrder, setShowCreateOrder] = useState(false);

  // Charger les données initiales
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Charger les commandes
        const ordersResult = await supplyOrderService.getAll();
        setOrders(ordersResult);

        // Charger les marchands
        const merchantsResult = await merchantEnrollmentService.getAll();
        setMerchants(merchantsResult);

        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleFilterChange = (key: keyof SupplyFilters, value: string | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleOrderSelect = (order: SupplyOrder) => {
    setSelectedOrder(order);
  };

  const handleCreateOrder = () => {
    setShowCreateOrder(true);
  };

  const getStatusColor = (status: SupplyOrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-800';
      case 'DELIVERED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Gestion des Approvisionnements</h1>
          <p className="text-gray-600">Suivi des commandes d'approvisionnement</p>
        </div>
        <Button onClick={handleCreateOrder} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle Commande
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Statut</label>
              <Select onValueChange={(value) => handleFilterChange('status', value as SupplyOrderStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les statuts</SelectItem>
                  <SelectItem value="PENDING">En attente</SelectItem>
                  <SelectItem value="APPROVED">Approuvé</SelectItem>
                  <SelectItem value="REJECTED">Rejeté</SelectItem>
                  <SelectItem value="SHIPPED">Expédié</SelectItem>
                  <SelectItem value="DELIVERED">Livré</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Marchand</label>
              <Select onValueChange={(value) => handleFilterChange('merchantId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les marchands" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les marchands</SelectItem>
                  {merchants.map(merchant => (
                    <SelectItem key={merchant.id} value={merchant.id}>
                      {merchant.merchantName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date de début</label>
              <Input
                type="date"
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date de fin</label>
              <Input
                type="date"
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Commandes d'Approvisionnement</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Marchand</TableHead>
                <TableHead>Produits</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date de commande</TableHead>
                <TableHead>Date de livraison</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map(order => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.merchantName}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {order.items.map((item, index) => (
                        <div key={index} className="text-sm">
                          {item.productName} - {item.quantity} {item.unit}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.orderDate), 'dd/MM/yyyy', { locale: fr })}
                  </TableCell>
                  <TableCell>
                    {order.deliveryDate
                      ? format(new Date(order.deliveryDate), 'dd/MM/yyyy', { locale: fr })
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOrderSelect(order)}
                    >
                      Détails
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
