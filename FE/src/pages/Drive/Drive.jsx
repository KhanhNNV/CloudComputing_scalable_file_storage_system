import React, { useState, useEffect } from 'react';
import UploadModal from '../../components/common/UploadModal';
import CreateFolderModal from "../../components/common/CreateFolderModal";
import { FileText, Image as ImageIcon, File as FileIcon, Plus, Loader2, FolderPlus, Folder, ChevronRight } from 'lucide-react';
import { fileService } from '../../services/fileService';
import { folderService } from '../../services/folderService';

export default function Drive() {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);

  // ==========================================
  // CẬP NHẬT 2: LOGIC THANH ĐIỀU HƯỚNG (BREADCRUMB)
  // ==========================================
  // Thay vì chỉ lưu currentFolderId, ta lưu cả đoạn đường đi (path)
  const [folderPath, setFolderPath] = useState([{ id: null, name: 'My Drive' }]);
  
  // currentFolderId bây giờ sẽ tự động lấy ID của thư mục cuối cùng trong đoạn đường đi
  const currentFolderId = folderPath[folderPath.length - 1].id;

  // Khi bấm vào một thư mục để đi vào trong
  const handleEnterFolder = (folder) => {
    const folderId = folder.id || folder.folderId;
    setFolderPath([...folderPath, { id: folderId, name: folder.name }]);
  };

  // Khi bấm vào một chữ trên thanh điều hướng để quay lại
  const handleBreadcrumbClick = (index) => {
    // Cắt mảng từ đầu đến vị trí được click
    const newPath = folderPath.slice(0, index + 1);
    setFolderPath(newPath);
  };
  // ==========================================

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(i >= 2 ? 2 : 1)) + ' ' + sizes[i];
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const filesResponse = await fileService.getFiles(currentFolderId);
      setFiles(filesResponse?.data || filesResponse || []);

      const foldersResponse = await folderService.getFolderContent(currentFolderId);
      setFolders(foldersResponse?.data?.folders || foldersResponse?.folders || []);
      
    } catch (error) {
      console.error("Không thể tải danh sách dữ liệu:", error);
      if (files.length === 0) setFiles([]);
      if (folders.length === 0) setFolders([]);
    } finally {
      setIsLoading(false);
    }
  };

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
        
        {/* CẬP NHẬT 3: GIAO DIỆN THANH ĐIỀU HƯỚNG */}
        <div className="flex items-center flex-wrap gap-1 text-2xl font-bold">
          {folderPath.map((folder, index) => (
            <React.Fragment key={folder.id || `breadcrumb-${index}`}>
              <button
                onClick={() => handleBreadcrumbClick(index)}
                className={`hover:text-blue-600 transition-colors focus:outline-none ${
                  index === folderPath.length - 1 ? 'text-gray-800' : 'text-gray-500'
                }`}
              >
                {folder.name}
              </button>
              
              {/* Hiển thị mũi tên nếu chưa phải là thư mục cuối cùng */}
              {index < folderPath.length - 1 && (
                <ChevronRight className="w-6 h-6 text-gray-400 mt-1" />
              )}
            </React.Fragment>
          ))}
        </div>

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
              {folders.map((folder) => (
                <div 
                  key={`folder-${folder.id || folder.folderId || Math.random()}`} 
                  // CẬP NHẬT 4: Gọi hàm handleEnterFolder khi click vào thư mục
                  onClick={() => handleEnterFolder(folder)} 
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

      <UploadModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          fetchData();
        }} 
        currentFolderId={currentFolderId}
      />

      <CreateFolderModal 
        isOpen={isCreateFolderOpen} 
        onClose={() => setIsCreateFolderOpen(false)} 
        currentFolderId={currentFolderId}
        onSuccess={() => {
          fetchData();
        }} 
      />
    </div>
  );
}