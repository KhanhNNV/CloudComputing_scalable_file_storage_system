// src/services/fileService.js
import api from './api'; 

export const fileService = {
    getFiles: async (folderId = null) => {
        try {
            const userId = localStorage.getItem('userId') || 1;
            
            const params = { userId };
            if (folderId) {
                params.folderId = folderId;
            }

            const response = await api.get('/api/files', { params });
            
            // Trả về dữ liệu trực tiếp (vì Backend dùng ResponseEntity<List<FileResponse>>)
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách file:", error);
            throw error;
        }
    },

    calculateFileHash: async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },
};