package com.uth.backend.service;

import com.uth.backend.dto.request.FolderCreateRequest;
import com.uth.backend.dto.response.FolderContentResponse;
import com.uth.backend.dto.response.FolderResponse;

import java.util.List;

public interface FolderService {
    FolderResponse createFolder(Long ownerId, FolderCreateRequest request);
    List<FolderResponse> getFoldersByParent(Long ownerId, Long parentId);
    void deleteFolder(Long ownerId, Long folderId);
    List<FolderResponse> getTrashFolders(Long ownerId);
    void restoreFolder(Long ownerId, Long folderId);
    FolderContentResponse getFolderContent(Long ownerId, Long folderId);
    FolderContentResponse getUnifiedTrash(Long ownerId);
}
