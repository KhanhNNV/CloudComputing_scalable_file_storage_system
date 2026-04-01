//import axiosClient from './baseService';

export const fileService = {
  // Tuần 1: Hàm này chưa gọi axiosClient mà trả về Promise hardcode ngay
  getFiles: async () => {
    // Tạm thời comment code gọi API thật:
    // return axiosClient.get('/files'); 
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: [
            { id: 1, name: 'BaoCaoTuan1.pdf', type: 'pdf', size: 1024000, updatedAt: '2026-03-28' },
            { id: 2, name: 'ThietKeDB.png', type: 'image', size: 2500000, updatedAt: '2026-03-27' },
            { id: 3, name: 'TaiLieuHuongDan.docx', type: 'word', size: 500000, updatedAt: '2026-03-26' },
          ]
        });
      }, 500); // Giả lập độ trễ mạng 0.5s
    });
  },

  getUploadUrl: async (fileName) => {
    // Mock trả về một URL giả để test UI
    return { data: { presignedUrl: `https://mock-s3-url.com/upload/${fileName}` } };
  },

    // --- KỸ NĂNG MỚI: Băm file tại trình duyệt (Ý nhóm trưởng) ---
    calculateFileHash: async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        // Trả về chuỗi 64 ký tự để kẹp vào API gửi lên BE
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },

}