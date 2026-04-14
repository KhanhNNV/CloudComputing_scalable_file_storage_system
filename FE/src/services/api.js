import axios from 'axios';

const api = axios.create({
    baseURL: 'http://18.138.240.4:8080/',
    withCredentials: true, // trình duyệt tự động gửi và nhận Cookie chứa Refresh Token
});

// Tự động đính kèm Access Token vào Header trước khi gửi đi
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Xử lý tự động Refresh Token nếu gặp lỗi 401 (Hết hạn Access Token)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Nếu mã lỗi là 401 (Unauthorized) và request này chưa từng được thử lại
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Đánh dấu là đã thử lại để tránh vòng lặp vô hạn

            try {
                // Gọi API cấp lại Access Token mới
                const res = await axios.post('http://localhost:8080/auth/refresh', {}, {
                    withCredentials: true // Phải gửi kèm Cookie
                });

                // Lấy Access Token mới lưu vào localStorage
                const newAccessToken = res.data.accessToken;
                localStorage.setItem('accessToken', newAccessToken);

                // Thay thế token cũ trong Header bằng token mới và gửi lại request đang bị lỗi
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return api(originalRequest); 

            } catch (err) {
                // Nếu gọi /refresh cũng thất bại xóa token và chuyển màn hình đăng nhập
                console.log('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                localStorage.removeItem('accessToken');
                window.location.href = '/login'; 
                return Promise.reject(err);
            }
        }
        return Promise.reject(error);
    }
);

export default api;