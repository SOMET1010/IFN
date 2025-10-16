import { DashboardLayout } from '@/components/common/DashboardLayout';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Truck, MapPin, Clock, CheckCircle, Signature, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { inventoryService } from '@/services/cooperative/inventoryService';
import { logisticsService } from '@/services/cooperative/logisticsService';

const CooperativeDistribution = () => {
  const [distributions, setDistributions] = useState([
    { 
      id: "DIST-001", 
      product: "Engrais bio", 
      totalQuantity: "500 kg",
      distributed: 350,
      route: "Zone Nord",
      deliveryDate: "2024-03-20",
      members: ["Kouadio", "Fatou", "Yao", "Aminata"],
      status: "in_progress",
      driver: "Transport Ivoire"
    },
    { 
      id: "DIST-002", 
      product: "Semences de cacao", 
      totalQuantity: "200 kg",
      distributed: 200,
      route: "Zone Sud",
      deliveryDate: "2024-03-18",
      members: ["N'Guessan", "Koffi", "Adjoua"],
      status: "completed",
      driver: "Logistics CI"
    },
    { 
      id: "DIST-003", 
      product: "Outils agricoles", 
      totalQuantity: "25 unités",
      distributed: 0,
      route: "Zone Est",
      deliveryDate: "2024-03-25",
      members: ["Bamba", "Assita", "Ibrahim", "Marie", "Pierre"],
      status: "scheduled",
      driver: "Transport Coopé"
    },
  ]);

  const [completeDialog, setCompleteDialog] = useState<{ open: boolean; id?: string; signer?: string; photos?: string[] }>({ open: false });

  const startDelivery = (id: string) => {
    const updated = distributions.map((d: any) => {
      if (d.id === id && d.status === 'scheduled') {
        const [qtyStr, unitRaw] = String(d.totalQuantity).split(' ');
        const qty = parseInt(qtyStr || '0');
        const unit = (unitRaw || 'kg').toLowerCase() === 'unités' ? 'unité' : (unitRaw || 'kg');
        // Réserver le stock (si disponible)
        inventoryService.allocateStock({ productName: d.product, unit, quantity: qty, purpose: 'distribution', reference: d.id });
        return { ...d, status: 'in_progress' };
      }
      return d;
    });
    setDistributions(updated as any);
  };

  const printBL = (dist: any) => {
    const w = window.open('', '_blank');
    if (!w) return;
    const now = new Date().toLocaleString('fr-FR');
    w.document.write(`
      <html><head><title>Bon de Livraison ${dist.id}</title>
      <style>body{font-family:Arial;padding:24px} h1{font-size:18px} .row{display:flex;justify-content:space-between;margin:6px 0} .muted{color:#666}</style>
      </head><body>
        <h1>Bon de Livraison</h1>
        <div class="row"><div>BL</div><div><strong>${dist.id}</strong></div></div>
        <div class="row"><div>Date</div><div>${now}</div></div>
        <div class="row"><div>Produit</div><div>${dist.product}</div></div>
        <div class="row"><div>Quantité</div><div>${dist.distributed}/${dist.totalQuantity}</div></div>
        <div class="row"><div>Zone</div><div>${dist.route}</div></div>
        <div class="row"><div>Transporteur</div><div>${dist.driver}</div></div>
        ${dist._signer ? `<div class="row"><div>Signataire</div><div>${dist._signer}</div></div>` : ''}
        <p class="muted">Livraison confirmée.</p>
        <script>window.onload=function(){window.print();}</script>
      </body></html>
    `);
    w.document.close();
  };

  const distributionStats = [
    { title: "Distributions actives", value: "3", icon: Truck },
    { title: "Taux de livraison", value: "95%", icon: CheckCircle },
    { title: "Membres desservis", value: "45", icon: MapPin },
    { title: "Retards", value: "2", icon: Clock },
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      scheduled: "outline",
      in_progress: "default",
      completed: "secondary"
    } as const;
    
    const labels = {
      scheduled: "Programmé",
      in_progress: "En cours",
      completed: "Terminé"
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getDistributionPercentage = (distributed: number, total: number) => {
    return Math.round((distributed / total) * 100);
  };

  const openComplete = (id: string) => setCompleteDialog({ open: true, id });
  const confirmComplete = () => {
    if (!completeDialog.id) return;
    const signer = completeDialog.signer?.trim();
    if (!signer) return;
    const updated = distributions.map((d: any) => {
      if (d.id === completeDialog.id) {
        const qty = parseInt(String(d.distributed));
        const unit = (String(d.totalQuantity).split(' ')[1] || 'kg');
        inventoryService.completeDistribution(d.product, unit, qty || 0);
        logisticsService.recordSignature(d.id, signer, completeDialog.photos || []);
        return { ...d, status: 'completed', _signer: signer, _completedAt: new Date().toISOString(), _photos: completeDialog.photos || [] };
      }
      return d;
    });
    setDistributions(updated as any);
    setCompleteDialog({ open: false });
  };

  return (
    <DashboardLayout title="Distribution" subtitle="Gérez la distribution des commandes aux membres">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {distributionStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Distributions en cours</h2>
          <Button variant="ivoire" className="gap-2" asChild>
            <Link to="/cooperative/allocations">
              <Truck className="h-4 w-4" />
              Planifier Distribution
            </Link>
          </Button>
        </div>

        <div className="grid gap-6">
          {distributions.map((dist) => (
            <Card key={dist.id} className="transition-all hover:shadow-md">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {dist.product}
                      {getStatusBadge(dist.status)}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Distribution #{dist.id} • {dist.route}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">
                      {dist.distributed}/{dist.totalQuantity}
                    </p>
                    <p className="text-sm text-muted-foreground">Distribué</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progression</span>
                      <span>{getDistributionPercentage(dist.distributed, parseInt(dist.totalQuantity))}%</span>
                    </div>
                    <Progress 
                      value={getDistributionPercentage(dist.distributed, parseInt(dist.totalQuantity))} 
                      className="h-2"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Zone de livraison</span>
                      </div>
                      <p className="font-semibold">{dist.route}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Date prévue</span>
                      </div>
                      <p className="font-semibold">{dist.deliveryDate}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Transporteur</span>
                      </div>
                      <p className="font-semibold">{dist.driver}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium">Membres concernés ({dist.members.length})</span>
                    <div className="flex flex-wrap gap-2">
                      {dist.members.map((member, index) => (
                        <Badge key={index} variant="outline">{member}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    <Button variant="outline" size="sm">Voir détails</Button>
                    {dist.status === 'scheduled' && (
                      <Button variant="default" size="sm" onClick={() => startDelivery(dist.id)}>Démarrer livraison</Button>
                    )}
                    {dist.status === 'in_progress' && (
                      <Button variant="ivoire" size="sm" className="gap-2" onClick={() => openComplete(dist.id)}>
                        <Signature className="h-4 w-4" />
                        Marquer comme terminé
                      </Button>
                    )}
                    {(dist.status === 'in_progress' || dist.status === 'scheduled') && (
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/cooperative/allocations">Voir allocations</Link>
                      </Button>
                    )}
                    {dist.status === 'completed' && (
                      <Button variant="outline" size="sm" onClick={() => printBL(dist)}>Bon de livraison</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={completeDialog.open} onOpenChange={(open) => setCompleteDialog(prev => ({ ...prev, open }))}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Signature de réception</DialogTitle>
              <DialogDescription>Confirmez la livraison avec le nom du signataire.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Label>Nom du signataire</Label>
              <Input value={completeDialog.signer || ''} onChange={e => setCompleteDialog(prev => ({ ...prev, signer: e.target.value }))} placeholder="Ex: Yao N'Guessan" />
              <div>
                <Label>Preuves photo (facultatif)</Label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => {
                    const names = Array.from(e.target.files || []).map(f => f.name);
                    setCompleteDialog(prev => ({ ...prev, photos: names }));
                  }}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setCompleteDialog({ open: false })}>Annuler</Button>
                <Button onClick={confirmComplete} className="gap-2"><CheckCircle className="h-4 w-4"/>Confirmer</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        {/* Signatures */}
        <Card>
          <CardHeader>
            <CardTitle>Preuves de livraison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {distributions.map((d: any) => {
                const sigs = logisticsService.getSignatures(d.id);
                if (sigs.length === 0) return null;
                const last = sigs[0];
                return (
                  <div key={d.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{d.id} — {d.product}</p>
                        <p className="text-xs text-muted-foreground">Signé par {last.signer} le {new Date(last.date).toLocaleString('fr-FR')}</p>
                      </div>
                      <Badge variant="outline">{d.status}</Badge>
                    </div>
                    {last.photos && last.photos.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {last.photos.map((p, i) => (
                          <span key={i} className="inline-flex items-center gap-1 text-xs px-2 py-1 border rounded">
                            <ImageIcon className="h-3 w-3"/>{p}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CooperativeDistribution;
