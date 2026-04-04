// src/services/fileService.js
import api from './api'; 

export const fileService = {
  getFiles: async () => {
    const userId = localStorage.getItem('userId') || 1;
    // Sửa từ `/api/files` thành `/files/list` (hoặc endpoint chuẩn của nhóm)
    return api.get(`/files/list?userId=${userId}`); 
  },

  calculateFileHash: async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },
};