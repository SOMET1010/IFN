import { useState } from 'react';
import MerchantLayout from '@/components/merchant/MerchantLayout';
import MobileMoneySimulator from '@/components/merchant/MobileMoneySimulator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Smartphone,
  CreditCard,
  QrCode,
  History,
  Info,
  TrendingUp
} from 'lucide-react';

export default function MerchantMobileMoneyDemo() {
  const [demoAmount, setDemoAmount] = useState('5000');
  const [showSimulator, setShowSimulator] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<string | null>(null);

  const handlePaymentSuccess = (transactionCode: string) => {
    setLastTransaction(transactionCode);
    setTimeout(() => {
      setShowSimulator(false);
    }, 3000);
  };

  const quickAmounts = [1000, 2500, 5000, 10000, 25000, 50000];

  return (
    <MerchantLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mobile Money - Démonstration</h1>
          <p className="text-muted-foreground mt-2">
            Testez les paiements Mobile Money en mode simulation
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Mode Démonstration</p>
            <p className="mt-1">
              Cette page permet de tester le système de paiement Mobile Money en mode simulation.
              Aucun vrai paiement n'est effectué. Les transactions ont 90% de taux de réussite aléatoire.
            </p>
          </div>
        </div>

        <Tabs defaultValue="demo" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="demo">
              <Smartphone className="h-4 w-4 mr-2" />
              Démonstration
            </TabsTrigger>
            <TabsTrigger value="features">
              <CreditCard className="h-4 w-4 mr-2" />
              Fonctionnalités
            </TabsTrigger>
            <TabsTrigger value="info">
              <Info className="h-4 w-4 mr-2" />
              Informations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="demo" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuration du paiement</CardTitle>
                  <CardDescription>
                    Choisissez un montant pour tester le simulateur
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Montant (FCFA)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={demoAmount}
                      onChange={(e) => setDemoAmount(e.target.value)}
                      placeholder="Entrez un montant"
                      min="100"
                      max="5000000"
                    />
                  </div>

                  <div>
                    <Label className="mb-3 block">Montants rapides</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {quickAmounts.map((amount) => (
                        <Button
                          key={amount}
                          variant="outline"
                          size="sm"
                          onClick={() => setDemoAmount(amount.toString())}
                          className="text-xs"
                        >
                          {amount.toLocaleString()} F
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => setShowSimulator(true)}
                    className="w-full"
                    size="lg"
                    disabled={!demoAmount || parseFloat(demoAmount) < 100}
                  >
                    <Smartphone className="h-5 w-5 mr-2" />
                    Lancer la simulation
                  </Button>

                  {lastTransaction && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-green-800">Dernier paiement réussi</p>
                      <p className="text-xs text-green-700 mt-1 font-mono">{lastTransaction}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div>
                {showSimulator ? (
                  <MobileMoneySimulator
                    amount={parseFloat(demoAmount)}
                    referenceType="sale"
                    onSuccess={handlePaymentSuccess}
                    onCancel={() => setShowSimulator(false)}
                  />
                ) : (
                  <Card className="h-full flex items-center justify-center min-h-[400px]">
                    <CardContent className="text-center space-y-3">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                        <Smartphone className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-muted-foreground">
                        Le simulateur apparaîtra ici
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Configurez un montant et cliquez sur "Lancer la simulation"
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Opérateurs supportés</CardTitle>
                <CardDescription>
                  Tous les principaux opérateurs de Côte d'Ivoire
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="border rounded-lg p-4 text-center space-y-2">
                    <div className="text-4xl">🟠</div>
                    <h3 className="font-semibold">Orange Money</h3>
                    <p className="text-xs text-muted-foreground">#144#</p>
                    <Badge variant="secondary" className="text-xs">100 - 5M FCFA</Badge>
                  </div>

                  <div className="border rounded-lg p-4 text-center space-y-2">
                    <div className="text-4xl">🟡</div>
                    <h3 className="font-semibold">MTN Money</h3>
                    <p className="text-xs text-muted-foreground">*133#</p>
                    <Badge variant="secondary" className="text-xs">100 - 5M FCFA</Badge>
                  </div>

                  <div className="border rounded-lg p-4 text-center space-y-2">
                    <div className="text-4xl">🔵</div>
                    <h3 className="font-semibold">Wave</h3>
                    <p className="text-xs text-muted-foreground">*170#</p>
                    <Badge variant="secondary" className="text-xs">100 - 5M FCFA</Badge>
                  </div>

                  <div className="border rounded-lg p-4 text-center space-y-2">
                    <div className="text-4xl">🔴</div>
                    <h3 className="font-semibold">Moov Money</h3>
                    <p className="text-xs text-muted-foreground">#155#</p>
                    <Badge variant="secondary" className="text-xs">100 - 5M FCFA</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Fonctionnalités actuelles</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      <span className="text-sm">Support multi-opérateurs (Orange, MTN, Wave, Moov)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      <span className="text-sm">Validation des numéros de téléphone</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      <span className="text-sm">Vérification des limites de transaction</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      <span className="text-sm">Génération automatique de codes de transaction</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      <span className="text-sm">Simulation réaliste (90% de succès)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      <span className="text-sm">Gestion des échecs avec raisons</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      <span className="text-sm">Historique des transactions en base</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Prochaines fonctionnalités</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <QrCode className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">QR Code de paiement dynamique</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <History className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Page d'historique des transactions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Statistiques et rapports</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CreditCard className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Export des transactions en CSV</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="info" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>À propos du simulateur</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Mode Simulation</h3>
                  <p className="text-sm text-muted-foreground">
                    Le simulateur Mobile Money permet de tester l'intégration des paiements sans effectuer de vraies transactions.
                    Il reproduit fidèlement le comportement réel des opérateurs Mobile Money avec un taux de réussite de 90%.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Flux de paiement</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Sélection de l'opérateur Mobile Money</li>
                    <li>Saisie du numéro de téléphone</li>
                    <li>Confirmation du montant et des informations</li>
                    <li>Traitement simulé du paiement (3 secondes)</li>
                    <li>Résultat : succès ou échec avec raison</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Limites de transaction</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="border rounded p-2">
                      <p className="text-muted-foreground">Minimum</p>
                      <p className="font-bold">100 FCFA</p>
                    </div>
                    <div className="border rounded p-2">
                      <p className="text-muted-foreground">Maximum</p>
                      <p className="font-bold">5 000 000 FCFA</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Format des numéros</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Le système accepte plusieurs formats de numéros ivoiriens :
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>+225 07 XX XX XX XX</li>
                    <li>225 07 XX XX XX XX</li>
                    <li>07 XX XX XX XX</li>
                    <li>07XXXXXXXX</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-yellow-800">Note importante</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    En production, ce simulateur sera remplacé par les vraies APIs des opérateurs Mobile Money.
                    Toutes les transactions seront réelles et nécessiteront une authentification sécurisée.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MerchantLayout>
  );
}
