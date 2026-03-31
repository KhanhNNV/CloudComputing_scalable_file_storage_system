import React, { useState } from 'react';
import { Search, Bell, User, LogOut } from 'lucide-react';
import authService from '../services/authService'; // Nhúng service của nhóm trưởng vào

export default function Header() {
  // Trạng thái để ẩn/hiện menu dropdown khi click vào avatar
  const [showDropdown, setShowDropdown] = useState(false);

  // Hàm xử lý khi bấm nút Đăng xuất
  const handleLogout = async () => {
    // Gọi hàm logout từ authService (hàm này đã có sẵn logic xóa token và chuyển trang)
    await authService.logout();
  };

  return (
    <header className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white">
      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search in Drive..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-full focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4 ml-4">
        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
          <Bell className="w-5 h-5" />
        </button>
        
        {/* Khu vực Avatar & Dropdown */}
        <div className="relative">
          <div 
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold cursor-pointer hover:bg-blue-600 transition-colors"
          >
            <User className="w-5 h-5" />
          </div>

          {/* Menu Dropdown hiển thị khi showDropdown = true */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50">
              <button 
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}