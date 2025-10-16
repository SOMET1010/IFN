import { VocalInterface } from '@/components/producer/VocalInterface';
import ProducerLayout from '@/components/producer/ProducerLayout';
import FloatingVoiceNavigator from '@/components/producer/FloatingVoiceNavigator';

const VocalInterfacePage = () => {
  return (
    <ProducerLayout 
      title="Interface Vocale" 
      showBackButton={true} 
      backTo="/producer/dashboard"
    >
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <VocalInterface />
      </main>
      <FloatingVoiceNavigator />
    </ProducerLayout>
  );
};

export default VocalInterfacePage;
