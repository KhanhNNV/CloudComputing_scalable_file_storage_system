import React from 'react';
import { HardDrive, Trash2, Cloud } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();

  const isMyDriveActive = location.pathname === '/' || location.pathname.startsWith('/drive');
  const isTrashActive = location.pathname === '/trash';

  return (
    <div className="w-64 bg-gray-50/50 border-r border-gray-200 h-screen flex flex-col">
      <div className="p-6 flex items-center gap-3 text-xl font-bold text-blue-600 border-b border-gray-200">
        <Cloud className="w-8 h-8 drop-shadow-sm" />
        <span className="tracking-tight">Drive Clone</span>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {/* Nút My Drive */}
        <Link 
          to="/" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
            isMyDriveActive 
              ? 'bg-blue-50 text-blue-700 shadow-sm' 
              : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm' 
          }`}
        >
          <HardDrive className={`w-5 h-5 ${isMyDriveActive ? 'text-blue-600' : 'text-gray-500'}`} />
          My Drive
        </Link>

        {/* Nút Trash */}
        <Link 
          to="/trash" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
            isTrashActive 
              ? 'bg-red-50 text-red-700 shadow-sm' 
              : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm' 
          }`}
        >
          <Trash2 className={`w-5 h-5 ${isTrashActive ? 'text-red-600' : 'text-gray-500'}`} />
          Trash
        </Link>
      </nav>
    </div>
  );
}