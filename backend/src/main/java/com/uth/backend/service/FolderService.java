package com.uth.backend.service;

import com.uth.backend.dto.request.FolderCreateRequest;
import com.uth.backend.dto.response.FolderResponse;

import java.util.List;

public interface FolderService {
    FolderResponse createFolder(Long ownerId, FolderCreateRequest request);
    List<FolderResponse> getFoldersByParent(Long ownerId, Long parentId);
    void deleteFolder(Long ownerId, Long folderId);
}
