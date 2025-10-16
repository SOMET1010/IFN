import { ActionGrid } from '@/components/common/ActionGrid';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingCart,
  Package,
  TrendingUp,
  Clock,
  Star,
  Bell,
  HelpCircle
} from 'lucide-react';
import MerchantLayout from '@/components/merchant/MerchantLayout';
import FloatingVoiceNavigator from '@/components/merchant/FloatingVoiceNavigator';

// Import des icônes personnalisées
import venteIcon from '@/assets/icones/merchant/vente.png';
import stockIcon from '@/assets/icones/merchant/stock.png';
import approvisionnementIcon from '@/assets/icones/merchant/approvisionnement.png';
import socialIcon from '@/assets/icones/merchant/social.png';
import profilIcon from '@/assets/icones/merchant/profil.png';
import parametreIcon from '@/assets/icones/merchant/parametre.png';

const MerchantDashboard = () => {
  const { user } = useAuth();

  // Obtenir la salutation en fonction de l'heure
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  // Obtenir la période de la journée pour le message contextuel
  const getTimeContext = () => {
    const hour = new Date().getHours();
    if (hour < 9) return { message: 'Préparez votre journée', icon: <Clock className="h-4 w-4" /> };
    if (hour < 12) return { message: 'Bonne vente', icon: <TrendingUp className="h-4 w-4" /> };
    if (hour < 14) return { message: 'Pause déjeuner ?', icon: <Star className="h-4 w-4" /> };
    if (hour < 18) return { message: 'Continuez vos ventes', icon: <ShoppingCart className="h-4 w-4" /> };
    return { message: 'Préparez la clôture', icon: <Package className="h-4 w-4" /> };
  };

  const timeContext = getTimeContext();

  return (
    <MerchantLayout
      title="Tableau de bord"
      showNotification={true}
      showCommunication={true}
    >
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Section d'en-tête améliorée */}
        <div className="mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
                {getGreeting()}, {user?.name || user?.email?.split('@')[0] || 'Marchand'} !
              </h1>
              <p className="text-lg text-muted-foreground mb-3">
                Bienvenue dans votre espace de gestion commerciale
              </p>
            </div>
          </div>
        </div>

        {/* Section Actions rapides */}
        <div className="mb-8 sm:mb-12">
          <ActionGrid
            items={[
              {
                to: '/merchant/sales',
                icon: <img src={venteIcon} alt="Ventes" className="w-full h-full object-contain" />,
                label: 'Ventes'
              },
              {
                to: '/merchant/inventory',
                icon: <img src={stockIcon} alt="Stocks" className="w-full h-full object-contain" />,
                label: "Stocks"
              },
              {
                to: '/merchant/needs',
                icon: <img src={approvisionnementIcon} alt="Approvisionnement" className="w-full h-full object-contain" />,
                label: 'Approvisionnement'
              },
              {
                to: '/merchant/social',
                icon: <img src={socialIcon} alt="Protection sociale" className="w-full h-full object-contain" />,
                label: 'Protection sociale'
              },
              {
                to: '/merchant/profile',
                icon: <img src={profilIcon} alt="Mon Profil" className="w-full h-full object-contain" />,
                label: 'Mon Profil'
              },
              {
                to: '/merchant/settings',
                icon: <img src={parametreIcon} alt="Paramètres" className="w-full h-full object-contain" />,
                label: 'Paramètres'
              },
            ]}
          />
        </div>


      </main>
    </MerchantLayout>
  );
};

export default MerchantDashboard;
