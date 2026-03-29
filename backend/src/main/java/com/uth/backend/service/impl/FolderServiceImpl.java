package com.uth.backend.service.impl;

import com.uth.backend.dto.request.FolderCreateRequest;
import com.uth.backend.dto.response.FolderResponse;
import com.uth.backend.model.Folder;
import com.uth.backend.model.User;
import com.uth.backend.repository.FolderRepository;
import com.uth.backend.service.FolderService;
import com.uth.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FolderServiceImpl implements FolderService {

    private final FolderRepository folderRepository;
    private final UserService userService;

    @Override
    public FolderResponse createFolder(Long ownerId, FolderCreateRequest request) {
        User owner = userService.getUserEntityById(ownerId);
        Folder parentFolder = null;
        if (request.getParentId() != null) {
            parentFolder = folderRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent folder not found"));
        }

        // Kiểm tra xem tên Thư mục có bị trùng với các Thư mục khác ở cùng một cấp độ (cùng Cha) hay không
        boolean exists = parentFolder != null ?
                folderRepository.existsByOwnerIdAndNameAndParentFolderId(ownerId, request.getName(), parentFolder.getId()) :
                folderRepository.existsByOwnerIdAndNameAndParentFolderIsNull(ownerId, request.getName());

        if (exists) {
            throw new RuntimeException("Folder with name " + request.getName() + " already exists");
        }

        Folder folder = new Folder();
        folder.setName(request.getName());
        folder.setOwner(owner);
        folder.setParentFolder(parentFolder);

        Folder savedFolder = folderRepository.save(folder);
        return mapToResponse(savedFolder);
    }

    @Override
    public List<FolderResponse> getFoldersByParent(Long ownerId, Long parentId) {
        List<Folder> folders;
        if (parentId == null) {
            folders = folderRepository.findByOwnerIdAndParentFolderIsNull(ownerId);
        } else {
            folders = folderRepository.findByOwnerIdAndParentFolderId(ownerId, parentId);
        }
        return folders.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public void deleteFolder(Long ownerId, Long folderId) {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new RuntimeException("Folder not found"));
        
        if (folder.getOwner().getId() != ownerId) {
            throw new RuntimeException("Access denied");
        }

        folderRepository.delete(folder);
    }

    private FolderResponse mapToResponse(Folder folder) {
        return FolderResponse.builder()
                .id(folder.getId())
                .name(folder.getName())
                .parentId(folder.getParentFolder() != null ? folder.getParentFolder().getId() : null)
                .ownerId(folder.getOwner().getId())
                .build();
    }
}
