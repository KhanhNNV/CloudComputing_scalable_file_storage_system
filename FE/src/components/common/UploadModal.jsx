import React, { useState } from 'react';
import { X, FileUp } from 'lucide-react';
import { fileService } from '../../services/fileService';

// Đổi đường dẫn import sang file api.js chuẩn
import api from '../../services/api';
import axios from 'axios'; // Giữ nguyên để bắn thẳng lên S3

export default function UploadModal({ isOpen, onClose }) {
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadingFileName, setUploadingFileName] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    if (!isOpen) return null;

    const resetAndClose = () => {
        setIsUploading(false);
        setUploadProgress(0);
        setUploadingFileName('');
        onClose();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            setIsUploading(true);
            setUploadingFileName(file.name);
            setUploadProgress(0);

            const userId = localStorage.getItem('userId') || 1;

            // ==========================================
            // BƯỚC 0: TÍNH TOÁN SHA-256
            // ==========================================
            console.log("%c [Worker] Đang băm file...", "color: #3b82f6; font-weight: bold;");
            const hash = await fileService.calculateFileHash(file);
            console.log("%c ===> SHA-256: " + hash, "color: #10b981; font-weight: bold; font-size: 14px;");

            // ==========================================
            // BƯỚC 1: XIN VÉ (Sử dụng api để có refreshToken)
            // ==========================================
            const requestPayload = {
                fileName: file.name,
                fileSize: file.size,
                contentType: file.type || 'application/octet-stream',
                folderId: null, // Đã fix thành null
                sha256: hash
            };

            // Đã thêm /api vào đường dẫn
            const requestRes = await api.post(`/api/files/request-upload?userId=${userId}`, requestPayload);
            
            const responseData = requestRes.data?.data || requestRes.data; 
            const { isDuplicate, uploadUrl, fileKey } = responseData;

            if (isDuplicate) {
                setUploadProgress(100);
                setTimeout(() => {
                    alert("Upload thành công! (File đã tồn tại, Backend tự động map)");
                    resetAndClose();
                }, 500);
                return;
            }

            // ==========================================
            // BƯỚC 2: BẮN FILE LÊN AWS S3 (Giữ nguyên axios gốc)
            // ==========================================
            await axios.put(uploadUrl, file, {
                headers: {
                    'Content-Type': file.type || 'application/octet-stream'
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });

            // ==========================================
            // BƯỚC 3: BÁO CÁO (Sử dụng api để có refreshToken)
            // ==========================================
            const confirmPayload = {
                fileKey: fileKey,
                fileName: file.name,
                folderId: null // Đã fix thành null
            };
            
            // Đã thêm /api vào đường dẫn
            await api.post(`/api/files/confirm-upload?userId=${userId}`, confirmPayload);

            setUploadProgress(100);
            
            setTimeout(() => {
                alert("200 OK - File saved to database.");
                resetAndClose();
            }, 500);

        } catch (error) {
            console.error("Lỗi trong quá trình upload:", error);
            alert("Đã xảy ra lỗi khi upload file. Vui lòng kiểm tra Console!");
            resetAndClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-[400px] p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Upload File</h3>
                    {!isUploading && (
                        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                <label className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4 flex flex-col items-center transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}`}>
                    <FileUp className="w-10 h-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Click to select file to upload</p>
                    <input 
                        type="file" 
                        className="hidden" 
                        onChange={handleFileChange} 
                        disabled={isUploading} 
                    />
                </label>

                {isUploading && (
                    <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span className="truncate pr-4">Uploading: {uploadingFileName}</span>
                            <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out" 
                                style={{ width: `${uploadProgress}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}