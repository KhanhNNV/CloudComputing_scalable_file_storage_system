//Modal tĩnh cho Tuần 1
import React from 'react';
import { X, FileUp } from 'lucide-react';

export default function UploadModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[400px] p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Upload File</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4 flex flex-col items-center cursor-pointer hover:bg-gray-50 transition-colors">
          <FileUp className="w-10 h-10 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">Click or drag file to this area to upload</p>
        </div>

        {/* Thanh Progress Bar tĩnh cho tuần 1 */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Uploading: BaoCaoTuan1.pdf</span>
            <span>45%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}