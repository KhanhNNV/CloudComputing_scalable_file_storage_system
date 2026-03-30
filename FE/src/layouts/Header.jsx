import React from 'react';
import { Search, Bell, User } from 'lucide-react';

export default function Header() {
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
        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600"><Bell className="w-5 h-5" /></button>
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold cursor-pointer">
          <User className="w-5 h-5" />
        </div>
      </div>
    </header>
  );
}