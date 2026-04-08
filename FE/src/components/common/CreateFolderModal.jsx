import React, { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';
import { folderService } from '../../services/folderService';

export default function CreateFolderModal({ isOpen, onClose, currentFolderId, onSuccess }) {
    const [folderName, setFolderName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    if (!isOpen) return null;

    const resetAndClose = () => {
        setFolderName('');
        setErrorMsg('');
        setIsCreating(false);
        onClose();
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!folderName.trim()) {
            setErrorMsg('Vui lòng nhập tên thư mục!');
            return;
        }

        try {
            setIsCreating(true);
            setErrorMsg('');
            
            // Gọi API qua Service
            await folderService.createFolder(folderName.trim(), currentFolderId);
            
            // Thông báo thành công và gọi hàm onSuccess (để Component cha load lại danh sách file/folder)
            onSuccess();
            resetAndClose();
        } catch (error) {
            console.error("Lỗi:", error);
            const msg = error.response?.data?.message || "Đã xảy ra lỗi khi tạo thư mục. Vui lòng thử lại!";
            setErrorMsg(msg);
            setIsCreating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-[400px] p-6">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <FolderPlus className="w-5 h-5 text-blue-600" />
                        <h3 className="font-bold text-lg">Tạo thư mục mới</h3>
                    </div>
                    {!isCreating && (
                        <button onClick={resetAndClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    )}
                </div>

                <form onSubmit={handleCreate}>
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Nhập tên thư mục..."
                            value={folderName}
                            onChange={(e) => setFolderName(e.target.value)}
                            disabled={isCreating}
                            autoFocus
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        {errorMsg && <p className="text-red-500 text-sm mt-2">{errorMsg}</p>}
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={resetAndClose}
                            disabled={isCreating}
                            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium disabled:opacity-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isCreating}
                            className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                        >
                            {isCreating ? 'Đang tạo...' : 'Tạo mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}