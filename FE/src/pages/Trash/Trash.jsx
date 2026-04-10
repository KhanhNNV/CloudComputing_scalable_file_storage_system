import React, { useState, useEffect, useRef } from 'react';
import { folderService } from '../../services/folderService';
import { fileService } from '../../services/fileService'; 
import { File as FileIcon, Folder as FolderIcon, Loader2, RefreshCw, Trash2, MoreVertical } from 'lucide-react';

export default function Trash() {
  const [trashItems, setTrashItems] = useState({ files: [], folders: [] });
  const [isLoading, setIsLoading] = useState(true);
  
  // State quản lý menu nào đang mở (lưu ID của item)
  const [openMenuId, setOpenMenuId] = useState(null);
  
  // Reference để kiểm tra click ra ngoài
  const menuRef = useRef(null);

  const fetchTrash = async () => {
    try {
      setIsLoading(true);
      const data = await folderService.getUnifiedTrash();
      setTrashItems({
        files: data.files || [],
        folders: data.folders || []
      });
    } catch (error) {
      console.error("Lỗi tải thùng rác", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  // Xử lý click ra ngoài để đóng menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Nếu menuRef tồn tại VÀ click KHÔNG nằm trong menuRef
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null); // Đóng menu
      }
    };
    // Đăng ký sự kiện
    document.addEventListener("mousedown", handleClickOutside);
    // Hủy đăng ký sự kiện khi component bị unmount
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Hàm toggle menu cho một mục cụ thể
  const toggleMenu = (e, id) => {
    e.stopPropagation(); // Ngăn việc click vào menu làm kích hoạt hành động "Vào thư mục" (nếu có)
    setOpenMenuId(openMenuId === id ? null : id);
  };

  // ==========================================
  // XỬ LÝ KHÔI PHỤC (RESTORE)
  // ==========================================
  const handleRestoreFolder = async (folderId) => {
    try {
      await folderService.restoreFolder(folderId);
      setTrashItems(prev => ({
        ...prev,
        folders: prev.folders.filter(f => f.id !== folderId)
      }));
      setOpenMenuId(null); // Đóng menu sau khi thực hiện
    } catch (error) {
      console.error("Chi tiết lỗi khôi phục thư mục:", error);
      alert("Lỗi khi khôi phục thư mục.");
    }
  };

  const handleRestoreFile = async (fileId) => {
    try {
      await fileService.restoreFile(fileId);
      setTrashItems(prev => ({
        ...prev,
        files: prev.files.filter(f => f.id !== fileId)
      }));
      setOpenMenuId(null); // Đóng menu sau khi thực hiện
    } catch (error) {
      console.error("Chi tiết lỗi khôi phục file:", error);
      alert("Lỗi khi khôi phục file.");
    }
  };

// --- Xóa vĩnh viễn Folder ---
  const handleHardDeleteFolder = async (folderId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa VĨNH VIỄN thư mục này? Dữ liệu sẽ không thể khôi phục.")) {
      try {
        // GỌI HÀM FORCE DELETE MỚI
        await folderService.forceDeleteFolder(folderId); 
        
        setTrashItems(prev => ({
          ...prev,
          folders: prev.folders.filter(f => f.id !== folderId)
        }));
        alert("Đã xóa vĩnh viễn thư mục thành công.");
      } catch (error) {
        console.error("Lỗi xóa vĩnh viễn thư mục:", error);
        alert("Lỗi khi xóa vĩnh viễn thư mục.");
      } finally { 
        setOpenMenuId(null); 
      }
    }
  };

  // --- Xóa vĩnh viễn File ---
  const handleHardDeleteFile = async (fileId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa VĨNH VIỄN tệp này? Dữ liệu sẽ bị xóa khỏi hệ thống hoàn toàn.")) {
      try {
        // GỌI HÀM FORCE DELETE MỚI
        await fileService.forceDeleteFile(fileId);
        
        setTrashItems(prev => ({
          ...prev,
          files: prev.files.filter(f => f.id !== fileId)
        }));
        alert("Đã xóa vĩnh viễn tệp thành công.");
      } catch (error) {
        console.error("Lỗi xóa vĩnh viễn file:", error);
        alert("Lỗi khi xóa vĩnh viễn tệp.");
      } finally { 
        setOpenMenuId(null); 
      }
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-blue-500 w-8 h-8" /></div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Thùng rác</h1>
      
      {trashItems.folders.length === 0 && trashItems.files.length === 0 ? (
        <p className="text-gray-500 text-center mt-10">Thùng rác của bạn đang trống.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          
          {/* Hiển thị Folders đã xóa */}
          {trashItems.folders.map(folder => {
            const folderId = folder.id || folder.folderId;
            const menuId = `folder-${folderId}`; // ID menu độc nhất cho mỗi folder
            return (
              <div key={menuId} className="relative border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors flex items-center gap-3 shadow-sm bg-white group">
                <div className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full">
                  <FolderIcon className="w-6 h-6 text-gray-700" />
                </div>
                <div className="flex-1 truncate">
                  <span className="truncate text-sm font-medium text-gray-800" title={folder.name}>{folder.name}</span>
                </div>

                {/* Nút Menu ba chấm (MoreVertical) */}
                <button 
                  onClick={(e) => toggleMenu(e, menuId)}
                  className="p-1 rounded-full hover:bg-gray-200 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>

                {/* Menu Dropdown cho Folder */}
                {openMenuId === menuId && (
                  <div ref={menuRef} className="absolute right-0 top-12 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-100 py-1">
                    <button 
                      onClick={() => handleRestoreFolder(folderId)}
                      className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" /> Khôi phục
                    </button>
                    <button 
                      onClick={() => handleHardDeleteFolder(folderId)}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Xóa vĩnh viễn
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Hiển thị Files đã xóa */}
          {trashItems.files.map(file => {
            const fileId = file.id || file.fileId;
            const menuId = `file-${fileId}`; // ID menu độc nhất cho mỗi file
            return (
              <div key={menuId} className="relative border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors flex flex-col items-center gap-3 shadow-sm bg-white group">
                
                {/* Nút Menu ba chấm (MoreVertical) ở góc trên phải */}
                <div className="absolute top-2 right-2">
                  <button 
                    onClick={(e) => toggleMenu(e, menuId)}
                    className="p-1 rounded-full bg-white/80 hover:bg-gray-100 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {/* Menu Dropdown cho File */}
                  {openMenuId === menuId && (
                    <div ref={menuRef} className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-100 py-1">
                      <button 
                        onClick={() => handleRestoreFile(fileId)}
                        className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" /> Khôi phục
                      </button>
                      <button 
                        onClick={() => handleHardDeleteFile(fileId)}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" /> Xóa vĩnh viễn
                      </button>
                    </div>
                  )}
                </div>

                {/* Phần còn lại của thẻ File */}
                <div className="w-12 h-12 flex items-center justify-center">
                  <FileIcon className="w-8 h-8 text-gray-500" />
                </div>
                <div className="text-center w-full mt-2">
                  <p className="text-sm font-medium text-gray-700 truncate" title={file.name}>{file.name}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}