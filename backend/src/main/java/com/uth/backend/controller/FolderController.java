package com.uth.backend.controller;

import com.uth.backend.dto.request.FolderCreateRequest;
import com.uth.backend.dto.response.FolderContentResponse;
import com.uth.backend.dto.response.FolderResponse;
import com.uth.backend.service.FolderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/folders")
@RequiredArgsConstructor
public class FolderController {

    private final FolderService folderService;

    @PostMapping
    public ResponseEntity<FolderResponse> createFolder(
            @RequestBody FolderCreateRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return new ResponseEntity<>(folderService.createFolder(authentication.getName(), request), HttpStatus.CREATED);
    }

    @GetMapping({"/content", "/{id}/content"})
    public ResponseEntity<FolderContentResponse> getFolderContent(
            @PathVariable(value = "id", required = false) Long folderId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(folderService.getFolderContent(authentication.getName(), folderId));
    }

    @PostMapping("/{id}/restore")
    public ResponseEntity<Void> restoreFolder(
            @PathVariable("id") Long folderId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        folderService.restoreFolder(authentication.getName(), folderId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/trash/all")
    public ResponseEntity<FolderContentResponse> getUnifiedTrash() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(folderService.getUnifiedTrash(authentication.getName()));
    }

    @GetMapping
    public ResponseEntity<List<FolderResponse>> getFolders(
            @RequestParam(value = "parentId", required = false) Long parentId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(folderService.getFoldersByParent(authentication.getName(), parentId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFolder(
            @PathVariable("id") Long folderId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        folderService.deleteFolder(authentication.getName(), folderId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/force")
    public ResponseEntity<Void> forceDeleteFolder(
            @PathVariable("id") Long folderId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        folderService.forceDeleteFolder(authentication.getName(), folderId);
        return ResponseEntity.noContent().build();
    }
}
