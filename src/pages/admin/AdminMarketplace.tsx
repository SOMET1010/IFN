import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { StatsCard } from '@/components/ui/stats-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Store,
  Package,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  DollarSign,
  Users,
  RefreshCw,
  Eye,
  Edit,
  Ban,
  Check
} from 'lucide-react';
import { adminMarketplaceService, type MarketplaceStats, type MarketplaceProduct, type MarketplaceOrder, type Dispute } from '@/services/admin/adminMarketplaceService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AdminMarketplace() {
  const [stats, setStats] = useState<MarketplaceStats | null>(null);
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsResponse, productsResponse, ordersResponse, disputesResponse] = await Promise.all([
        adminMarketplaceService.getMarketplaceStats(),
        adminMarketplaceService.getProducts(),
        adminMarketplaceService.getOrders(),
        adminMarketplaceService.getDisputes()
      ]);

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
      if (productsResponse.success && productsResponse.data) {
        setProducts(productsResponse.data);
      }
      if (ordersResponse.success && ordersResponse.data) {
        setOrders(ordersResponse.data);
      }
      if (disputesResponse.success && disputesResponse.data) {
        setDisputes(disputesResponse.data);
      }
    } catch (error) {
      console.error('Erreur chargement marketplace:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProductStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Actif</Badge>;
      case 'pending':
        return <Badge variant="secondary">En attente</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeté</Badge>;
      case 'suspended':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Suspendu</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">En attente</Badge>;
      case 'confirmed':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Confirmé</Badge>;
      case 'shipped':
        return <Badge variant="default" className="bg-purple-100 text-purple-800">Expédié</Badge>;
      case 'delivered':
        return <Badge variant="default" className="bg-green-100 text-green-800">Livré</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Annulé</Badge>;
      case 'refunded':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Remboursé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDisputeStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="destructive">Ouvert</Badge>;
      case 'under_review':
        return <Badge variant="secondary">En révision</Badge>;
      case 'resolved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Résolu</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejeté</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">Élevée</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Moyenne</Badge>;
      case 'low':
        return <Badge variant="outline">Faible</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  if (loading) {
    return (
      <DashboardLayout sidebar={<></>} title="Marketplace">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={<></>} title="Marketplace">
      <div className="space-y-6">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatsCard
              title="Total Produits"
              value={stats.total_products.toLocaleString()}
              description={`${stats.active_products} actifs`}
              icon={<Package className="h-4 w-4" />}
              trend={{ value: stats.total_products, isPositive: true }}
            />
            <StatsCard
              title="Total Commandes"
              value={stats.total_orders.toLocaleString()}
              description="Commandes totales"
              icon={<ShoppingCart className="h-4 w-4" />}
              trend={{ value: stats.total_orders, isPositive: true }}
            />
            <StatsCard
              title="Revenu Mensuel"
              value={formatCurrency(stats.revenue_by_period.monthly)}
              description="Ce mois-ci"
              icon={<DollarSign className="h-4 w-4" />}
              trend={{ value: stats.revenue_by_period.monthly, isPositive: true }}
            />
            <StatsCard
              title="Litiges Actifs"
              value={disputes.filter(d => d.status === 'open').length.toString()}
              description={`${disputes.filter(d => d.priority === 'high').length} haute priorité`}
              icon={<AlertTriangle className="h-4 w-4" />}
              trend={{ value: disputes.filter(d => d.status === 'open').length, isPositive: false }}
            />
          </div>
        )}

        <Tabs defaultValue="products">
          <TabsList>
            <TabsTrigger value="products">Produits</TabsTrigger>
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="disputes">Litiges</TabsTrigger>
            <TabsTrigger value="analytics">Analytiques</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Produits</CardTitle>
                    <CardDescription>Gestion des produits du marketplace</CardDescription>
                  </div>
                  <Button variant="outline" onClick={loadData}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualiser
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Vendeur</TableHead>
                        <TableHead>Prix</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            Aucun produit trouvé
                          </TableCell>
                        </TableRow>
                      ) : (
                        products.slice(0, 10).map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{product.name}</div>
                                <div className="text-sm text-gray-500">{product.description.substring(0, 50)}...</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{product.seller_name}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{formatCurrency(product.price)}</div>
                              <div className="text-sm text-gray-500">Stock: {product.stock_quantity}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{product.category}</Badge>
                            </TableCell>
                            <TableCell>
                              {getProductStatusBadge(product.status)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {product.status === 'pending' && (
                                  <>
                                    <Button variant="outline" size="sm">
                                      <Check className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="sm">
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                                {product.status === 'active' && (
                                  <Button variant="outline" size="sm">
                                    <Ban className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Commandes</CardTitle>
                    <CardDescription>Gestion des commandes du marketplace</CardDescription>
                  </div>
                  <Button variant="outline" onClick={loadData}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualiser
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Acheteur</TableHead>
                        <TableHead>Vendeur</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            Aucune commande trouvée
                          </TableCell>
                        </TableRow>
                      ) : (
                        orders.slice(0, 10).map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.id.substring(0, 8)}</TableCell>
                            <TableCell>{order.buyer_name}</TableCell>
                            <TableCell>{order.seller_name}</TableCell>
                            <TableCell>
                              <div className="font-medium">{formatCurrency(order.total_amount)}</div>
                              <div className="text-sm text-gray-500">{order.items.length} articles</div>
                            </TableCell>
                            <TableCell>
                              {getOrderStatusBadge(order.status)}
                            </TableCell>
                            <TableCell>
                              <div>{new Date(order.created_at).toLocaleDateString('fr-FR')}</div>
                              <div className="text-sm text-gray-500">
                                {new Date(order.created_at).toLocaleTimeString('fr-FR')}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="disputes" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Litiges</CardTitle>
                    <CardDescription>Gestion des litiges et réclamations</CardDescription>
                  </div>
                  <Button variant="outline" onClick={loadData}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualiser
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {disputes.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <p className="text-gray-500">Aucun litige actif</p>
                    </div>
                  ) : (
                    disputes.map((dispute) => (
                      <div key={dispute.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className={`h-5 w-5 ${
                            dispute.priority === 'high' ? 'text-red-500' :
                            dispute.priority === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                          }`} />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{dispute.reason}</span>
                              {getDisputeStatusBadge(dispute.status)}
                              {getPriorityBadge(dispute.priority)}
                            </div>
                            <p className="text-sm text-gray-600">{dispute.description}</p>
                            <div className="text-xs text-gray-500 mt-1">
                              {dispute.raised_by_name} • {new Date(dispute.created_at).toLocaleString('fr-FR')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            Détails
                          </Button>
                          {dispute.status === 'open' && (
                            <Button variant="outline" size="sm">
                              Assigner
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Catégories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats?.top_categories.slice(0, 5).map((category, index) => (
                      <div key={category.category} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            index === 0 ? 'bg-blue-500' :
                            index === 1 ? 'bg-green-500' :
                            index === 2 ? 'bg-yellow-500' :
                            index === 3 ? 'bg-orange-500' : 'bg-gray-500'
                          }`} />
                          <span>{category.category}</span>
                        </div>
                        <span className="font-medium">{category.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Vendeurs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats?.top_sellers.slice(0, 5).map((seller, index) => (
                      <div key={seller.seller_id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            index === 0 ? 'bg-blue-500' :
                            index === 1 ? 'bg-green-500' :
                            index === 2 ? 'bg-yellow-500' :
                            index === 3 ? 'bg-orange-500' : 'bg-gray-500'
                          }`} />
                          <span>{seller.seller_name}</span>
                        </div>
                        <span className="font-medium">{formatCurrency(seller.revenue)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
