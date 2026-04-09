import React, { useState, useEffect, useRef } from 'react';
import UploadModal from '../../components/common/UploadModal';
import CreateFolderModal from '../../components/common/CreateFolderModal';
import { FileText, Image as ImageIcon, File as FileIcon, Plus, Loader2, FolderPlus, Folder, ChevronRight, MoreVertical, Trash2, Download } from 'lucide-react';
import { fileService } from '../../services/fileService';
import { folderService } from '../../services/folderService';

export default function Drive() {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [folderPath, setFolderPath] = useState([{ id: null, name: 'My Drive' }]);
  
  // CẬP NHẬT: State để quản lý Menu nào đang mở
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  const currentFolderId = folderPath[folderPath.length - 1].id;

  // Xử lý click ra ngoài để đóng menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEnterFolder = (folder) => {
    const folderId = folder.id || folder.folderId;
    setFolderPath([...folderPath, { id: folderId, name: folder.name }]);
  };

  const handleBreadcrumbClick = (index) => {
    const newPath = folderPath.slice(0, index + 1);
    setFolderPath(newPath);
  };

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
      // Lọc bỏ những file đã bị đưa vào thùng rác (nếu Backend vẫn trả về)
      const activeFiles = (filesResponse?.data || filesResponse || []).filter(f => !f.isDeleted);
      setFiles(activeFiles);

      const foldersResponse = await folderService.getFolderContent(currentFolderId);
      // Lọc bỏ những thư mục đã bị đưa vào thùng rác
      const activeFolders = (foldersResponse?.data?.folders || foldersResponse?.folders || []).filter(f => !f.isDeleted);
      setFolders(activeFolders);
      
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

  // ==========================================
  // CẬP NHẬT: LOGIC XỬ LÝ MENU (XÓA & TẢI XUỐNG)
  // ==========================================
  const toggleMenu = (e, id) => {
    e.stopPropagation(); // Ngăn việc click vào menu làm kích hoạt hành động "Vào thư mục"
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleDeleteFolder = async (e, folderId) => {
    e.stopPropagation();
    if (window.confirm("Bạn có chắc chắn muốn chuyển thư mục này vào thùng rác?")) {
      try {
        await folderService.moveToTrash(folderId);
        fetchData(); // Tải lại dữ liệu sau khi xóa
      } catch (error) {
        console.error("Chi tiết lỗi xóa thư mục:", error);
        alert("Lỗi khi xóa thư mục. Vui lòng kiểm tra lại cấu hình API.");
      }
    }
    setOpenMenuId(null);
  };

  const handleDeleteFile = async (e, fileId) => {
    e.stopPropagation();
    if (window.confirm("Bạn có chắc chắn muốn chuyển file này vào thùng rác?")) {
      try {
        await fileService.moveToTrash(fileId);
        fetchData(); 
      } catch (error) {
        console.error("Chi tiết lỗi xóa file:", error);
        alert("Lỗi khi xóa file. Vui lòng kiểm tra lại cấu hình API.");
      }
    }
    setOpenMenuId(null);
  };

  const handleDownloadFile = async (e, file) => {
    e.stopPropagation();
    try {
      const fileId = file.id || file.fileId;
      // Lấy phản hồi từ Backend
      const response = await fileService.getDownloadUrl(fileId);
      
      // Tùy cách Axios parse, URL có thể nằm trực tiếp ở response hoặc response.data
      const downloadUrl = response?.url || response?.data?.url || (typeof response === 'string' ? response : null) || file.downloadUrl;
      
      if (downloadUrl && typeof downloadUrl === 'string') {
         const link = document.createElement('a');
         link.href = downloadUrl;
         link.download = file.name;
         link.target = "_blank"; // Mở tab mới để tải cho an toàn
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
      } else {
         alert("Không tìm thấy đường dẫn tải xuống hợp lệ!");
      }
    } catch (error) {
      console.error("Chi tiết lỗi tải file:", error);
      alert("Lỗi khi tải file. Vui lòng kiểm tra lại mạng hoặc API.");
    }
    setOpenMenuId(null);
  };
  // ==========================================

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
    <div onClick={() => setOpenMenuId(null)}>
      <div className="flex justify-between items-center mb-6">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" ref={menuRef}>
          {files.length === 0 && folders.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              Thư mục này đang trống. Hãy tạo thư mục hoặc tải file lên!
            </div>
          ) : (
            <>
              {folders.map((folder) => {
                const folderId = folder.id || folder.folderId;
                return (
                  <div 
                    key={`folder-${folderId || Math.random()}`} 
                    onClick={() => handleEnterFolder(folder)} 
                    className="relative border border-gray-200 rounded-lg p-4 hover:bg-gray-100 cursor-pointer transition-colors flex items-center gap-3 shadow-sm bg-white group"
                  >
                    <div className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full">
                      <Folder className="w-6 h-6 text-gray-700" fill="currentColor" opacity={0.2} />
                    </div>
                    <div className="flex-1 truncate">
                      <p className="text-sm font-medium text-gray-800 truncate" title={folder.name}>{folder.name}</p>
                    </div>

                    {/* Nút Menu cho Folder */}
                    <button 
                      onClick={(e) => toggleMenu(e, `folder-${folderId}`)}
                      className="p-1 rounded-full hover:bg-gray-200 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {/* Dropdown Menu */}
                    {openMenuId === `folder-${folderId}` && (
                      <div className="absolute right-0 top-12 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-100 py-1">
                        <button 
                          onClick={(e) => handleDeleteFolder(e, folderId)}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" /> Chuyển vào thùng rác
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {files.map((file) => {
                const fileId = file.id || file.fileId;
                return (
                  <div 
                    key={`file-${fileId || Math.random()}`} 
                    className="relative border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors flex flex-col items-center gap-3 shadow-sm bg-white group"
                  >
                    {/* Nút Menu cho File (Góc trên phải) */}
                    <div className="absolute top-2 right-2 z-10">
                      <button 
                        onClick={(e) => toggleMenu(e, `file-${fileId}`)}
                        className="p-1 rounded-full bg-white/80 hover:bg-gray-100 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {/* Dropdown Menu */}
                      {openMenuId === `file-${fileId}` && (
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-100 py-1">
                          <button 
                            onClick={(e) => handleDownloadFile(e, file)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" /> Tải xuống
                          </button>
                          <button 
                            onClick={(e) => handleDeleteFile(e, fileId)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" /> Chuyển vào thùng rác
                          </button>
                        </div>
                      )}
                    </div>

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

                    <div className="text-center w-full mt-2">
                      <p className="text-sm font-medium text-gray-700 truncate" title={file.name}>{file.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                );
              })}
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