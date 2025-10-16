import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { merchantService, MerchantSale } from './merchantService';

export const useMerchantSales = () => {
  const queryClient = useQueryClient();

  const sales = useQuery({
    queryKey: ['merchant', 'sales'],
    queryFn: () => merchantService.getSales(),
  });

  const createSale = useMutation({
    mutationFn: (sale: Omit<MerchantSale, 'id'>) => merchantService.createSale(sale),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant', 'sales'] });
      queryClient.invalidateQueries({ queryKey: ['merchant', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['merchant', 'payments'] });
    },
  });

  const generateSalesReport = useMutation({
    mutationFn: ({ startDate, endDate }: { startDate: string; endDate: string }) =>
      merchantService.generateSalesReport(startDate, endDate),
  });

  return {
    sales,
    createSale,
    generateSalesReport,
  };
};