import { useQuery, useQueryClient } from '@tanstack/react-query';
import { merchantService, MerchantStats } from './merchantService';

export const useMerchantStats = () => {
  const queryClient = useQueryClient();

  const stats = useQuery({
    queryKey: ['merchant', 'stats'],
    queryFn: () => merchantService.getStats(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const refreshStats = () => {
    queryClient.invalidateQueries({ queryKey: ['merchant', 'stats'] });
  };

  return {
    stats,
    refreshStats,
  };
};