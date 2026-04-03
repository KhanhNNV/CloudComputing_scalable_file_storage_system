import api from './api';

const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        if (response.data && response.data.accessToken) {
            // Lưu token
            localStorage.setItem('accessToken', response.data.accessToken);
            
            // LƯU THÊM USER ID (Giả sử BE trả về trong response.data.id hoặc userId)
            // Bạn cần console.log(response.data) ra xem BE trả về tên biến là gì để map cho đúng nhé.
            // Dưới đây tôi ví dụ BE trả về response.data.id
            if (response.data.id) {
                 localStorage.setItem('userId', response.data.id);
            } else if (response.data.userId) {
                 localStorage.setItem('userId', response.data.userId);
            }
        }
        return response.data;
    },

    register: async (fullName, email, password) => {
        const response = await api.post('/auth/register', { fullName, email, password });
        return response.data;
    },

    logout: async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error("Lỗi khi đăng xuất ở server", error);
        } finally {
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
        }
    }
};

export default authService;