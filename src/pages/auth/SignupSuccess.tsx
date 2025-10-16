import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const SignupSuccess = () => {
  const navigate = useNavigate();

  const firstName = useMemo(() => {
    try {
      const raw = sessionStorage.getItem('signup_user') || sessionStorage.getItem('signup_details');
      if (!raw) return '';
      const obj = JSON.parse(raw);
      if (obj.firstName) return obj.firstName as string;
      if (obj.name) return String(obj.name).split(' ')[0];
      return '';
    } catch {
      return '';
    }
  }, []);

  const handleExplore = () => {
    try {
      sessionStorage.removeItem('signup_user');
      sessionStorage.removeItem('signup_role');
      sessionStorage.removeItem('signup_details');
      sessionStorage.removeItem('signup_progress');
    } catch (error) {
      // Silently ignore storage errors
    }
    navigate('/marketplace');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-xl w-full text-center space-y-6">
        <div className="mx-auto h-16 w-16 rounded-full bg-orange-50 flex items-center justify-center">
          <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border border-orange-200">
            <Check className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold">Bienvenue{firstName ? `, ${firstName}` : ''}!</h1>
          <p className="text-muted-foreground">
            Votre inscription a été effectuée avec succès. Vous pouvez maintenant explorer
            les fonctionnalités clés de l'application.
          </p>
        </div>
        <div className="flex justify-center">
          <Button variant="ivoire" onClick={handleExplore}>Explorer l'application</Button>
        </div>
      </div>
    </div>
  );
};

export default SignupSuccess;
