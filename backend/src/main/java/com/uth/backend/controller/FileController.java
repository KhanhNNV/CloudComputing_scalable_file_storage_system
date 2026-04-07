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
            @RequestParam("userId") Long userId,
            @RequestBody FileCreateRequest request) {
        return new ResponseEntity<>(fileService.createFile(userId, request), HttpStatus.CREATED);
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
            @RequestParam("userId") Long userId,
            @PathVariable("id") Long fileId) {
        fileService.deleteFile(userId, fileId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/download-url")
    public ResponseEntity<String> getFileDownloadUrl(
            @RequestParam("userId") Long userId,
            @PathVariable("id") Long fileId) {
        return ResponseEntity.ok(fileService.getFileDownloadUrl(userId, fileId));
    }

    @PostMapping("/{id}/restore")
    public ResponseEntity<Void> restoreFile(
            @RequestParam("userId") Long userId,
            @PathVariable("id") Long fileId) {
        fileService.restoreFile(userId, fileId);
        return ResponseEntity.ok().build();
    }
}
