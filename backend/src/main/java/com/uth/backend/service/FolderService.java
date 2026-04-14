package com.uth.backend.service;

import com.uth.backend.dto.request.FolderCreateRequest;
import com.uth.backend.dto.response.FolderContentResponse;
import com.uth.backend.dto.response.FolderResponse;

import java.util.List;

public interface FolderService {
    FolderResponse createFolder(String email, FolderCreateRequest request);
    List<FolderResponse> getFoldersByParent(String email, Long parentId);
    void deleteFolder(String email, Long folderId);
    List<FolderResponse> getTrashFolders(String email);
    void restoreFolder(String email, Long folderId);
    FolderContentResponse getFolderContent(String email, Long folderId);
    FolderContentResponse getUnifiedTrash(String email);
    void forceDeleteFolder(String email, Long folderId);
    List<FolderResponse> searchFolders(String email, String query);
    void emptyTrash(String email);
}
