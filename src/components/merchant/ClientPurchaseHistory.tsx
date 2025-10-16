import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MerchantClient, ClientPurchaseHistory } from '@/types/merchant';
import { MerchantClientService } from '@/services/merchant/merchantClientService';
import { Search, Calendar, Filter, Download, Eye, ShoppingCart } from 'lucide-react';

interface ClientPurchaseHistoryProps {
  client: MerchantClient;
  refreshTrigger?: number;
}

export default function ClientPurchaseHistory({ client, refreshTrigger }: ClientPurchaseHistoryProps) {
  const [purchaseHistory, setPurchaseHistory] = useState<ClientPurchaseHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPurchase, setSelectedPurchase] = useState<ClientPurchaseHistory | null>(null);

  const clientService = MerchantClientService.getInstance();

  useEffect(() => {
    loadPurchaseHistory();
  }, [client.id, refreshTrigger]);

  const loadPurchaseHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const history = await clientService.getClientPurchaseHistory(client.id);
      setPurchaseHistory(history);
    } catch (err) {
      setError('Erreur lors du chargement de l\'historique');
      console.error('Error loading purchase history:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = purchaseHistory.filter(purchase => {
    const matchesSearch = searchTerm === '' ||
      purchase.products.some(product =>
        product.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesFilter = filter === 'all' || purchase.status === filter;

    return matchesSearch && matchesFilter;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'mobile_money': return 'Mobile Money';
      case 'cash': return 'Espèces';
      case 'bank_transfer': return 'Virement bancaire';
      case 'credit': return 'Crédit';
      default: return method;
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Produits', 'Total', 'Méthode de paiement', 'Statut'];
    const csvContent = [
      headers.join(','),
      ...filteredHistory.map(purchase => [
        new Date(purchase.purchaseDate).toLocaleDateString(),
        purchase.products.map(p => p.productName).join('; '),
        purchase.totalAmount,
        getPaymentMethodText(purchase.paymentMethod),
        getStatusText(purchase.status)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historique_achats_${client.name.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div>Chargement de l'historique...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Historique des Achats - {client.name}
            </div>
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher dans les produits..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="completed">Terminés</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="cancelled">Annulés</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredHistory.length === 0 ? (
            <Alert>
              <AlertDescription>
                Aucun achat trouvé pour les filtres sélectionnés.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Produits</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Méthode</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {new Date(purchase.purchaseDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <div className="text-sm font-medium">
                            {purchase.products.length} article(s)
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {purchase.products.slice(0, 2).map(p => p.productName).join(', ')}
                            {purchase.products.length > 2 && '...'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(purchase.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getPaymentMethodText(purchase.paymentMethod)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(purchase.status)}>
                          {getStatusText(purchase.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPurchase(purchase)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedPurchase && (
        <Card>
          <CardHeader>
            <CardTitle>Détails de l'achat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Date:</div>
                <div>{new Date(selectedPurchase.purchaseDate).toLocaleDateString()}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Statut:</div>
                <Badge className={getStatusBadgeColor(selectedPurchase.status)}>
                  {getStatusText(selectedPurchase.status)}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Méthode de paiement:</div>
                <div>{getPaymentMethodText(selectedPurchase.paymentMethod)}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Total:</div>
                <div className="text-lg font-semibold">
                  {formatCurrency(selectedPurchase.totalAmount)}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-sm font-medium mb-3">Produits achetés:</div>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead>Quantité</TableHead>
                      <TableHead>Prix unitaire</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedPurchase.products.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell>{product.productName}</TableCell>
                        <TableCell>{product.quantity}</TableCell>
                        <TableCell>{formatCurrency(product.unitPrice)}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(product.totalPrice)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedPurchase(null)}>
                Fermer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
