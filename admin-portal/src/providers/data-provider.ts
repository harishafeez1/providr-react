import type { DataProvider } from '@refinedev/core';
import api from '@/services/api';

export const dataProvider: DataProvider = {
  getList: async ({ resource, pagination, filters, sorters }) => {
    const params: Record<string, any> = {};

    if (pagination) {
      params.page = pagination.current || 1;
      params.per_page = pagination.pageSize || 15;
    }

    if (sorters && sorters.length > 0) {
      params.sort = sorters[0].field;
      params.order = sorters[0].order;
    }

    if (filters) {
      for (const filter of filters) {
        if ('field' in filter && filter.value !== undefined && filter.value !== '') {
          params[filter.field] = filter.value;
        }
      }
    }

    const { data } = await api.get(`/admin/${resource}`, { params });

    return {
      data: data.data,
      total: data.total,
    };
  },

  getOne: async ({ resource, id }) => {
    const { data } = await api.get(`/admin/${resource}/${id}`);
    return { data };
  },

  create: async ({ resource, variables }) => {
    const { data } = await api.post(`/admin/${resource}`, variables);
    return { data };
  },

  update: async ({ resource, id, variables }) => {
    const { data } = await api.put(`/admin/${resource}/${id}`, variables);
    return { data };
  },

  deleteOne: async ({ resource, id }) => {
    const { data } = await api.delete(`/admin/${resource}/${id}`);
    return { data };
  },

  getApiUrl: () => import.meta.env.VITE_APP_API_URL + '/admin',

  custom: async ({ url, method, payload, query }) => {
    const { data } = await api({
      url,
      method: method || 'get',
      data: payload,
      params: query,
    });
    return { data };
  },
};
