package com.uth.backend.service;

import com.uth.backend.dto.request.*;
import com.uth.backend.dto.response.FileResponse;
import com.uth.backend.dto.response.InitiateMultipartResponseDto;
import com.uth.backend.dto.response.UploadResponseDto;

import java.util.List;

public interface FileService {
    FileResponse createFile(String email, FileCreateRequest request);
    List<FileResponse> getFilesByFolder(String email, Long folderId);
    void deleteFile(String email, Long fileId);
    UploadResponseDto requestUpload(String email, UploadRequestDto requestDto);
    void confirmUpload(String email, ConfirmUploadRequestDto requestDto);
    String getFileDownloadUrl(String email, Long fileId);
    List<FileResponse> getTrashFiles(String email);
    void restoreFile(String email, Long fileId);
    void deleteFilesByFolder(String email, Long folderId);
    void restoreFilesByFolder(String email, Long folderId);
    void forceDeleteFile(String email, Long fileId);
    List<FileResponse> searchFiles(String email, String query);
    void emptyTrash(String email);
    InitiateMultipartResponseDto initiateMultipartUpload(String email, InitiateMultipartRequestDto request);
    void completeMultipartUpload(String email, CompleteMultipartRequestDto request);
}
