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
import com.uth.backend.repository.UserRepository;
import com.uth.backend.service.FileService;
import com.uth.backend.service.S3Service;
import com.uth.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private final UserRepository userRepository;

    @Override
    public FileResponse createFile(String email, FileCreateRequest request) {
        User owner = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Không tìm thấy user"));
        Long ownerId = owner.getId();
        
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
                fileRepository.existsByOwnerIdAndNameAndFolderIdAndIsDeletedFalse(ownerId, request.getName(), folder.getId()) :
                fileRepository.existsByOwnerIdAndNameAndFolderIsNullAndIsDeletedFalse(ownerId, request.getName());

        if (exists) {
            throw new RuntimeException("Tệp có tên " + request.getName() + " đã tồn tại trong thư mục này");
        }

        File file = new File();
        file.setName(request.getName());
        file.setOwner(owner);
        file.setFolder(folder);
        file.setStorageObject(storageObject);

        File savedFile = fileRepository.save(file);
        return mapToResponse(savedFile);
    }
    
    @Override
    @Transactional
    public UploadResponseDto requestUpload(String email, UploadRequestDto request) {

        User owner = userRepository.findByEmail(email).orElseThrow(()-> new RuntimeException("Không tìm thấy user"));
        
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
            String fileKey = "users/" + owner.getId() + "/" + System.currentTimeMillis() + "-" + request.getFileName();
            String presignedUrl = s3Service.generatePresignedUrl(fileKey, request.getContentType());
            
            // Lưu StorageObject với trạng thái 'uploading'
            StorageObject newObj = new StorageObject();
            newObj.setSha256(request.getSha256());
            newObj.setS3Key(fileKey);
            newObj.setSize(request.getFileSize());
            newObj.setMimeType(request.getContentType());
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
    @Transactional
    public void confirmUpload(String email, ConfirmUploadRequestDto request) {
        User owner = userRepository.findByEmail(email).orElseThrow(()-> new RuntimeException("Không tìm thấy user"));
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
                fileRepository.existsByOwnerIdAndNameAndFolderIdAndIsDeletedFalse(owner.getId(), fileName, folder.getId()) :
                fileRepository.existsByOwnerIdAndNameAndFolderIsNullAndIsDeletedFalse(owner.getId(), fileName);
                
        if (exists) {
            throw new RuntimeException("Tệp có tên " + fileName + " đã tồn tại trong thư mục này");
        }

        File file = new File();
        file.setName(fileName);
        file.setOwner(owner);
        file.setFolder(folder);
        file.setStorageObject(storageObject);

        fileRepository.save(file);
    }

    @Override
    public List<FileResponse> getFilesByFolder(String email, Long folderId) {
        User owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));
        Long ownerId = owner.getId();
        List<File> files;
        if (folderId == null) {
            files = fileRepository.findByOwnerIdAndFolderIsNullAndIsDeletedFalse(ownerId);
        } else {
            files = fileRepository.findByOwnerIdAndFolderIdAndIsDeletedFalse(ownerId, folderId);
        }
        return files.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public void deleteFile(String email, Long fileId) {
        User owner = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Không tìm thấy user"));
        Long ownerId = owner.getId();
        File file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tệp"));
        
        if (!file.getOwner().getId().equals(ownerId)) {
            throw new RuntimeException("Truy cập bị từ chối");
        }
        
        file.setDeleted(true);
        fileRepository.save(file);
    }
    
    @Override
    @Transactional
    public void deleteFilesByFolder(String email, Long folderId) {
        User owner = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Không tìm thấy user"));
        Long ownerId = owner.getId();
        List<File> files = fileRepository.findByOwnerIdAndFolderIdAndIsDeletedFalse(ownerId, folderId);
        for (File file : files) {
            file.setDeleted(true);
            fileRepository.save(file);
        }
    }

    @Override
    public String getFileDownloadUrl(String email, Long fileId) {
        User owner = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Không tìm thấy user"));
        Long ownerId = owner.getId();
        File file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tệp"));

        if (!file.getOwner().getId().equals(ownerId)) {
            throw new RuntimeException("Truy cập bị từ chối");
        }

        if (file.getStorageObject() == null) {
            throw new RuntimeException("Tệp chưa có dữ liệu vật lý");
        }

        return s3Service.generateDownloadPresignedUrl(file.getStorageObject().getS3Key(), file.getName());
    }

    @Override
    public List<FileResponse> getTrashFiles(String email) {
        User owner = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Không tìm thấy user"));
        Long ownerId = owner.getId();
        List<File> files = fileRepository.findByOwnerIdAndIsDeletedTrue(ownerId);
        return files.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void restoreFile(String email, Long fileId) {
        User owner = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Không tìm thấy user"));
        Long ownerId = owner.getId();
        File file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tệp"));
        
        if (!file.getOwner().getId().equals(ownerId)) {
            throw new RuntimeException("Truy cập bị từ chối");
        }
        
        if (!file.isDeleted()) {
            return; // Đã đang hoạt động thì không cần khôi phục
        }
        
        // Tự động đổi tên nếu bị trùng tại thư mục đích
        Long folderId = file.getFolder() != null ? file.getFolder().getId() : null;
        String uniqueName = generateUniqueFileName(ownerId, folderId, file.getName());
        file.setName(uniqueName);
        
        file.setDeleted(false);
        fileRepository.save(file);
    }
    
    @Override
    @Transactional
    public void restoreFilesByFolder(String email, Long folderId) {
        User owner = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Không tìm thấy user"));
        Long ownerId = owner.getId();
        List<File> files = fileRepository.findByOwnerIdAndIsDeletedTrue(ownerId);
        // Ở đây chúng ta chỉ khôi phục các file trỏ vào folder này
        for (File file : files) {
            if (file.getFolder() != null && file.getFolder().getId().equals(folderId)) {
                restoreFile(email, file.getId());
            }
        }
    }

    private String generateUniqueFileName(Long ownerId, Long folderId, String originalName) {
        String baseName = originalName;
        String extension = "";
        int lastDotIndex = originalName.lastIndexOf(".");
        if (lastDotIndex > 0) {
            baseName = originalName.substring(0, lastDotIndex);
            extension = originalName.substring(lastDotIndex);
        }

        String currentName = originalName;
        int counter = 1;
        while (checkFileExists(ownerId, folderId, currentName)) {
            currentName = baseName + " (" + counter + ")" + extension;
            counter++;
        }
        return currentName;
    }

    private boolean checkFileExists(Long ownerId, Long folderId, String name) {
        if (folderId != null) {
            return fileRepository.existsByOwnerIdAndNameAndFolderIdAndIsDeletedFalse(ownerId, name, folderId);
        } else {
            return fileRepository.existsByOwnerIdAndNameAndFolderIsNullAndIsDeletedFalse(ownerId, name);
        }
    }

    private FileResponse mapToResponse(File file) {
        String downloadUrl = null;
        String thumbnailUrl = null;

        if (file.getStorageObject() != null && file.getStorageObject().getS3Key() != null) {
            String s3Key = file.getStorageObject().getS3Key();
            String mimeType = file.getStorageObject().getMimeType();

            downloadUrl = s3Service.generateDownloadPresignedUrl(s3Key, file.getName());
            if (mimeType != null && mimeType.toLowerCase().startsWith("image/")) {
                String thumbKey = s3Key.replaceFirst("users/", "thumbnails/");
                thumbnailUrl = s3Service.generateDownloadPresignedUrl(thumbKey, "thumb_" + file.getName());
            }
        }

        return FileResponse.builder()
                .id(file.getId())
                .name(file.getName())
                .folderId(file.getFolder() != null ? file.getFolder().getId() : null)
                .ownerId(file.getOwner().getId())
                .sha256(file.getStorageObject() != null ? file.getStorageObject().getSha256() : null)
                .size(file.getStorageObject() != null ? file.getStorageObject().getSize() : null)
                .mimeType(file.getStorageObject() != null ? file.getStorageObject().getMimeType() : null)
                .isDeleted(file.isDeleted())
                .createdAt(file.getCreatedAt())
                .downloadUrl(downloadUrl)
                .thumbnailUrl(thumbnailUrl)
                .build();
    }

    @Override
    @Transactional
    public void forceDeleteFile(String email, Long fileId) {
        User owner = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Không tìm thấy user"));
        Long ownerId = owner.getId();
        File file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tệp"));
        
        if (!file.getOwner().getId().equals(ownerId)) {
            throw new RuntimeException("Truy cập bị từ chối");
        }

        StorageObject storageObject = file.getStorageObject();
        
        // Xoá bản ghi file
        fileRepository.delete(file);

        // Kiểm tra xem storage object còn bị tham chiếu bởi file nào khác không
        if (storageObject != null) {
            boolean isReferenced = fileRepository.existsByStorageObjectIdAndIdNot(storageObject.getId(), fileId);
            if (!isReferenced) {
                // Xoá vật lý trên S3
                s3Service.deleteFileFromS3(storageObject.getS3Key());
                if (storageObject.getMimeType() != null && storageObject.getMimeType().toLowerCase().startsWith("image/")) {
                    String thumbKey = storageObject.getS3Key().replaceFirst("users/", "thumbnails/");
                    s3Service.deleteFileFromS3(thumbKey);
                }
                // Xoá storage object
                storageObjectRepository.delete(storageObject);
            }
        }
    }
}
