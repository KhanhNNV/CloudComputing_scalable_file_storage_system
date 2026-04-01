package com.uth.backend.service.impl;

import com.uth.backend.dto.request.ConfirmUploadRequestDto;
import com.uth.backend.dto.request.FileCreateRequest;
import com.uth.backend.dto.request.UploadRequestDto;
import com.uth.backend.dto.response.FileResponse;
import com.uth.backend.dto.response.UploadResponseDataDto;
import com.uth.backend.dto.response.UploadResponseDto;
import com.uth.backend.model.File;
import com.uth.backend.model.Folder;
import com.uth.backend.model.StorageObject;
import com.uth.backend.model.User;
import com.uth.backend.repository.FileRepository;
import com.uth.backend.repository.FolderRepository;
import com.uth.backend.repository.StorageObjectRepository;
import com.uth.backend.service.FileService;
import com.uth.backend.service.S3Service;
import com.uth.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FileServiceImpl implements FileService {

    private final FileRepository fileRepository;
    private final UserService userService;
    private final FolderRepository folderRepository;
    private final StorageObjectRepository storageObjectRepository;
    private final S3Service s3Service;

    @Override
    public FileResponse createFile(Long ownerId, FileCreateRequest request) {
        User owner = userService.getUserEntityById(ownerId);
        
        Folder folder = null;
        if (request.getFolderId() != null) {
            folder = folderRepository.findById(request.getFolderId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy thư mục"));
        }

        StorageObject storageObject = null;
        if (request.getStorageObjectId() != null) {
            storageObject = storageObjectRepository.findById(request.getStorageObjectId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy đối tượng lưu trữ"));
        }

        boolean exists = folder != null ?
                fileRepository.existsByOwnerIdAndDisplayNameAndFolderId(ownerId, request.getDisplayName(), folder.getId()) :
                fileRepository.existsByOwnerIdAndDisplayNameAndFolderIsNull(ownerId, request.getDisplayName());

        if (exists) {
            throw new RuntimeException("Tệp có tên " + request.getDisplayName() + " đã tồn tại trong thư mục này");
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
    public UploadResponseDto requestUpload(Long ownerId, UploadRequestDto request) {
        User owner = userService.getUserEntityById(ownerId);
        
        Optional<StorageObject> optionalStorage = storageObjectRepository.findBySha256(request.getSha256());
        if (optionalStorage.isPresent()) {
            StorageObject existingStorage = optionalStorage.get();
            
            // Nếu file đã sẵn sàng (ready), liên kết ngay lập tức
            if ("ready".equals(existingStorage.getStatus())) {
                saveFileToDatabase(request.getFileName(), request.getFolderId(), owner, existingStorage);
                
                return UploadResponseDto.builder()
                        .status("success")
                        .data(UploadResponseDataDto.builder()
                                .isDuplicate(true)
                                .uploadUrl(null)
                                .fileKey(existingStorage.getS3Key())
                                .build())
                        .build();
            } else {
                // Một người khác đang upload file này, cung cấp URL cho người dùng hiện tại luôn
                String presignedUrl = s3Service.generatePresignedUrl(existingStorage.getS3Key(), request.getContentType());
                return UploadResponseDto.builder()
                        .status("success")
                        .data(UploadResponseDataDto.builder()
                                .isDuplicate(false)
                                .uploadUrl(presignedUrl)
                                .fileKey(existingStorage.getS3Key())
                                .build())
                        .build();
            }
        } else {
            String fileKey = "users/" + ownerId + "/" + System.currentTimeMillis() + "-" + request.getFileName();
            String presignedUrl = s3Service.generatePresignedUrl(fileKey, request.getContentType());
            
            // Lưu StorageObject với trạng thái 'uploading'
            StorageObject newObj = new StorageObject();
            newObj.setSha256(request.getSha256());
            newObj.setS3Key(fileKey);
            newObj.setSize(request.getFileSize());
            newObj.setStatus("uploading");
            storageObjectRepository.save(newObj);
            
            return UploadResponseDto.builder()
                    .status("success")
                    .data(UploadResponseDataDto.builder()
                            .isDuplicate(false)
                            .uploadUrl(presignedUrl)
                            .fileKey(fileKey)
                            .build())
                    .build();
        }
    }

    @Override
    public void confirmUpload(Long ownerId, ConfirmUploadRequestDto request) {
        User owner = userService.getUserEntityById(ownerId);
        StorageObject storageObject = storageObjectRepository.findByS3Key(request.getFileKey())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đối tượng lưu trữ cho khóa đã cung cấp"));
                
        // Cập nhật trạng thái thành 'ready'
        storageObject.setStatus("ready");
        storageObjectRepository.save(storageObject);

        // Lưu bản ghi file
        saveFileToDatabase(request.getFileName(), request.getFolderId(), owner, storageObject);
    }
    
    private void saveFileToDatabase(String fileName, Long folderId, User owner, StorageObject storageObject) {
        Folder folder = null;
        if (folderId != null) {
            folder = folderRepository.findById(folderId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy thư mục"));
        }
        
        boolean exists = folder != null ?
                fileRepository.existsByOwnerIdAndDisplayNameAndFolderId(owner.getId(), fileName, folder.getId()) :
                fileRepository.existsByOwnerIdAndDisplayNameAndFolderIsNull(owner.getId(), fileName);
                
        if (exists) {
            throw new RuntimeException("Tệp có tên " + fileName + " đã tồn tại trong thư mục này");
        }

        File file = new File();
        file.setDisplayName(fileName);
        file.setOwner(owner);
        file.setFolder(folder);
        file.setStorageObject(storageObject);

        fileRepository.save(file);
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
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tệp"));
        
        if (file.getOwner().getId() != ownerId) {
            throw new RuntimeException("Truy cập bị từ chối");
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
