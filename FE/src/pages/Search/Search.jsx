import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileText, Image as ImageIcon, File as FileIcon, Loader2, Search as SearchIcon, Download, MoreVertical, Trash2 } from 'lucide-react';
import { searchService } from '../../services/searchService';
import { fileService } from '../../services/fileService';

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [results, setResults] = useState({ files: [], folders: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);

  const fetchResults = async () => {
    if (!query) return;
    try {
      setIsLoading(true);
      const data = await searchService.search(query);
      setResults(data);
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [query]);

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(i >= 2 ? 2 : 1)) + ' ' + sizes[i];
  };

  const getFileIcon = (file) => {
    const mimeType = (file.mimeType || '').toLowerCase();
    if (mimeType.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />;
    if (mimeType.includes('image')) return <ImageIcon className="w-8 h-8 text-green-500" />;
    return <FileIcon className="w-8 h-8 text-gray-500" />;
  };

  const isImage = (file) => (file.mimeType || '').toLowerCase().includes('image');

  const handleDownload = async (e, file) => {
    e.stopPropagation();
    try {
      const response = await fileService.getDownloadUrl(file.id);
      const downloadUrl = response?.url || response?.data?.url || response;
      if (downloadUrl) {
        window.open(downloadUrl, '_blank');
      }
    } catch (error) {
      alert("Lỗi khi tải file");
    }
    setOpenMenuId(null);
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <SearchIcon className="w-8 h-8 text-blue-500" />
        <h1 className="text-2xl font-bold text-gray-800">
          Kết quả cho: <span className="text-blue-600">"{query}"</span>
        </h1>
      </div>

      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-64 gap-4">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          <span className="text-gray-500 font-medium">Đang tìm kiếm...</span>
        </div>
      ) : (
        <div className="space-y-8">
          {/* FOLDERS RESULTS */}
          {results.folders.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Thư mục</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {results.folders.map((folder) => (
                  <div 
                    key={folder.id}
                    className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 flex items-center justify-center bg-amber-50 rounded-xl">
                      <SearchIcon className="w-6 h-6 text-amber-500" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700 truncate">{folder.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FILES RESULTS */}
          {results.files.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Tệp</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {results.files.map((file) => (
                  <div 
                    key={file.id}
                    className="relative flex flex-col items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="absolute top-2 right-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === file.id ? null : file.id); }}
                        className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      {openMenuId === file.id && (
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl z-30 border border-gray-100 py-1.5">
                          <button 
                            onClick={(e) => handleDownload(e, file)}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-3"
                          >
                            <Download className="w-4 h-4" /> Tải xuống
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="w-16 h-16 flex items-center justify-center">
                      {isImage(file) && (file.thumbnailUrl || file.downloadUrl) ? (
                        <img 
                          src={file.thumbnailUrl || file.downloadUrl} 
                          alt={file.name} 
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : getFileIcon(file)}
                    </div>
                    <div className="text-center w-full mt-2">
                      <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.files.length === 0 && results.folders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <SearchIcon className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">Không tìm thấy kết quả nào cho "{query}"</p>
              <p className="text-gray-400 text-sm mt-1">Hãy thử tìm kiếm với từ khóa khác.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
