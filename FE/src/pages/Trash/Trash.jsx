import React, { useState, useEffect } from 'react';
import { folderService } from '../../services/folderService';
import { File as FileIcon, Folder as FolderIcon, Loader2 } from 'lucide-react';

export default function Trash() {
  const [trashItems, setTrashItems] = useState({ files: [], folders: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrash = async () => {
      try {
        setIsLoading(true);
        const data = await folderService.getUnifiedTrash();
        // Dựa theo FolderContentResponse của BE, thường có 2 mảng files và folders
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

    fetchTrash();
  }, []);

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
            <div key={folder.id} className="p-4 border rounded-lg flex items-center gap-3 bg-gray-50 opacity-75">
              <FolderIcon className="w-6 h-6 text-gray-400" />
              <span className="truncate">{folder.name}</span>
            </div>
          ))}

          {/* Hiển thị Files đã xóa */}
          {trashItems.files.map(file => (
            <div key={file.id} className="p-4 border rounded-lg flex items-center gap-3 bg-gray-50 opacity-75">
              <FileIcon className="w-6 h-6 text-gray-400" />
              <span className="truncate">{file.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}