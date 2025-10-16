import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { merchantService, MerchantInventory } from './merchantService';

export const useMerchantInventory = () => {
  const queryClient = useQueryClient();

  const inventory = useQuery({
    queryKey: ['merchant', 'inventory'],
    queryFn: () => merchantService.getInventory(),
  });

  const lowStockItems = useQuery({
    queryKey: ['merchant', 'inventory', 'low-stock'],
    queryFn: () => merchantService.getLowStockItems(),
  });

  const criticalStockItems = useQuery({
    queryKey: ['merchant', 'inventory', 'critical-stock'],
    queryFn: () => merchantService.getCriticalStockItems(),
  });

  const addInventoryItem = useMutation({
    mutationFn: (item: Omit<MerchantInventory, 'id'>) =>
      merchantService.addInventoryItem(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant', 'inventory'] });
      queryClient.invalidateQueries({ queryKey: ['merchant', 'inventory', 'low-stock'] });
      queryClient.invalidateQueries({ queryKey: ['merchant', 'inventory', 'critical-stock'] });
    },
  });

  const updateInventoryItem = useMutation({
    mutationFn: ({ id, item }: { id: string; item: Partial<MerchantInventory> }) =>
      merchantService.updateInventoryItem(id, item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant', 'inventory'] });
      queryClient.invalidateQueries({ queryKey: ['merchant', 'inventory', 'low-stock'] });
      queryClient.invalidateQueries({ queryKey: ['merchant', 'inventory', 'critical-stock'] });
    },
  });

  const deleteInventoryItem = useMutation({
    mutationFn: (id: string) => merchantService.deleteInventoryItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant', 'inventory'] });
      queryClient.invalidateQueries({ queryKey: ['merchant', 'inventory', 'low-stock'] });
      queryClient.invalidateQueries({ queryKey: ['merchant', 'inventory', 'critical-stock'] });
    },
  });

  const updateStockLevels = useMutation({
    mutationFn: (items: Array<{ id: string; quantity: number }>) =>
      merchantService.updateStockLevels(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant', 'inventory'] });
      queryClient.invalidateQueries({ queryKey: ['merchant', 'inventory', 'low-stock'] });
      queryClient.invalidateQueries({ queryKey: ['merchant', 'inventory', 'critical-stock'] });
    },
  });

  const exportInventory = useMutation({
    mutationFn: () => merchantService.exportInventory(),
  });

  return {
    inventory,
    lowStockItems,
    criticalStockItems,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    updateStockLevels,
    exportInventory,
  };
};