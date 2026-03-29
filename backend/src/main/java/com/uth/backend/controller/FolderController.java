package com.uth.backend.controller;

import com.uth.backend.dto.request.FolderCreateRequest;
import com.uth.backend.dto.response.FolderResponse;
import com.uth.backend.service.FolderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/folders")
@RequiredArgsConstructor
@CrossOrigin("*")
public class FolderController {

    private final FolderService folderService;

    @PostMapping
    public ResponseEntity<FolderResponse> createFolder(
            @RequestParam("userId") Long userId,
            @RequestBody FolderCreateRequest request) {
        return new ResponseEntity<>(folderService.createFolder(userId, request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<FolderResponse>> getFolders(
            @RequestParam("userId") Long userId,
            @RequestParam(value = "parentId", required = false) Long parentId) {
        return ResponseEntity.ok(folderService.getFoldersByParent(userId, parentId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFolder(
            @RequestParam("userId") Long userId,
            @PathVariable("id") Long folderId) {
        folderService.deleteFolder(userId, folderId);
        return ResponseEntity.noContent().build();
    }
}
