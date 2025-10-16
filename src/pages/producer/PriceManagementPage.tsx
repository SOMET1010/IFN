import { PriceManagement } from '@/components/producer/PriceManagement';
import ProducerLayout from '@/components/producer/ProducerLayout';
import FloatingVoiceNavigator from '@/components/producer/FloatingVoiceNavigator';

const PriceManagementPage = () => {
  return (
    <ProducerLayout 
      title="Gestion des Prix" 
      showBackButton={true} 
      backTo="/producer/dashboard"
    >
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <PriceManagement />
      </main>
      <FloatingVoiceNavigator />
    </ProducerLayout>
  );
};

export default PriceManagementPage;
