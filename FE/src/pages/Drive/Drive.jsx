import React, { useState } from 'react';
import UploadModal from '../../components/common/UploadModal';
import { FileText, Image as ImageIcon, File as FileIcon, Plus } from 'lucide-react';
// Import trực tiếp dữ liệu giả từ file JSON
import dummyFiles from '../../dummyData.json'; 

export default function Drive() {
  // Gán thẳng dữ liệu JSON vào state, bỏ qua bất đồng bộ (API/Promise)
  const [files] = useState(dummyFiles);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Hàm chọn icon dựa vào type file
  const getFileIcon = (type) => {
    switch(type) {
      case 'pdf': return <FileText className="w-8 h-8 text-red-500" />;
      case 'word': return <FileText className="w-8 h-8 text-blue-500" />;
      // Đổi Image thành ImageIcon
      case 'image': return <ImageIcon className="w-8 h-8 text-green-500" />;
      // Đổi File thành FileIcon
      default: return <FileIcon className="w-8 h-8 text-gray-500" />;
    }
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

      {/* Hiển thị danh sách file dưới dạng Grid, thêm kiểm tra an toàn (files || []) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {(files || []).map((file) => (
          <div key={file.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors flex flex-col items-center gap-3 shadow-sm">
            {getFileIcon(file.type)}
            <div className="text-center w-full">
              <p className="text-sm font-medium text-gray-700 truncate" title={file.name}>{file.name}</p>
              <p className="text-xs text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
        ))}
      </div>

      <UploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}