import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login page
    navigate('/login');
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Redirection...</h1>
        <p className="text-xl text-muted-foreground">Vous êtes redirigé vers la page de connexion.</p>
      </div>
    </div>
  );
};

export default Index;
