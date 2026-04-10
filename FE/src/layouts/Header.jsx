import React, { useState, useEffect } from 'react';
import { Search, Bell, User, LogOut } from 'lucide-react';
import authService from '../services/authService'; // Service cũ của bạn
import { userService } from '../services/userService'; // Service mới tạo
import { jwtDecode } from "jwt-decode"; // Thư viện vừa cài

export default function Header() {
  // Trạng thái cũ
  const [showDropdown, setShowDropdown] = useState(false);
  // Trạng thái mới thêm để chứa thông tin user
  const [userInfo, setUserInfo] = useState(null);

  // Gọi API lấy thông tin người dùng ngay khi Header xuất hiện
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        
        if (token) {
          const decoded = jwtDecode(token);
          
          // Lấy email từ trường 'sub' thay vì 'id'
          const userEmail = decoded.sub; 
          
          if (userEmail) {
            // Bước 1: Hiển thị ngay email lên giao diện cho "nóng"
            setUserInfo({ email: userEmail });

            // Bước 2 (Tùy chọn): Thử gọi API để lấy thêm Tên đầy đủ (nếu Backend hỗ trợ tìm bằng email)
            try {
              const data = await userService.getUserProfile(userEmail);
              if (data) {
                setUserInfo(data); // Nếu lấy được Tên thật thì ghi đè lên
              }
            } catch (apiError) {
              console.error("Lỗi khi lấy thông tin người dùng:", apiError);
              console.log("Dùng email mặc định từ Token vì không lấy được Profile chi tiết.");
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
    <header className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white">
      {/* KHU VỰC TÌM KIẾM (Giữ nguyên) */}
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
      
      {/* KHU VỰC BÊN PHẢI */}
      <div className="flex items-center gap-4 ml-4">
        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
          <Bell className="w-5 h-5" />
        </button>
        
        {/* Khu vực Avatar & Dropdown */}
        <div className="relative">
          <div 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 cursor-pointer"
          >
            {/* Hiển thị Tên người dùng nếu lấy được từ API */}
            {userInfo && (
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-700 hover:text-blue-600">
                  {userInfo.fullName || userInfo.email}
                </p>
              </div>
            )}
            
            {/* Avatar (Giữ nguyên) */}
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold hover:bg-blue-600 transition-colors">
              <User className="w-5 h-5" />
            </div>
          </div>

          {/* Menu Dropdown (Giữ nguyên) */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50">
              <button 
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 transition-colors text-red-600"
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