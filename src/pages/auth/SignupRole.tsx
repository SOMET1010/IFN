import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Tractor, Building } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAnimatedProgress } from '@/hooks/useAnimatedProgress';

type SignupRole = 'merchant' | 'producer' | 'cooperative';

const RoleCard = ({
  icon: Icon,
  title,
  description,
  selected,
  onClick,
}: {
  icon: any;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) => (
  <Card
    onClick={onClick}
    className={`cursor-pointer transition border-2 ${
      selected ? 'border-primary ring-2 ring-primary/20' : 'border-muted'
    }`}
  >
    <CardContent className="p-6 text-center space-y-3">
      <div className="flex justify-center">
        <Icon className="h-10 w-10 text-primary" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const SignupRole = () => {
  const [role, setRole] = useState<SignupRole | null>(null);
  const navigate = useNavigate();
  const progress = useAnimatedProgress(33);

  const handleNext = () => {
    if (!role) return;
    // store temporary choice for the next step
    sessionStorage.setItem('signup_role', role);
    navigate(`/signup/details?role=${role}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <div className="w-full max-w-5xl px-4 sm:px-6 py-10 sm:py-16">
        <div className="space-y-6 mb-8">
          <div className="text-center space-y-3">
            <h1 className="text-3xl sm:text-4xl font-bold">Choisissez votre profil</h1>
            <p className="text-muted-foreground">
              Sélectionnez le rôle qui vous correspond le mieux pour commencer.
            </p>
          </div>
          <div>
            <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground mb-1">
              <span>Progression</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <RoleCard
            icon={Store}
            title="Marchand"
            description="Vendez vos produits directement aux consommateurs."
            selected={role === 'merchant'}
            onClick={() => setRole('merchant')}
          />
          <RoleCard
            icon={Tractor}
            title="Producteur"
            description="Cultivez et fournissez les matières premières."
            selected={role === 'producer'}
            onClick={() => setRole('producer')}
          />
          <RoleCard
            icon={Building}
            title="Coopérative"
            description="Gérez un groupe d'agriculteurs et vos opérations."
            selected={role === 'cooperative'}
            onClick={() => setRole('cooperative')}
          />
        </div>

        <div className="flex justify-between mt-8 sm:mt-10">
          <Button variant="outline" onClick={() => { try { sessionStorage.removeItem('signup_progress'); } catch (error) {
            // Silently ignore storage errors
          } ; navigate('/login'); }}>Précédent</Button>
          <Button onClick={handleNext} disabled={!role} className="min-w-40">Suivant</Button>
        </div>
      </div>
    </div>
  );
};

export default SignupRole;
