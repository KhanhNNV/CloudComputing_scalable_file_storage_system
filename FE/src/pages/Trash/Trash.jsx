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

  // --- Dọn sạch Thùng rác ---
  const handleEmptyTrash = async () => {
    if (window.confirm("BẠN CÓ CHẮC CHẮN MUỐN DỌN SẠCH THÙNG RÁC? Hành động này sẽ xóa vĩnh viễn TOÀN BỘ dữ liệu và không thể khôi phục!")) {
      try {
        setIsLoading(true);
        await folderService.emptyTrash();
        setTrashItems({ files: [], folders: [] });
        alert("Đã dọn sạch thùng rác thành công.");
      } catch (error) {
        console.error("Lỗi khi dọn sạch thùng rác:", error);
        alert("Lỗi khi dọn sạch thùng rác. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-blue-500 w-8 h-8" /></div>;
  }

  return (
    <div className="p-8">
  <div className="flex items-center gap-3 mb-8">
    <Trash2 className="w-8 h-8 text-red-500" />
    <h1 className="text-2xl font-bold text-gray-800">Thùng rác</h1>
    {(trashItems.folders.length > 0 || trashItems.files.length > 0) && (
      <button 
        onClick={handleEmptyTrash}
        className="ml-auto flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm font-semibold border border-red-100"
      >
        <Trash2 className="w-4 h-4" />
        Dọn sạch thùng rác
      </button>
    )}
  </div>
  
  {trashItems.folders.length === 0 && trashItems.files.length === 0 ? (
    <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200 mt-4">
      <Trash2 className="w-16 h-16 text-gray-300 mb-4" />
      <p className="text-gray-500 font-medium">Thùng rác của bạn đang trống</p>
    </div>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
      
      {/* Hiển thị Folders đã xóa */}
      {trashItems.folders.map(folder => {
        const folderId = folder.id || folder.folderId;
        const menuId = `folder-${folderId}`; 
        return (
          <div key={menuId} className="relative border border-gray-100 rounded-2xl p-4 hover:border-red-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 bg-white group">
            <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-xl group-hover:bg-red-50 transition-colors">
              <FolderIcon className="w-6 h-6 text-gray-400 group-hover:text-red-400 transition-colors" />
            </div>
            <div className="flex-1 truncate">
              <span className="truncate text-sm font-semibold text-gray-700 group-hover:text-red-600 transition-colors" title={folder.name}>{folder.name}</span>
            </div>

            <button 
              onClick={(e) => toggleMenu(e, menuId)}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {openMenuId === menuId && (
              <div ref={menuRef} className="absolute right-4 top-14 mt-1 w-48 bg-white rounded-xl shadow-xl z-20 border border-gray-100 py-1.5">
                <button 
                  onClick={() => handleRestoreFolder(folderId)}
                  className="w-full text-left px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-3 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" /> Khôi phục
                </button>
                <div className="h-px bg-gray-100 my-1"></div>
                <button 
                  onClick={() => handleHardDeleteFolder(folderId)}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors font-medium"
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
        const menuId = `file-${fileId}`; 
        return (
          <div key={menuId} className="relative border border-gray-100 rounded-2xl p-4 hover:border-red-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col items-center gap-3 bg-white group">
            
            <div className="absolute top-2 right-2">
              <button 
                onClick={(e) => toggleMenu(e, menuId)}
                className="p-1.5 rounded-full bg-white/90 hover:bg-gray-100 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {openMenuId === menuId && (
                <div ref={menuRef} className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl z-30 border border-gray-100 py-1.5">
                  <button 
                    onClick={() => handleRestoreFile(fileId)}
                    className="w-full text-left px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-3 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" /> Khôi phục
                  </button>
                  <div className="h-px bg-gray-100 my-1"></div>
                  <button 
                    onClick={() => handleHardDeleteFile(fileId)}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors font-medium"
                  >
                    <Trash2 className="w-4 h-4" /> Xóa vĩnh viễn
                  </button>
                </div>
              )}
            </div>

            <div className="w-16 h-16 flex items-center justify-center mt-2 transform group-hover:scale-110 transition-transform duration-300">
              <FileIcon className="w-10 h-10 text-gray-400 group-hover:text-red-400 transition-colors" />
            </div>
            
            <div className="text-center w-full mt-2 bg-gray-50/50 p-2 rounded-lg">
              <p className="text-sm font-medium text-gray-600 truncate group-hover:text-red-600 transition-colors" title={file.name}>{file.name}</p>
            </div>
          </div>
        );
      })}
    </div>
  )}
</div>
  );
}