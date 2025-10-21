import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Store, Sprout, Users, ArrowLeft, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type UserRole = 'merchant' | 'producer' | 'cooperative';

interface RoleOption {
  id: UserRole;
  title: string;
  description: string;
  features: string[];
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  borderColor: string;
}

const roleOptions: RoleOption[] = [
  {
    id: 'merchant',
    title: 'Commerçant',
    description: 'Gérez votre boutique et vos ventes au quotidien',
    features: [
      'Gestion des stocks et inventaire',
      'Suivi des ventes et clients',
      'Approvisionnement auprès des producteurs',
      'Paiements Mobile Money intégrés',
    ],
    icon: Store,
    gradient: 'from-blue-500/10 to-cyan-500/10',
    borderColor: 'border-blue-500/30 hover:border-blue-500',
  },
  {
    id: 'producer',
    title: 'Producteur',
    description: 'Commercialisez vos récoltes et gérez votre production',
    features: [
      'Publication d\'offres et produits',
      'Gestion des récoltes et stocks',
      'Interface vocale simplifiée',
      'Suivi des revenus et transactions',
    ],
    icon: Sprout,
    gradient: 'from-green-500/10 to-emerald-500/10',
    borderColor: 'border-green-500/30 hover:border-green-500',
  },
  {
    id: 'cooperative',
    title: 'Coopérative',
    description: 'Coordonnez les membres et optimisez les négociations',
    features: [
      'Gestion des membres et cotisations',
      'Agrégation des commandes groupées',
      'Négociation collective avec acheteurs',
      'Distribution équitable des revenus',
    ],
    icon: Users,
    gradient: 'from-orange-500/10 to-amber-500/10',
    borderColor: 'border-orange-500/30 hover:border-orange-500',
  },
];

export default function SignupRole() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (!selectedRole) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner un type de compte avant de continuer.",
        variant: "destructive",
      });
      return;
    }

    navigate('/signup/details', { state: { role: selectedRole } });
  };

  const handleBack = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-6xl space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center">
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Créer un compte</h1>
          <p className="text-muted-foreground text-base md:text-lg">
            Choisissez le type de compte qui correspond à votre activité
          </p>

          <div className="flex items-center justify-center gap-2 pt-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <span className="text-sm font-medium">Type de compte</span>
            </div>
            <div className="w-12 h-0.5 bg-muted"></div>
            <div className="flex items-center gap-2 opacity-50">
              <div className="w-8 h-8 rounded-full border-2 border-muted flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <span className="text-sm font-medium">Informations</span>
            </div>
            <div className="w-12 h-0.5 bg-muted"></div>
            <div className="flex items-center gap-2 opacity-50">
              <div className="w-8 h-8 rounded-full border-2 border-muted flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <span className="text-sm font-medium">Confirmation</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roleOptions.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;

            return (
              <Card
                key={role.id}
                className={cn(
                  "relative cursor-pointer transition-all duration-300 hover:shadow-lg border-2",
                  role.borderColor,
                  isSelected && "ring-2 ring-primary ring-offset-2 shadow-lg scale-105"
                )}
                onClick={() => handleRoleSelect(role.id)}
              >
                {isSelected && (
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg z-10">
                    <Check className="h-6 w-6 text-primary-foreground" />
                  </div>
                )}

                <CardHeader className={cn("pb-4", `bg-gradient-to-br ${role.gradient}`)}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-background/80 backdrop-blur-sm flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl">{role.title}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-base mt-2">
                    {role.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-foreground mb-3">
                      Fonctionnalités incluses :
                    </p>
                    <ul className="space-y-2">
                      {role.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la connexion
          </Button>

          <Button
            type="button"
            variant="ivoire"
            size="lg"
            onClick={handleContinue}
            disabled={!selectedRole}
            className="w-full sm:w-auto order-1 sm:order-2 min-w-[200px]"
          >
            Continuer
          </Button>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Vous avez déjà un compte ?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-primary font-medium hover:underline"
            >
              Se connecter
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
