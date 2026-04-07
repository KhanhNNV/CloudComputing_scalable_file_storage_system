package com.uth.backend.service;

import com.uth.backend.dto.request.ConfirmUploadRequestDto;
import com.uth.backend.dto.request.FileCreateRequest;
import com.uth.backend.dto.request.UploadRequestDto;
import com.uth.backend.dto.response.FileResponse;
import com.uth.backend.dto.response.UploadResponseDto;

import java.util.List;

public interface FileService {
    FileResponse createFile(Long ownerId, FileCreateRequest request);
    List<FileResponse> getFilesByFolder(String email, Long folderId);
    void deleteFile(Long ownerId, Long fileId);
    UploadResponseDto requestUpload(String email, UploadRequestDto requestDto);
    void confirmUpload(String email, ConfirmUploadRequestDto requestDto);
    String getFileDownloadUrl(Long ownerId, Long fileId);
    List<FileResponse> getTrashFiles(Long ownerId);
    void restoreFile(Long ownerId, Long fileId);
    void deleteFilesByFolder(Long ownerId, Long folderId);
    void restoreFilesByFolder(Long ownerId, Long folderId);
}
