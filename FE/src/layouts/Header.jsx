import React, { useState, useEffect } from 'react';
import { Search, Bell, User, LogOut } from 'lucide-react';
import authService from '../services/authService'; 
import { userService } from '../services/userService'; 
import { jwtDecode } from "jwt-decode"; 

export default function Header() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          const decoded = jwtDecode(token);
          const userEmail = decoded.sub; 
          
          if (userEmail) {
            setUserInfo({ email: userEmail });
            try {
              const data = await userService.getUserProfile(userEmail);
              if (data) setUserInfo(data);
            } catch (apiError) {
              console.error("Lỗi khi lấy thông tin người dùng:", apiError);
            }
          }
        }
      } catch (error) {
        console.error("Lỗi xử lý thông tin người dùng:", error);
      }
    };
    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    await authService.logout();
  };

  return (
    <header className="h-20 border-b border-gray-200 flex items-center justify-between px-8 bg-white">
      {/* KHU VỰC TÌM KIẾM */}
      <div className="flex-1 max-w-2xl">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Tìm kiếm trong Drive..." 
            className="w-full pl-12 pr-4 py-3 bg-gray-100/80 border border-transparent rounded-full focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 text-sm text-gray-700 placeholder-gray-500 shadow-sm hover:bg-gray-100"
          />
        </div>
      </div>
      
      {/* KHU VỰC BÊN PHẢI */}
      <div className="flex items-center gap-6 ml-4">
        <button className="p-2.5 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        
        <div className="relative">
          <div 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 cursor-pointer p-1.5 pr-3 rounded-full hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
          >
            {userInfo && (
              <div className="text-right hidden md:block ml-2">
                <p className="text-sm font-semibold text-gray-700">
                  {userInfo.fullName || userInfo.email}
                </p>
              </div>
            )}
            <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-full flex items-center justify-center text-white shadow-md">
              <User className="w-5 h-5" />
            </div>
          </div>

          {showDropdown && (
            <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50 transform origin-top-right transition-all">
              <div className="px-4 py-3 border-b border-gray-100 mb-1">
                <p className="text-sm text-gray-500">Đang đăng nhập với</p>
                <p className="text-sm font-medium text-gray-900 truncate">{userInfo?.email}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}