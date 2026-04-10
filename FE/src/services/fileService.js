// src/services/fileService.js
import api from './api'; 

export const fileService = {
    // 1. Lấy danh sách file (Hoàn toàn không còn userId)
    getFiles: async (folderId = null) => {
        try {
            const params = {};
            if (folderId) {
                params.folderId = folderId;
            }

            const response = await api.get('/api/files', { params });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách file:", error);
            throw error;
        }
    },

    // 2. Hàm gọi API xin link Upload (Đã xóa userId trên đường dẫn)
    requestUpload: async (uploadRequestDto) => {
        try {
            const response = await api.post('/api/files/request-upload', uploadRequestDto);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi request upload:", error);
            throw error;
        }
    },

    // 3. Hàm gọi API xác nhận Upload hoàn tất (Đã xóa userId)
    confirmUpload: async (confirmRequestDto) => {
        try {
            const response = await api.post('/api/files/confirm-upload', confirmRequestDto);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi confirm upload:", error);
            throw error;
        }
    },

    // 4. Hàm mã hóa băm file (Giữ nguyên của bạn)
    calculateFileHash: async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },

    // 5. Hàm chuyển file vào thùng rác (Soft Delete)
    moveToTrash: async (fileId) => {
        try {
            // BE sử dụng phương thức DELETE theo FileController
            const response = await api.delete(`/api/files/${fileId}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi chuyển file vào thùng rác:", error);
            throw error;
        }
    },

    // 6. Lấy link tải xuống trực tiếp (Presigned URL để download)
    getDownloadUrl: async (fileId) => {
        try {
            // BE sử dụng đường dẫn /download-url
            const response = await api.get(`/api/files/${fileId}/download-url`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy link tải file:", error);
            throw error;
        }
    },

    restoreFile: async (fileId) => {
        try {
            const response = await api.post(`/api/files/${fileId}/restore`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi khôi phục file:", error);
            throw error;
        }
    },

    forceDeleteFile: async (id) => 
    {
    const response = await api.delete(`/api/files/${id}/force`);
    return response.data;
    }
};