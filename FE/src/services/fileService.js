import axiosClient from './baseService';

export const fileService = {
  // Tuần 1: Hàm này chưa gọi axiosClient mà trả về Promise hardcode ngay
  getFiles: async () => {
    // Lấy userId từ localStorage, nếu chưa có thì tạm dùng 1
    const userId = localStorage.getItem('userId') || 1;
    // Gọi API thật của Backend
    return axiosClient.get(`/api/files?userId=${userId}`); 
  },

  getUploadUrl: async (fileName) => {
    return { data: { presignedUrl: `https://mock-s3-url.com/upload/${fileName}` } };
  },

    
    calculateFileHash: async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },
}