package com.uth.backend.service;

import com.uth.backend.dto.request.FileCreateRequest;
import com.uth.backend.dto.response.FileResponse;

import java.util.List;

public interface FileService {
    FileResponse createFile(Long ownerId, FileCreateRequest request);
    List<FileResponse> getFilesByFolder(Long ownerId, Long folderId);
    void deleteFile(Long ownerId, Long fileId);
}
