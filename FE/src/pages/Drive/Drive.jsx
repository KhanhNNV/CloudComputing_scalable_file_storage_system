import React, { useState, useEffect } from 'react';
import UploadModal from '../../components/common/UploadModal';
import { FileText, Image as ImageIcon, File as FileIcon, Plus, Loader2 } from 'lucide-react';
import { fileService } from '../../services/fileService';

export default function Drive() {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- HÀM MỚI: Định dạng dung lượng file linh hoạt ---
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    // Nếu là MB (i=2) thì lấy 2 chữ số thập phân, còn lại lấy 1
    return parseFloat((bytes / Math.pow(k, i)).toFixed(i >= 2 ? 2 : 1)) + ' ' + sizes[i];
  };

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const responseData = await fileService.getFiles(null);
      const fileList = responseData?.data || responseData || [];
      setFiles(fileList);
    } catch (error) {
      console.error("Không thể tải danh sách file:", error);
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

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

  const isImage = (file) => {
    const mimeType = (file.mimeType || file.type || '').toLowerCase();
    const name = (file.name || '').toLowerCase();
    return mimeType.includes('image') || /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
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
              <div key={file.id || file.fileId || Math.random()} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors flex flex-col items-center gap-3 shadow-sm">
                
                {/* --- CẬP NHẬT: Hiển thị Thumbnail thật --- */}
                <div className="w-12 h-12 flex items-center justify-center">
                  {isImage(file) && (file.thumbnailUrl || file.downloadUrl) ? (
                    <img 
                      src={file.thumbnailUrl || file.downloadUrl} 
                      alt={file.name} 
                      className="w-full h-full object-cover rounded-md shadow-sm border border-gray-100" 
                      onError={(e) => {
                        // Nếu link ảnh lỗi, quay lại hiện icon mặc định
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : null}
                  
                  {/* Hiện icon nếu không phải ảnh hoặc ảnh bị lỗi link */}
                  <div style={{ display: isImage(file) && (file.thumbnailUrl || file.downloadUrl) ? 'none' : 'block' }}>
                    {getFileIcon(file)}
                  </div>
                </div>

                <div className="text-center w-full">
                  <p className="text-sm font-medium text-gray-700 truncate" title={file.name}>{file.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {/* --- CẬP NHẬT: Dùng hàm format mới --- */}
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

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