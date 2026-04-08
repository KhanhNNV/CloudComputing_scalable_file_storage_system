import api from './api';

export const folderService = {
    // Gọi API tạo thư mục mới
    createFolder: async (folderName, parentId = null) => {
        try {
            // Dữ liệu gửi lên Backend. 
            const requestPayload = {
                name: folderName,
                parentId: parentId
            };

            const response = await api.post('/api/folders', requestPayload);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi tạo thư mục:", error);
            throw error;
        }
    },

    // Hàm lấy nội dung thư mục (File + Folder con) - Dựa theo GetMapping của Backend
    getFolderContent: async (folderId = null) => {
        try {
            const url = folderId ? `/api/folders/${folderId}/content` : '/api/folders/content';
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy nội dung thư mục:", error);
            throw error;
        }
    }
};