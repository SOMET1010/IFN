import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Search, Package, Calendar, DollarSign, CheckCircle, AlertTriangle, Download } from 'lucide-react';
import MerchantLayout from '@/components/merchant/MerchantLayout';
import { merchantCooperativeService, type MerchantNeed, type CooperativeOffer } from '@/services/merchant/merchantCooperativeService';
import { orderService, type GroupOrder } from '@/services/cooperative/orderService';
import { formatCurrency } from '@/lib/utils';

export default function MerchantNeeds() {
  const [needs, setNeeds] = useState<MerchantNeed[]>([]);
  const [matches, setMatches] = useState<Array<{ need: MerchantNeed; groupOrder: GroupOrder; matchScore: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedNeed, setSelectedNeed] = useState<MerchantNeed | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    quantity: '',
    unit: 'kg',
    category: 'Engrais',
    targetPrice: '',
    deadline: '',
  });

  const merchantId = 'MERCHANT-001'; // À récupérer de l'authentification
  const merchantName = 'Marchand Exemple'; // À récupérer de l'authentification

  useEffect(() => {
    fetchNeeds();
    fetchMatches();
  }, []);

  const fetchNeeds = () => {
    const merchantNeeds = merchantCooperativeService.getMerchantNeeds(merchantId);
    setNeeds(merchantNeeds);
  };

  const fetchMatches = () => {
    const allMatches = merchantCooperativeService.matchNeedsWithGroupOrders();
    setMatches(allMatches);
  };

  const handleCreateNeed = async () => {
    if (!formData.productName || !formData.quantity || !formData.deadline) {
      return;
    }

    setIsCreating(true);
    try {
      await merchantCooperativeService.createNeed({
        merchantId,
        merchantName,
        productName: formData.productName,
        description: formData.description,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        category: formData.category,
        targetPrice: formData.targetPrice ? Number(formData.targetPrice) : undefined,
        deadline: formData.deadline,
      });

      // Reset form
      setFormData({
        productName: '',
        description: '',
        quantity: '',
        unit: 'kg',
        category: 'Engrais',
        targetPrice: '',
        deadline: '',
      });

      fetchNeeds();
      fetchMatches();
    } catch (error) {
      console.error('Error creating need:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const filteredNeeds = useMemo(() => {
    let filtered = needs;

    if (searchTerm) {
      filtered = filtered.filter(need =>
        need.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        need.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(need => need.status === filterStatus);
    }

    return filtered;
  }, [needs, searchTerm, filterStatus]);

  const handleParticipate = (need: MerchantNeed, groupOrder: GroupOrder) => {
    try {
      merchantCooperativeService.participateInGroupOrder(
        merchantId,
        groupOrder.id,
        Math.min(need.quantity, groupOrder.maxQuantityPerParticipant),
        groupOrder.unitPrice
      );

      // Mettre à jour le statut du besoin
      merchantCooperativeService.updateNeed(need.id, { status: 'fulfilled' });
      
      fetchNeeds();
      fetchMatches();
    } catch (error) {
      console.error('Error participating in group order:', error);
    }
  };

  const exportData = () => {
    const data = merchantCooperativeService.exportNeedsData(merchantId);
    if (data) {
      const blob = new Blob([data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `besoins_approvisionnement_${merchantId}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
  };

  const categories = ['Engrais', 'Semences', 'Outils', 'Équipements', 'Produits phytosanitaires', 'Emballages', 'Autres'];
  const units = ['kg', 'g', 'L', 'mL', 'unités', 'sacs', 'bidons', 'boîtes', 'tonnes'];

  return (
    <MerchantLayout title="Besoins d'approvisionnement" showBackButton={true} backTo="/merchant/dashboard">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Tabs defaultValue="needs" className="space-y-4">
          <TabsList>
            <TabsTrigger value="needs">Mes besoins</TabsTrigger>
            <TabsTrigger value="matches">Correspondances</TabsTrigger>
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
          </TabsList>

          <TabsContent value="needs" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Mes besoins d'approvisionnement</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Exprimer un besoin
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Nouveau besoin d'approvisionnement</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Produit *</label>
                        <Input
                          value={formData.productName}
                          onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                          placeholder="Nom du produit"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Catégorie *</label>
                        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Quantité *</label>
                        <Input
                          type="number"
                          value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                          placeholder="Quantité"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Unité</label>
                        <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {units.map((unit) => (
                              <SelectItem key={unit} value={unit}>
                                {unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Prix cible (optionnel)</label>
                        <Input
                          type="number"
                          value={formData.targetPrice}
                          onChange={(e) => setFormData({ ...formData, targetPrice: e.target.value })}
                          placeholder="Prix unitaire souhaité"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Date limite *</label>
                        <Input
                          type="date"
                          value={formData.deadline}
                          onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Description détaillée de votre besoin..."
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setFormData({
                        productName: '',
                        description: '',
                        quantity: '',
                        unit: 'kg',
                        category: 'Engrais',
                        targetPrice: '',
                        deadline: '',
                      })}>
                        Annuler
                      </Button>
                      <Button onClick={handleCreateNeed} disabled={isCreating}>
                        {isCreating ? 'Création...' : 'Créer le besoin'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <Input
                  placeholder="Rechercher un besoin..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous statuts</SelectItem>
                  <SelectItem value="active">Actifs</SelectItem>
                  <SelectItem value="fulfilled">Satisfaits</SelectItem>
                  <SelectItem value="cancelled">Annulés</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredNeeds.length === 0 ? (
              <Alert>
                <Package className="h-4 w-4" />
                <AlertDescription>
                  {needs.length === 0 ? 'Vous n\'avez pas encore exprimé de besoin d\'approvisionnement.' : 'Aucun besoin ne correspond à votre recherche.'}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Produit</TableHead>
                      <TableHead className="hidden sm:table-cell whitespace-nowrap">Catégorie</TableHead>
                      <TableHead className="whitespace-nowrap">Quantité</TableHead>
                      <TableHead className="hidden md:table-cell whitespace-nowrap">Date limite</TableHead>
                      <TableHead className="whitespace-nowrap">Statut</TableHead>
                      <TableHead className="hidden lg:table-cell whitespace-nowrap">Offre</TableHead>
                      <TableHead className="whitespace-nowrap">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNeeds.map((need) => (
                      <TableRow key={need.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{need.productName}</div>
                            {need.description && (
                              <div className="text-sm text-muted-foreground">{need.description}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline">{need.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span>{need.quantity}</span>
                            <span className="text-muted-foreground">{need.unit}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(need.deadline).toLocaleDateString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {need.status === 'active' && (
                            <Badge variant="default">Actif</Badge>
                          )}
                          {need.status === 'fulfilled' && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Satisfait
                            </Badge>
                          )}
                          {need.status === 'cancelled' && (
                            <Badge variant="destructive">Annulé</Badge>
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {need.cooperativeOffer && (
                            <div className="text-sm">
                              <div className="font-medium">{formatCurrency(need.cooperativeOffer.savings)} économisés</div>
                              <div className="text-muted-foreground">{need.cooperativeOffer.unitPrice} FCFA/{need.unit}</div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedNeed(need)}
                          >
                            Voir détails
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="matches" className="space-y-4">
            <h2 className="text-xl font-semibold">Correspondances avec les commandes groupées</h2>
            
            {matches.length === 0 ? (
              <Alert>
                <Search className="h-4 w-4" />
                <AlertDescription>
                  Aucune correspondance trouvée entre vos besoins actifs et les commandes groupées disponibles.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {matches.map(({ need, groupOrder, matchScore }, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold">{need.productName}</h3>
                          <p className="text-sm text-muted-foreground">Besoins: {need.quantity} {need.unit}</p>
                        </div>
                        <Badge variant="outline">{matchScore}% de correspondance</Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Commande groupée disponible</h4>
                          <div className="space-y-1 text-sm">
                            <div><strong>Produit:</strong> {groupOrder.product}</div>
                            <div><strong>Quantité totale:</strong> {groupOrder.totalQuantity} {groupOrder.unit}</div>
                            <div><strong>Prix unitaire:</strong> {formatCurrency(groupOrder.unitPrice)}</div>
                            <div><strong>Économies:</strong> {formatCurrency((need.targetPrice || 1000) - groupOrder.unitPrice)}</div>
                            <div><strong>Date de livraison:</strong> {new Date(groupOrder.deliveryDate || '').toLocaleDateString()}</div>
                            <div><strong>Participants:</strong> {groupOrder.currentParticipants}/{groupOrder.targetParticipants}</div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Actions</h4>
                          <div className="space-y-2">
                            <Button
                              onClick={() => handleParticipate(need, groupOrder)}
                              disabled={groupOrder.currentParticipants >= groupOrder.targetParticipants}
                              className="w-full"
                            >
                              Participer à la commande
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => window.open(`/merchant/sourcing?groupId=${groupOrder.id}`, '_blank')}
                              className="w-full"
                            >
                              Voir détails de la commande
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <h2 className="text-xl font-semibold">Statistiques coopératives</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Package className="h-8 w-8 text-blue-600" />
                    <div>
                      <div className="text-2xl font-bold">{needs.length}</div>
                      <div className="text-sm text-muted-foreground">Besoins totaux</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div>
                      <div className="text-2xl font-bold">{needs.filter(n => n.status === 'fulfilled').length}</div>
                      <div className="text-sm text-muted-foreground">Besoins satisfaits</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-8 w-8 text-yellow-600" />
                    <div>
                      <div className="text-2xl font-bold">{formatCurrency(merchantCooperativeService.getStats(merchantId).totalSavings)}</div>
                      <div className="text-sm text-muted-foreground">Économies totales</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-8 w-8 text-orange-600" />
                    <div>
                      <div className="text-2xl font-bold">{matches.length}</div>
                      <div className="text-sm text-muted-foreground">Correspondances</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Export des données</h3>
                  <Button onClick={exportData} variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Exporter CSV
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Exportez tous vos besoins et participations aux commandes groupées pour analyse externe.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Détail du besoin */}
      {selectedNeed && (
        <Dialog open={!!selectedNeed} onOpenChange={() => setSelectedNeed(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Détail du besoin</DialogTitle>
            </DialogHeader>
            {selectedNeed && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">{selectedNeed.productName}</h3>
                  {selectedNeed.description && (
                    <p className="text-sm text-muted-foreground mt-1">{selectedNeed.description}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Catégorie</div>
                    <div>{selectedNeed.category}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Quantité</div>
                    <div>{selectedNeed.quantity} {selectedNeed.unit}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Date limite</div>
                    <div>{new Date(selectedNeed.deadline).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Statut</div>
                    <Badge variant={selectedNeed.status === 'active' ? 'default' : 'secondary'}>
                      {selectedNeed.status === 'active' ? 'Actif' : 'Satisfait'}
                    </Badge>
                  </div>
                </div>

                {selectedNeed.cooperativeOffer && (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Offre coopérative</h4>
                      <div className="space-y-1 text-sm">
                        <div><strong>Prix négocié:</strong> {formatCurrency(selectedNeed.cooperativeOffer.unitPrice)} FCFA/{selectedNeed.unit}</div>
                        <div><strong>Économies:</strong> {formatCurrency(selectedNeed.cooperativeOffer.savings)}</div>
                        <div><strong>Date de livraison:</strong> {new Date(selectedNeed.cooperativeOffer.deliveryDate).toLocaleDateString()}</div>
                      </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </MerchantLayout>
  );
}
