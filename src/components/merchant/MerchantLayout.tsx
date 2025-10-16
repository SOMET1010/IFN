import { ReactNode } from 'react';
import { MerchantHeader } from '@/components/merchant/MerchantHeader';
import FloatingVoiceNavigator from '@/components/merchant/FloatingVoiceNavigator';

interface MerchantLayoutProps {
  children: ReactNode;
  title: string;
  showNotification?: boolean;
  showCommunication?: boolean;
  showBackButton?: boolean;
  backTo?: string;
}

export default function MerchantLayout({
  children,
  title,
  showNotification = true,
  showCommunication = true,
  showBackButton = false,
  backTo
}: MerchantLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-r from-primary/5 to-secondary/5">
      <MerchantHeader 
        title={title}
        showNotification={showNotification}
        showCommunication={showCommunication}
        showBackButton={showBackButton}
        backTo={backTo}
      />
      {children}
      <FloatingVoiceNavigator />
    </div>
  );
}
