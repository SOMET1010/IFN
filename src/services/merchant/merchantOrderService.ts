import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { merchantService, MerchantOrder } from './merchantService';

export const useMerchantOrders = () => {
  const queryClient = useQueryClient();

  const orders = useQuery({
    queryKey: ['merchant', 'orders'],
    queryFn: () => merchantService.getOrders(),
  });

  const order = useQuery({
    queryKey: ['merchant', 'order'],
    queryFn: ({ queryKey }) => {
      const id = queryKey[2] as string;
      return merchantService.getOrder(id);
    },
    enabled: false,
  });

  const updateOrderStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: MerchantOrder['status'] }) =>
      merchantService.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['merchant', 'stats'] });
    },
  });

  const bulkOrderUpdate = useMutation({
    mutationFn: (orders: Array<{ id: string; status: MerchantOrder['status'] }>) =>
      merchantService.bulkOrderUpdate(orders),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['merchant', 'stats'] });
    },
  });

  const getOrderById = (id: string) => {
    return queryClient.fetchQuery({
      queryKey: ['merchant', 'order', id],
      queryFn: () => merchantService.getOrder(id),
    });
  };

  return {
    orders,
    order,
    updateOrderStatus,
    bulkOrderUpdate,
    getOrderById,
  };
};