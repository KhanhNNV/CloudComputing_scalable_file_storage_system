import React from 'react';
import { HardDrive, Trash2, Cloud } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();

  // Kiểm tra đường dẫn để xác định menu nào đang được chọn
  const isMyDriveActive = location.pathname === '/' || location.pathname.startsWith('/drive');
  const isTrashActive = location.pathname === '/trash';

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 h-screen flex flex-col">
      <div className="p-4 flex items-center gap-2 text-xl font-bold text-blue-600 border-b border-gray-200">
        <Cloud className="w-8 h-8" />
        <span>Drive Clone</span>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {/* Nút My Drive */}
        <Link 
          to="/" 
          className={`flex items-center gap-3 p-3 rounded-lg font-medium transition-colors ${
            isMyDriveActive 
              ? 'bg-blue-100 text-blue-700' // Bôi xanh nếu đang ở My Drive
              : 'hover:bg-gray-100 text-gray-700' // Trắng xám nếu không chọn
          }`}
        >
          <HardDrive className="w-5 h-5" />
          My Drive
        </Link>

        {/* Nút Trash */}
        <Link 
          to="/trash" 
          className={`flex items-center gap-3 p-3 rounded-lg font-medium transition-colors ${
            isTrashActive 
              ? 'bg-blue-100 text-blue-700' // Bôi xanh nếu đang ở Trash
              : 'hover:bg-gray-100 text-gray-700' // Trắng xám nếu không chọn
          }`}
        >
          <Trash2 className="w-5 h-5" />
          Trash
        </Link>
      </nav>
    </div>
  );
}