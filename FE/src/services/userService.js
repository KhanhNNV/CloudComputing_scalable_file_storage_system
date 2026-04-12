import api from './api';

export const userService = {
  getUserProfile: async (userId) => {
    try {
      const response = await api.get(`/api/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin user:", error);
      throw error;
    }
  }
};