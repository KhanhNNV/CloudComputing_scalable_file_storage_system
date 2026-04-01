import React, { useState } from 'react'; // Thêm useState để quản lý trạng thái
import { X, FileUp } from 'lucide-react';
import { fileService } from '../../services/fileService'; // Import "máy băm" của Bình

export default function UploadModal({ isOpen, onClose }) {

    if (!isOpen) return null;


    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        console.log("%c [Worker] Đang xử lý file: " + file.name, "color: #3b82f6; font-weight: bold;");

        const hash = await fileService.calculateFileHash(file);

        console.log("%c ===> SHA-256: " + hash, "color: #10b981; font-weight: bold; font-size: 14px;");
        alert("Đã băm xong file!");
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-[400px] p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Upload File</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
                </div>

                {/* Biến cái khung cũ thành cái nút chọn file thật bằng thẻ <label> */}
                <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4 flex flex-col items-center cursor-pointer hover:bg-gray-50 transition-colors">
                    <FileUp className="w-10 h-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Click to select file to upload</p>

                    {/* CÁI NÀY LÀ INPUT ẨN ĐỂ NHẬN FILE */}
                    <input type="file" className="hidden" onChange={handleFileChange} />
                </label>

                {/* GIỮ NGUYÊN: Thanh Progress Bar tĩnh của bạn FE */}
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