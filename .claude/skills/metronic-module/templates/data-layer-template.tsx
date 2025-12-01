import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { toast } from 'sonner';

/**
 * Type Definitions
 */
interface I[Entity] {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

interface I[Entity]Filters {
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface ICreate[Entity]Input {
  name: string;
  email: string;
  status: 'active' | 'inactive';
  description?: string;
}

/**
 * Query: Get all [entities]
 *
 * Fetches a list of [entities] with optional filters
 */
export const use[Entity]Data = (filters?: I[Entity]Filters) => {
  return useQuery({
    queryKey: ['[entities]', filters],
    queryFn: async () => {
      const response = await apiService.get('/api/[entities]', {
        params: filters,
      });
      return response.data as I[Entity][];
    },
  });
};

/**
 * Query: Get single [entity] by ID
 *
 * Fetches a single [entity] by its ID
 */
export const use[Entity]ById = (id: string) => {
  return useQuery({
    queryKey: ['[entities]', id],
    queryFn: async () => {
      const response = await apiService.get(`/api/[entities]/${id}`);
      return response.data as I[Entity];
    },
    enabled: !!id,
  });
};

/**
 * Mutation: Create new [entity]
 *
 * Creates a new [entity] and invalidates the cache
 */
export const useCreate[Entity] = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ICreate[Entity]Input) => {
      const response = await apiService.post('/api/[entities]', data);
      return response.data as I[Entity];
    },
    onSuccess: (newEntity) => {
      // Invalidate and refetch [entities] list
      queryClient.invalidateQueries({ queryKey: ['[entities]'] });

      // Optionally add to cache
      queryClient.setQueryData(['[entities]', newEntity.id], newEntity);

      toast.success('[Entity] created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create [entity]');
    },
  });
};

/**
 * Mutation: Update existing [entity]
 *
 * Updates an existing [entity] and updates the cache
 */
export const useUpdate[Entity] = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<I[Entity]>;
    }) => {
      const response = await apiService.put(`/api/[entities]/${id}`, data);
      return response.data as I[Entity];
    },
    onSuccess: (updatedEntity) => {
      // Update specific [entity] in cache
      queryClient.setQueryData(['[entities]', updatedEntity.id], updatedEntity);

      // Invalidate list to refresh
      queryClient.invalidateQueries({ queryKey: ['[entities]'] });

      toast.success('[Entity] updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update [entity]');
    },
  });
};

/**
 * Mutation: Delete [entity]
 *
 * Deletes an [entity] and removes it from cache
 */
export const useDelete[Entity] = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiService.delete(`/api/[entities]/${id}`);
      return id;
    },
    onSuccess: (deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['[entities]', deletedId] });

      // Invalidate list
      queryClient.invalidateQueries({ queryKey: ['[entities]'] });

      toast.success('[Entity] deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete [entity]');
    },
  });
};

/**
 * Mutation: Bulk actions
 *
 * Example of bulk operation (delete multiple [entities])
 */
export const useBulkDelete[Entity] = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      await apiService.post('/api/[entities]/bulk-delete', { ids });
      return ids;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['[entities]'] });
      toast.success('[Entities] deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete [entities]');
    },
  });
};
