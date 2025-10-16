import { ProductionManagement } from '@/components/producer/ProductionManagement';
import ProducerLayout from '@/components/producer/ProducerLayout';
import FloatingVoiceNavigator from '@/components/producer/FloatingVoiceNavigator';

const ProductionManagementPage = () => {
  return (
    <ProducerLayout 
      title="Gestion de Production" 
      showBackButton={true} 
      backTo="/producer/dashboard"
    >
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <ProductionManagement />
      </main>
      <FloatingVoiceNavigator />
    </ProducerLayout>
  );
};

export default ProductionManagementPage;
