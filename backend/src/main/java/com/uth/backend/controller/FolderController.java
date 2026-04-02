package com.uth.backend.controller;

import com.uth.backend.dto.request.FolderCreateRequest;
import com.uth.backend.dto.response.FolderContentResponse;
import com.uth.backend.dto.response.FolderResponse;
import com.uth.backend.service.FolderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/folders")
@RequiredArgsConstructor
public class FolderController {

    private final FolderService folderService;

    @PostMapping
    public ResponseEntity<FolderResponse> createFolder(
            @RequestParam("userId") Long userId,
            @RequestBody FolderCreateRequest request) {
        return new ResponseEntity<>(folderService.createFolder(userId, request), HttpStatus.CREATED);
    }

    @GetMapping({"/content", "/{id}/content"})
    public ResponseEntity<FolderContentResponse> getFolderContent(
            @RequestParam("userId") Long userId,
            @PathVariable(value = "id", required = false) Long folderId) {
        return ResponseEntity.ok(folderService.getFolderContent(userId, folderId));
    }

    @PostMapping("/{id}/restore")
    public ResponseEntity<Void> restoreFolder(
            @RequestParam("userId") Long userId,
            @PathVariable("id") Long folderId) {
        folderService.restoreFolder(userId, folderId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/trash/all")
    public ResponseEntity<FolderContentResponse> getUnifiedTrash(
            @RequestParam("userId") Long userId) {
        return ResponseEntity.ok(folderService.getUnifiedTrash(userId));
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
