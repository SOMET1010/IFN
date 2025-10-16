import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { merchantService, MerchantPayment } from './merchantService';

export const useMerchantPayments = () => {
  const queryClient = useQueryClient();

  const payments = useQuery({
    queryKey: ['merchant', 'payments'],
    queryFn: () => merchantService.getPayments(),
  });

  const processPayment = useMutation({
    mutationFn: (payment: Omit<MerchantPayment, 'id' | 'status'>) =>
      merchantService.processPayment(payment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant', 'payments'] });
      queryClient.invalidateQueries({ queryKey: ['merchant', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['merchant', 'orders'] });
    },
  });

  return {
    payments,
    processPayment,
  };
};