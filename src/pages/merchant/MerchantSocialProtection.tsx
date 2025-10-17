import { useState, useEffect } from 'react';
import MerchantLayout from '@/components/merchant/MerchantLayout';
import { useAuth } from '@/contexts/AuthContext';
import { socialProtectionService, ContributionPlan, SocialBenefit } from '@/services/social/socialProtectionService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Shield,
  Heart,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function MerchantSocialProtection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<ContributionPlan[]>([]);
  const [benefits, setBenefits] = useState<SocialBenefit[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [plansData, benefitsData, statsData] = await Promise.all([
        socialProtectionService.getContributionPlans(),
        socialProtectionService.getAvailableBenefits(),
        socialProtectionService.getContributionStats(user.id)
      ]);

      setPlans(plansData);
      setBenefits(benefitsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) return;

    if (stats?.hasActiveContribution) {
      toast({
        title: 'Déjà abonné',
        description: 'Vous avez déjà une cotisation active',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubscribing(planId);
      await socialProtectionService.subscribeToplan(user.id, planId, 'monthly');

      toast({
        title: 'Souscription réussie',
        description: 'Vous êtes maintenant protégé',
      });

      loadData();
    } catch (error) {
      console.error('Error subscribing:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de souscrire',
        variant: 'destructive',
      });
    } finally {
      setSubscribing(null);
    }
  };

  const getCoverageColor = (type: string) => {
    const colors = {
      basic: 'bg-blue-100 text-blue-800',
      standard: 'bg-green-100 text-green-800',
      premium: 'bg-purple-100 text-purple-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getBenefitTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      medical: 'Médical',
      maternity: 'Maternité',
      retirement: 'Retraite',
      disability: 'Invalidité',
      death: 'Décès',
      emergency: 'Urgence'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <MerchantLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MerchantLayout>
    );
  }

  return (
    <MerchantLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Protection Sociale</h1>
          <p className="text-muted-foreground mt-2">
            Gérez vos cotisations et prestations sociales
          </p>
        </div>

        {stats && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Statut
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {stats.hasActiveContribution ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="text-xl font-bold text-green-600">Actif</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-gray-400" />
                      <span className="text-xl font-bold text-gray-400">Inactif</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Cotisé
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPaid.toLocaleString()} F</div>
                <p className="text-xs text-muted-foreground mt-1">{stats.totalMonths} mois</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Prestations Reçues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalClaimed.toLocaleString()} F</div>
                <p className="text-xs text-muted-foreground mt-1">{stats.approvedClaims} demandes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Fonds Mutuels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalFundContributions.toLocaleString()} F</div>
                <p className="text-xs text-muted-foreground mt-1">Contributions</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="plans" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="plans">
              <Shield className="h-4 w-4 mr-2" />
              Plans
            </TabsTrigger>
            <TabsTrigger value="benefits">
              <Heart className="h-4 w-4 mr-2" />
              Prestations
            </TabsTrigger>
            <TabsTrigger value="funds">
              <Users className="h-4 w-4 mr-2" />
              Fonds Mutuels
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="space-y-4">
            {stats?.hasActiveContribution && stats.activeContribution && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Votre Plan Actif
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{stats.activeContribution.plan?.name}</h3>
                      <Badge className={getCoverageColor(stats.activeContribution.plan?.coverage_type)}>
                        {stats.activeContribution.plan?.coverage_type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{stats.activeContribution.plan?.description}</p>
                    <div className="grid grid-cols-2 gap-4 pt-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Cotisation mensuelle</p>
                        <p className="text-lg font-bold">{stats.activeContribution.plan?.monthly_amount.toLocaleString()} F</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Couverture max</p>
                        <p className="text-lg font-bold">{stats.activeContribution.plan?.max_claim_amount.toLocaleString()} F</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4 md:grid-cols-3">
              {plans.map((plan) => (
                <Card key={plan.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle>{plan.name}</CardTitle>
                      <Badge className={getCoverageColor(plan.coverage_type)}>
                        {plan.coverage_type}
                      </Badge>
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <div className="space-y-3 flex-1">
                      <div>
                        <p className="text-3xl font-bold text-primary">
                          {plan.monthly_amount.toLocaleString()} F
                        </p>
                        <p className="text-sm text-muted-foreground">par mois</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Avantages inclus :</p>
                        <ul className="space-y-1">
                          {plan.benefits_included.map((benefit, idx) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-2 border-t">
                        <p className="text-sm text-muted-foreground">Couverture maximale</p>
                        <p className="text-lg font-bold">{plan.max_claim_amount.toLocaleString()} F</p>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={!!subscribing || stats?.hasActiveContribution}
                      className="w-full mt-4"
                    >
                      {subscribing === plan.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Souscription...
                        </>
                      ) : stats?.hasActiveContribution ? (
                        'Déjà abonné'
                      ) : (
                        'Souscrire'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="benefits" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {benefits.map((benefit) => (
                <Card key={benefit.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{benefit.name}</CardTitle>
                      <Badge variant="secondary">
                        {getBenefitTypeLabel(benefit.benefit_type)}
                      </Badge>
                    </div>
                    <CardDescription>{benefit.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Montant de base</span>
                        <span className="font-bold">{benefit.base_amount.toLocaleString()} F</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Mois requis</span>
                        <span className="font-medium">{benefit.required_months} mois</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Couverture requise</span>
                        <Badge className={getCoverageColor(benefit.required_coverage)} variant="outline">
                          {benefit.required_coverage}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="funds" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Fonds Mutuels Coopératifs</CardTitle>
                <CardDescription>
                  Contribuez aux fonds solidaires pour soutenir la communauté
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Fonctionnalité en développement</p>
                    <p className="mt-1">
                      Les fonds mutuels permettront de mutualiser les ressources pour des projets
                      communautaires, urgences et investissements solidaires.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MerchantLayout>
  );
}
