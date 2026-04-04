import React, { useState, useEffect } from 'react';
import UploadModal from '../../components/common/UploadModal';
import { FileText, Image as ImageIcon, File as FileIcon, Plus, Loader2 } from 'lucide-react';
import { fileService } from '../../services/fileService';

export default function Drive() {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Gọi API để lấy danh sách file
  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const responseData = await fileService.getFiles(null);
      
      // Bóc tách dữ liệu từ API. Nếu Backend trả về bọc trong key 'data' thì lấy 'data'
      const fileList = responseData?.data || responseData || [];
      setFiles(fileList);
    } catch (error) {
      console.error("Không thể tải danh sách file:", error);
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Tự động gọi fetchFiles ngay khi vào màn hình Drive
  useEffect(() => {
    fetchFiles();
  }, []);

  // Hàm chọn icon dựa vào mimeType hoặc đuôi tên file từ Backend
  const getFileIcon = (file) => {
    const mimeType = (file.mimeType || file.type || '').toLowerCase();
    const name = (file.name || '').toLowerCase();

    if (mimeType.includes('pdf') || name.endsWith('.pdf')) {
      return <FileText className="w-8 h-8 text-red-500" />;
    }
    if (mimeType.includes('word') || mimeType.includes('document') || name.endsWith('.doc') || name.endsWith('.docx')) {
      return <FileText className="w-8 h-8 text-blue-500" />;
    }
    if (mimeType.includes('image')) {
      return <ImageIcon className="w-8 h-8 text-green-500" />;
    }
    return <FileIcon className="w-8 h-8 text-gray-500" />;
  };

  // Hàm kiểm tra xem có phải ảnh không
  const isImage = (file) => {
    const mimeType = (file.mimeType || file.type || '').toLowerCase();
    return mimeType.includes('image');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Drive</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Upload
        </button>
      </div>

      {/* Vùng hiển thị danh sách hoặc trạng thái đang tải */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-500 font-medium">Đang tải dữ liệu...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              Chưa có file nào. Hãy upload file đầu tiên của bạn!
            </div>
          ) : (
            files.map((file) => (
              // Dùng file.id, nếu Backend trả về fileId thì đổi cho phù hợp, fallback dùng random để không văng lỗi React key
              <div key={file.id || file.fileId || Math.random()} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors flex flex-col items-center gap-3 shadow-sm">
                
                {/* Logic hiển thị Thumbnail hoặc Icon */}
                {isImage(file) && file.thumbnailUrl ? (
                  <img 
                    src={file.thumbnailUrl} 
                    alt={file.name} 
                    className="w-12 h-12 object-cover rounded-md shadow-sm" 
                  />
                ) : (
                  getFileIcon(file)
                )}

                <div className="text-center w-full">
                  <p className="text-sm font-medium text-gray-700 truncate" title={file.name}>{file.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {/* Bắt lỗi an toàn nếu size undefined */}
                    {file.size ? (file.size / 1024 / 1024).toFixed(2) : 0} MB
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Khi tắt Modal Upload, gọi lại fetchFiles để refresh danh sách file mới */}
      <UploadModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          fetchFiles(); 
        }} 
      />
    </div>
  );
}