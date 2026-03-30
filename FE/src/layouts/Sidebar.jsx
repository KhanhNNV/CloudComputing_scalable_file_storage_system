import React from 'react';
import { HardDrive, Trash2, Cloud } from 'lucide-react';

export default function Sidebar() {
  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 h-screen flex flex-col">
      <div className="p-4 flex items-center gap-2 text-xl font-bold text-blue-600 border-b border-gray-200">
        <Cloud className="w-8 h-8" />
        <span>Drive Clone</span>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <a href="/" className="flex items-center gap-3 p-3 bg-blue-100 text-blue-700 rounded-lg font-medium">
          <HardDrive className="w-5 h-5" />
          My Drive
        </a>
        <a href="/trash" className="flex items-center gap-3 p-3 hover:bg-gray-100 text-gray-700 rounded-lg font-medium transition-colors">
          <Trash2 className="w-5 h-5" />
          Trash
        </a>
      </nav>
    </div>
  );
}