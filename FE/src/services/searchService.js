import api from './api';

export const searchService = {
  search: async (query) => {
    try {
      const response = await api.get(`/api/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
      throw error;
    }
  }
};
