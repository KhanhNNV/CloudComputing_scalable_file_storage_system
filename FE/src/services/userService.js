import api from './api';

export const userService = {
  getUserProfile: async () => {
    try {
      const response = await api.get('/api/users/me');
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin user:", error);
      throw error;
    }
  }
};