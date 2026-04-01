package com.uth.backend.service;

import com.uth.backend.dto.request.ConfirmUploadRequestDto;
import com.uth.backend.dto.request.FileCreateRequest;
import com.uth.backend.dto.request.UploadRequestDto;
import com.uth.backend.dto.response.FileResponse;
import com.uth.backend.dto.response.UploadResponseDto;

import java.util.List;

public interface FileService {
    FileResponse createFile(Long ownerId, FileCreateRequest request);
    List<FileResponse> getFilesByFolder(Long ownerId, Long folderId);
    void deleteFile(Long ownerId, Long fileId);
    UploadResponseDto requestUpload(Long ownerId, UploadRequestDto requestDto);
    void confirmUpload(Long ownerId, ConfirmUploadRequestDto requestDto);
}
