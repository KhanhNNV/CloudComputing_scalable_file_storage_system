package com.uth.backend.controller;

import com.uth.backend.dto.response.FileResponse;
import com.uth.backend.dto.response.FolderContentResponse;
import com.uth.backend.dto.response.FolderResponse;
import com.uth.backend.service.FileService;
import com.uth.backend.service.FolderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final FileService fileService;
    private final FolderService folderService;

    @GetMapping
    public ResponseEntity<FolderContentResponse> search(@RequestParam("q") String query) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        List<FileResponse> files = fileService.searchFiles(email, query);
        List<FolderResponse> folders = folderService.searchFolders(email, query);

        return ResponseEntity.ok(FolderContentResponse.builder()
                .files(files)
                .folders(folders)
                .build());
    }
}
