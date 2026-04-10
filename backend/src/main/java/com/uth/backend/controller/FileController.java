package com.uth.backend.controller;

import com.uth.backend.dto.request.ConfirmUploadRequestDto;
import com.uth.backend.dto.request.FileCreateRequest;
import com.uth.backend.dto.request.UploadRequestDto;
import com.uth.backend.dto.response.FileResponse;
import com.uth.backend.dto.response.UploadResponseDto;
import com.uth.backend.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @PostMapping
    public ResponseEntity<FileResponse> createFileMetadata(
            @RequestBody FileCreateRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return new ResponseEntity<>(fileService.createFile(authentication.getName(), request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<FileResponse>> getFiles(
            @RequestParam(value = "folderId", required = false) Long folderId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(fileService.getFilesByFolder(authentication.getName(), folderId));
    }
    
    @PostMapping("/request-upload")
    public ResponseEntity<UploadResponseDto> requestUpload(
            @RequestBody UploadRequestDto request) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(fileService.requestUpload(authentication.getName(), request));
    }

    @PostMapping("/confirm-upload")
    public ResponseEntity<Void> confirmUpload(
            @RequestBody ConfirmUploadRequestDto request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        fileService.confirmUpload(authentication.getName(), request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFile(
            @PathVariable("id") Long fileId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        fileService.deleteFile(authentication.getName(), fileId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/force")
    public ResponseEntity<Void> forceDeleteFile(
            @PathVariable("id") Long fileId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        fileService.forceDeleteFile(authentication.getName(), fileId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/download-url")
    public ResponseEntity<String> getFileDownloadUrl(
            @PathVariable("id") Long fileId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(fileService.getFileDownloadUrl(authentication.getName(), fileId));
    }

    @PostMapping("/{id}/restore")
    public ResponseEntity<Void> restoreFile(
            @PathVariable("id") Long fileId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        fileService.restoreFile(authentication.getName(), fileId);
        return ResponseEntity.ok().build();
    }
}
