import React, { useState, useEffect } from 'react';
import { folderService } from '../../services/folderService';
import { fileService } from '../../services/fileService'; // Nhớ import thêm fileService
import { File as FileIcon, Folder as FolderIcon, Loader2, RefreshCw } from 'lucide-react'; // Thêm icon RefreshCw

export default function Trash() {
  const [trashItems, setTrashItems] = useState({ files: [], folders: [] });
  const [isLoading, setIsLoading] = useState(true);

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

  // Xử lý khôi phục thư mục
  const handleRestoreFolder = async (folderId) => {
    try {
      await folderService.restoreFolder(folderId);
      // Cập nhật lại UI: Xóa folder vừa khôi phục khỏi danh sách hiển thị
      setTrashItems(prev => ({
        ...prev,
        folders: prev.folders.filter(f => f.id !== folderId)
      }));
    } catch (error) {
      console.error("Chi tiết lỗi khôi phục thư mục:", error);
      alert("Lỗi khi khôi phục thư mục.");
    }
  };

  // Xử lý khôi phục file
  const handleRestoreFile = async (fileId) => {
    try {
      await fileService.restoreFile(fileId);
      // Cập nhật lại UI: Xóa file vừa khôi phục khỏi danh sách hiển thị
      setTrashItems(prev => ({
        ...prev,
        files: prev.files.filter(f => f.id !== fileId)
      }));
    } catch (error) {
      console.error("Chi tiết lỗi khôi phục file:", error);
      alert("Lỗi khi khôi phục file.");
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
          {trashItems.folders.map(folder => (
            <div key={folder.id} className="p-4 border rounded-lg flex items-center justify-between bg-gray-50 opacity-75 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-3 overflow-hidden">
                <FolderIcon className="w-6 h-6 text-gray-400 flex-shrink-0" />
                <span className="truncate">{folder.name}</span>
              </div>
              <button 
                onClick={() => handleRestoreFolder(folder.id)}
                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md"
                title="Khôi phục"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Hiển thị Files đã xóa */}
          {trashItems.files.map(file => (
            <div key={file.id} className="p-4 border rounded-lg flex items-center justify-between bg-gray-50 opacity-75 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-3 overflow-hidden">
                <FileIcon className="w-6 h-6 text-gray-400 flex-shrink-0" />
                <span className="truncate">{file.name}</span>
              </div>
              <button 
                onClick={() => handleRestoreFile(file.id)}
                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md"
                title="Khôi phục"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}