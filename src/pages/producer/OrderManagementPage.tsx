import { OrderManagement } from '@/components/producer/OrderManagement';
import ProducerLayout from '@/components/producer/ProducerLayout';
import FloatingVoiceNavigator from '@/components/producer/FloatingVoiceNavigator';

const OrderManagementPage = () => {
  return (
    <ProducerLayout 
      title="Gestion des Commandes" 
      showBackButton={true} 
      backTo="/producer/dashboard"
    >
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <OrderManagement />
      </main>
      <FloatingVoiceNavigator />
    </ProducerLayout>
  );
};

export default OrderManagementPage;
