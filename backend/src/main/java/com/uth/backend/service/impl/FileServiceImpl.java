package com.uth.backend.service.impl;

import com.uth.backend.dto.request.FileCreateRequest;
import com.uth.backend.dto.response.FileResponse;
import com.uth.backend.model.File;
import com.uth.backend.model.Folder;
import com.uth.backend.model.StorageObject;
import com.uth.backend.model.User;
import com.uth.backend.repository.FileRepository;
import com.uth.backend.repository.FolderRepository;
import com.uth.backend.repository.StorageObjectRepository;
import com.uth.backend.service.FileService;
import com.uth.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FileServiceImpl implements FileService {

    private final FileRepository fileRepository;
    private final UserService userService;
    private final FolderRepository folderRepository;
    private final StorageObjectRepository storageObjectRepository;

    @Override
    public FileResponse createFile(Long ownerId, FileCreateRequest request) {
        User owner = userService.getUserEntityById(ownerId);
        
        Folder folder = null;
        if (request.getFolderId() != null) {
            folder = folderRepository.findById(request.getFolderId())
                    .orElseThrow(() -> new RuntimeException("Folder not found"));
        }

        StorageObject storageObject = null;
        if (request.getStorageObjectId() != null) {
            storageObject = storageObjectRepository.findById(request.getStorageObjectId())
                    .orElseThrow(() -> new RuntimeException("Storage object not found"));
        }


        // Đảm bảo không có 2 file nào bị trùng tên nhau bên trong cùng 1 Thư mục
        boolean exists = folder != null ?
                fileRepository.existsByOwnerIdAndDisplayNameAndFolderId(ownerId, request.getDisplayName(), folder.getId()) :
                fileRepository.existsByOwnerIdAndDisplayNameAndFolderIsNull(ownerId, request.getDisplayName());

        if (exists) {
            throw new RuntimeException("File with name " + request.getDisplayName() + " already exists in this folder");
        }

        File file = new File();
        file.setDisplayName(request.getDisplayName());
        file.setOwner(owner);
        file.setFolder(folder);
        file.setStorageObject(storageObject);

        File savedFile = fileRepository.save(file);
        return mapToResponse(savedFile);
    }

    @Override
    public List<FileResponse> getFilesByFolder(Long ownerId, Long folderId) {
        List<File> files;
        if (folderId == null) {
            files = fileRepository.findByOwnerIdAndFolderIsNull(ownerId);
        } else {
            files = fileRepository.findByOwnerIdAndFolderId(ownerId, folderId);
        }
        return files.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public void deleteFile(Long ownerId, Long fileId) {
        File file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));
        
        if (file.getOwner().getId() != ownerId) {
            throw new RuntimeException("Access denied");
        }
        
        fileRepository.delete(file);
    }

    private FileResponse mapToResponse(File file) {
        return FileResponse.builder()
                .id(file.getId())
                .displayName(file.getDisplayName())
                .folderId(file.getFolder() != null ? file.getFolder().getId() : null)
                .ownerId(file.getOwner().getId())
                .sha256(file.getStorageObject() != null ? file.getStorageObject().getSha256() : null)
                .size(file.getStorageObject() != null ? file.getStorageObject().getSize() : null)
                .build();
    }
}
