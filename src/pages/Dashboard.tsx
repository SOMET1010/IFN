import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Redirect to appropriate dashboard based on user role
    switch (user.role) {
      case 'producer':
        navigate('/producer/dashboard');
        break;
      case 'merchant':
        navigate('/merchant/dashboard');
        break;
      case 'cooperative':
        navigate('/cooperative/dashboard');
        break;
      case 'admin':
        navigate('/admin/dashboard');
        break;
      default:
        navigate('/login');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirection...</h1>
        <p className="text-muted-foreground">Vous êtes redirigé vers votre espace de travail.</p>
      </div>
    </div>
  );
};