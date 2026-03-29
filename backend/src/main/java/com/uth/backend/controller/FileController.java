package com.uth.backend.controller;

import com.uth.backend.dto.request.FileCreateRequest;
import com.uth.backend.dto.response.FileResponse;
import com.uth.backend.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
@CrossOrigin("*")
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
            @RequestParam("userId") Long userId,
            @RequestParam(value = "folderId", required = false) Long folderId) {
        return ResponseEntity.ok(fileService.getFilesByFolder(userId, folderId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFile(
            @RequestParam("userId") Long userId,
            @PathVariable("id") Long fileId) {
        fileService.deleteFile(userId, fileId);
        return ResponseEntity.noContent().build();
    }
}
