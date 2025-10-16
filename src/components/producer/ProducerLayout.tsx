import { ReactNode } from 'react';
import { ProducerHeader } from '@/components/producer/ProducerHeader';

interface ProducerLayoutProps {
  children: ReactNode;
  title: string;
  showNotification?: boolean;
  showCommunication?: boolean;
  showBackButton?: boolean;
  backTo?: string;
}

export default function ProducerLayout({
  children,
  title,
  showNotification = true,
  showCommunication = true,
  showBackButton = false,
  backTo
}: ProducerLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-r from-primary/5 to-secondary/5">
      <ProducerHeader 
        title={title}
        showNotification={showNotification}
        showCommunication={showCommunication}
        showBackButton={showBackButton}
        backTo={backTo}
      />
      {children}
    </div>
  );
}
