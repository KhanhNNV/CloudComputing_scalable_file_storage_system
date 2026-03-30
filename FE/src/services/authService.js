import api from './api';

const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        if (response.data && response.data.accessToken) {
            localStorage.setItem('accessToken', response.data.accessToken);
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