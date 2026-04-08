import React, { useState, useEffect } from 'react';
import UploadModal from '../../components/common/UploadModal';
import CreateFolderModal from "../../components/common/CreateFolderModal";
import { FileText, Image as ImageIcon, File as FileIcon, Plus, Loader2, FolderPlus, Folder } from 'lucide-react';
import { fileService } from '../../services/fileService';
import { folderService } from '../../services/folderService'; // Đảm bảo đã import folderService

export default function Drive() {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]); // State mới để chứa danh sách thư mục
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State mới cho tính năng Tạo thư mục
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState(null); // null nghĩa là đang ở thư mục gốc (Root)

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(i >= 2 ? 2 : 1)) + ' ' + sizes[i];
  };

  // CẬP NHẬT: Hàm fetchData lấy cả thư mục và file
  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Gọi API lấy thông tin file (đã có)
      const filesResponse = await fileService.getFiles(currentFolderId);
      setFiles(filesResponse?.data || filesResponse || []);

      // Gọi API lấy thông tin thư mục (Dựa vào API GET /api/folders của backend)
      // Nếu folderService có hàm getFolderContent, bạn có thể gọi hàm đó.
      // Ở đây tôi dùng cách lấy thư mục an toàn qua API content hoặc endpoint getFolders:
      const foldersResponse = await folderService.getFolderContent(currentFolderId);
      // Giả sử API trả về object có thuộc tính 'folders'
      setFolders(foldersResponse?.data?.folders || foldersResponse?.folders || []);
      
    } catch (error) {
      console.error("Không thể tải danh sách dữ liệu:", error);
      // Tránh việc văng lỗi trắng trang
      if (files.length === 0) setFiles([]);
      if (folders.length === 0) setFolders([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Mỗi khi currentFolderId thay đổi (người dùng bấm vào folder), sẽ tự động gọi lại fetchData
  useEffect(() => {
    fetchData();
  }, [currentFolderId]);

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
        
        {/* Nhóm các nút hành động */}
        <div className="flex gap-3">
          <button 
            onClick={() => setIsCreateFolderOpen(true)}
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <FolderPlus className="w-5 h-5 text-gray-500" />
            Thư mục mới
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Tải lên
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-500 font-medium">Đang tải dữ liệu...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.length === 0 && folders.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              Thư mục này đang trống. Hãy tạo thư mục hoặc tải file lên!
            </div>
          ) : (
            <>
              {/* --- VÙNG HIỂN THỊ THƯ MỤC --- */}
              {folders.map((folder) => (
                <div 
                  key={`folder-${folder.id || folder.folderId || Math.random()}`} 
                  onClick={() => setCurrentFolderId(folder.id || folder.folderId)} // Bấm vào để vào trong thư mục
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-100 cursor-pointer transition-colors flex items-center gap-3 shadow-sm bg-white"
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full">
                    <Folder className="w-6 h-6 text-gray-700" fill="currentColor" opacity={0.2} />
                  </div>
                  <div className="flex-1 truncate">
                    <p className="text-sm font-medium text-gray-800 truncate" title={folder.name}>{folder.name}</p>
                  </div>
                </div>
              ))}

              {/* --- VÙNG HIỂN THỊ FILE --- */}
              {files.map((file) => (
                <div key={`file-${file.id || file.fileId || Math.random()}`} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors flex flex-col items-center gap-3 shadow-sm bg-white">
                  <div className="w-12 h-12 flex items-center justify-center">
                    {isImage(file) && (file.thumbnailUrl || file.downloadUrl) ? (
                      <img 
                        src={file.thumbnailUrl || file.downloadUrl} 
                        alt={file.name} 
                        className="w-full h-full object-cover rounded-md shadow-sm border border-gray-100" 
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                    ) : null}
                    
                    <div style={{ display: isImage(file) && (file.thumbnailUrl || file.downloadUrl) ? 'none' : 'block' }}>
                      {getFileIcon(file)}
                    </div>
                  </div>

                  <div className="text-center w-full">
                    <p className="text-sm font-medium text-gray-700 truncate" title={file.name}>{file.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Modal Upload File */}
      <UploadModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          fetchData(); // Load lại data sau khi upload xong
        }} 
        currentFolderId={currentFolderId} // Truyền ID thư mục hiện tại vào Upload
      />

      {/* Modal Tạo Thư mục mới */}
      <CreateFolderModal 
        isOpen={isCreateFolderOpen} 
        onClose={() => setIsCreateFolderOpen(false)} 
        currentFolderId={currentFolderId}
        onSuccess={() => {
          fetchData(); // Tải lại danh sách sau khi tạo xong
        }} 
      />
    </div>
  );
}