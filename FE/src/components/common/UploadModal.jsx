import React, { useState } from 'react';
import { X, FileUp } from 'lucide-react';
import { fileService } from '../../services/fileService';
import axios from 'axios'; // Giữ lại axios để bắn file trực tiếp lên S3 qua presigned URL


// AWS yêu cầu mỗi phần (part) phải tối thiểu 5MB
const CHUNK_SIZE = 5 * 1024 * 1024;
export default function UploadModal({ isOpen, onClose, currentFolderId }) {
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

            // BƯỚC 0: TÍNH TOÁN SHA-256
            console.log("%c [Worker] Đang băm file...", "color: #3b82f6; font-weight: bold;");
            const hash = await fileService.calculateFileHash(file);
            console.log("%c ===> SHA-256: " + hash, "color: #10b981; font-weight: bold; font-size: 14px;");

            // NẾU FILE NHỎ HƠN 5MB -> DÙNG LUỒNG CŨ (UP 1 LẦN)
            if (file.size < CHUNK_SIZE) {
                await handleStandardUpload(file, hash);
            }
            // NẾU FILE LỚN HƠN 5MB -> DÙNG LUỒNG MỚI (BĂM NHỎ)
            else {
                await handleMultipartUpload(file, hash);
            }

        } catch (error) {
            console.error("Lỗi trong quá trình upload:", error);
            alert("Đã xảy ra lỗi khi upload file. Vui lòng thử lại!");
            resetAndClose();
        }
    };
    // --- LUỒNG 1: UPLOAD BÌNH THƯỜNG ---
    const handleStandardUpload = async (file, hash) => {
        const requestPayload = {
            fileName: file.name, fileSize: file.size,
            contentType: file.type || 'application/octet-stream',
            folderId: currentFolderId, sha256: hash
        };

        const { data } = await fileService.requestUpload(requestPayload);
        if (data.isDuplicate) {
            finishUpload("Upload thành công! (File đã tồn tại)");
            return;
        }

        await axios.put(data.uploadUrl, file, {
            headers: { 'Content-Type': file.type || 'application/octet-stream' },
            onUploadProgress: (p) => setUploadProgress(Math.round((p.loaded * 100) / p.total))
        });

        await fileService.confirmUpload({ fileKey: data.fileKey, fileName: file.name, folderId: currentFolderId });
        finishUpload("Upload thành công! File đã lưu vào Database.");
    };
    // --- LUỒNG 2: UPLOAD BĂM NHỎ (MULTIPART) ---
    const handleMultipartUpload = async (file, hash) => {
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        console.log(`[Multipart] Bắt đầu chia file thành ${totalChunks} phần...`);

        // 1. Xin Backend khởi tạo Multipart Upload
        // 1. Xin Backend khởi tạo Multipart Upload
        const responseData = await fileService.initiateMultipartUpload({
            fileName: file.name,
            contentType: file.type || 'application/octet-stream',
            totalParts: totalChunks,
            folderId: currentFolderId,
            sha256: hash
        });

        // Bỏ chữ data đi, lấy trực tiếp từ responseData
        const { uploadId, fileKey, presignedUrls } = responseData;
        const uploadedParts = [];
        let totalUploadedBytes = 0;

        // 2. Vòng lặp bắn từng cục file lên S3
        for (let i = 0; i < totalChunks; i++) {
            const start = i * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, file.size);
            const chunk = file.slice(start, end);

            const uploadUrl = presignedUrls[i];

            const response = await axios.put(uploadUrl, chunk, {
                headers: { 'Content-Type': file.type || 'application/octet-stream' }
            });

            // Lấy nguyên vẹn ETag (GIỮ NGUYÊN DẤU NGOẶC KÉP CỦA AWS)
            const etag = response.headers.etag || response.headers['etag'];

            console.log(`[Part ${i + 1}] ETag chuẩn AWS:`, etag);

            if (!etag) {
                alert("Cảnh báo: Không lấy được ETag! Vui lòng vào AWS S3 -> CORS -> Thêm 'ExposeHeaders': ['ETag']");
                return; // Dừng lại vì có đi tiếp AWS cũng báo lỗi
            }

            // Đổi chữ eTag thành etag (chữ thường) để khớp với Java
            uploadedParts.push({ partNumber: i + 1, etag: etag });

            totalUploadedBytes += chunk.size;
            setUploadProgress(Math.round((totalUploadedBytes * 100) / file.size));
        }

        // 3. Báo Backend gộp file (Bảo vệ folderId lỡ bị rỗng)
        await fileService.completeMultipartUpload({
            uploadId, fileKey, fileName: file.name,
            folderId: currentFolderId ? Number(currentFolderId) : null,
            parts: uploadedParts,
            contentType: file.type || 'application/octet-stream',
            fileSize: file.size,
            sha256: hash
        });

        finishUpload("Upload file lớn thành công! Đã gộp file.");
    };

    const finishUpload = (message) => {
        setUploadProgress(100);
        setTimeout(() => { alert(message); resetAndClose(); }, 500);
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