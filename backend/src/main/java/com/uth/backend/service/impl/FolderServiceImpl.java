package com.uth.backend.service.impl;

import com.uth.backend.dto.request.FolderCreateRequest;
import com.uth.backend.dto.response.FileResponse;
import com.uth.backend.dto.response.FolderContentResponse;
import com.uth.backend.dto.response.FolderResponse;
import com.uth.backend.model.File;
import com.uth.backend.model.Folder;
import com.uth.backend.model.User;
import com.uth.backend.repository.FileRepository;
import com.uth.backend.repository.FolderRepository;
import com.uth.backend.repository.UserRepository;
import com.uth.backend.service.FileService;
import com.uth.backend.service.FolderService;
import com.uth.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FolderServiceImpl implements FolderService {

    private final FolderRepository folderRepository;
    private final UserService userService;
    private final FileRepository fileRepository;
    private final UserRepository userRepository;
    private final FileService fileService;

    @Override
    public FolderResponse createFolder(String email, FolderCreateRequest request) {
        User owner = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Không tìm thấy user"));
        Long ownerId = owner.getId();
        Folder parentFolder = null;
        if (request.getParentId() != null) {
            parentFolder = folderRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Thư mục cha không tồn tại"));
        }

        // Kiểm tra xem tên Thư mục có bị trùng với các Thư mục khác ở cùng một cấp độ (cùng Cha) hay không
        boolean exists = parentFolder != null ?
                folderRepository.existsByOwnerIdAndNameAndParentFolderIdAndIsDeletedFalse(ownerId, request.getName(), parentFolder.getId()) :
                folderRepository.existsByOwnerIdAndNameAndParentFolderIsNullAndIsDeletedFalse(ownerId, request.getName());

        if (exists) {
            throw new RuntimeException("Thư mục có tên " + request.getName() + " đã tồn tại");
        }

        Folder folder = new Folder();
        folder.setName(request.getName());
        folder.setOwner(owner);
        folder.setParentFolder(parentFolder);

        Folder savedFolder = folderRepository.save(folder);
        return mapToResponse(savedFolder);
    }

    @Override
    public List<FolderResponse> getFoldersByParent(String email, Long parentId) {
        User owner = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Không tìm thấy user"));
        Long ownerId = owner.getId();
        List<Folder> folders;
        if (parentId == null) {
            folders = folderRepository.findByOwnerIdAndParentFolderIsNullAndIsDeletedFalse(ownerId);
        } else {
            folders = folderRepository.findByOwnerIdAndParentFolderIdAndIsDeletedFalse(ownerId, parentId);
        }
        return folders.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteFolder(String email, Long folderId) {
        User owner = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Không tìm thấy user"));
        Long ownerId = owner.getId();
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thư mục"));
        
        if (!folder.getOwner().getId().equals(ownerId)) {
            throw new RuntimeException("Truy cập bị từ chối");
        }

        // 1. Xóa mềm chính folder này
        folder.setDeleted(true);
        folderRepository.save(folder);

        // 2. Xóa mềm các File con bên trong
        List<File> files = fileRepository.findByOwnerIdAndFolderIdAndIsDeletedFalse(ownerId, folderId);
        for (File file : files) {
            file.setDeleted(true);
            fileRepository.save(file);
        }

        // 3. Đệ quy xóa các Folder con bên trong
        List<Folder> subFolders = folderRepository.findByOwnerIdAndParentFolderIdAndIsDeletedFalse(ownerId, folderId);
        for (Folder sub : subFolders) {
            deleteFolder(email, sub.getId());
        }
    }

    @Override
    public List<FolderResponse> getTrashFolders(String email) {
        User owner = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Không tìm thấy user"));
        Long ownerId = owner.getId();
        List<Folder> folders = folderRepository.findByOwnerIdAndIsDeletedTrue(ownerId);
        return folders.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void restoreFolder(String email, Long folderId) {
        User owner = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Không tìm thấy user"));
        Long ownerId = owner.getId();
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thư mục"));
        
        if (!folder.getOwner().getId().equals(ownerId)) {
            throw new RuntimeException("Truy cập bị từ chối");
        }

        if (!folder.isDeleted()) {
            return;
        }

        // 1. Tự động đổi tên nếu trùng tại thư mục mới
        Long parentId = folder.getParentFolder() != null ? folder.getParentFolder().getId() : null;
        String uniqueName = generateUniqueFolderName(ownerId, parentId, folder.getName());
        folder.setName(uniqueName);
        
        folder.setDeleted(false);
        folderRepository.save(folder);

        // 2. Đệ quy khôi phục các File và Folder con (chúng ta sẽ tìm tất cả item đã xóa trỏ vào đây)
        // Lưu ý: Chỉ khôi phục những thứ TRƯỚC ĐÓ thuộc về folder này
        
        // Khôi phục File
        List<File> files = fileRepository.findByOwnerIdAndIsDeletedTrue(ownerId);
        for (File file : files) {
            if (file.getFolder() != null && file.getFolder().getId() == folderId) {
                file.setDeleted(false);
                fileRepository.save(file);
            }
        }

        // Khôi phục Folder con
        List<Folder> subFolders = folderRepository.findByOwnerIdAndIsDeletedTrue(ownerId);
        for (Folder sub : subFolders) {
            if (sub.getParentFolder() != null && sub.getParentFolder().getId().equals(folderId)) {
                restoreFolder(email, sub.getId());
            }
        }
    }

    private String generateUniqueFolderName(Long ownerId, Long parentId, String originalName) {
        String currentName = originalName;
        int counter = 1;
        while (checkFolderExists(ownerId, parentId, currentName)) {
            currentName = originalName + " (" + counter + ")";
            counter++;
        }
        return currentName;
    }

    private boolean checkFolderExists(Long ownerId, Long parentId, String name) {
        if (parentId != null) {
            return folderRepository.existsByOwnerIdAndNameAndParentFolderIdAndIsDeletedFalse(ownerId, name, parentId);
        } else {
            return folderRepository.existsByOwnerIdAndNameAndParentFolderIsNullAndIsDeletedFalse(ownerId, name);
        }
    }

    @Override
    public FolderContentResponse getFolderContent(String email, Long folderId) {
        User owner = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Không tìm thấy user"));
        Long ownerId = owner.getId();
        // Kiểm tra xem folder hiện tại có đang bị xóa không
        boolean isCurrentFolderDeleted = false;
        if (folderId != null) {
            Folder currentFolder = folderRepository.findById(folderId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy thư mục"));
            isCurrentFolderDeleted = currentFolder.isDeleted();
        }

        // 1. Lấy danh sách Folder con (khớp với trạng thái xóa của cha)
        List<Folder> subFolders;
        if (folderId != null) {
            subFolders = folderRepository.findByOwnerIdAndParentFolderIdAndIsDeleted(ownerId, folderId, isCurrentFolderDeleted);
        } else {
            subFolders = folderRepository.findByOwnerIdAndParentFolderIsNullAndIsDeletedFalse(ownerId);
        }
        List<FolderResponse> folderResponses = subFolders.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        // 2. Lấy danh sách File con (khớp với trạng thái xóa của cha)
        List<File> files;
        if (folderId != null) {
            files = fileRepository.findByOwnerIdAndFolderIdAndIsDeleted(ownerId, folderId, isCurrentFolderDeleted);
        } else {
            files = fileRepository.findByOwnerIdAndFolderIsNullAndIsDeletedFalse(ownerId);
        }
        List<FileResponse> fileResponses = files.stream()
                .map(this::mapFileToResponse)
                .collect(Collectors.toList());

        return FolderContentResponse.builder()
                .folders(folderResponses)
                .files(fileResponses)
                .build();
    }

    @Override
    public FolderContentResponse getUnifiedTrash(String email) {
        User owner = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Không tìm thấy user"));
        Long ownerId = owner.getId();
        // 1. Lấy toàn bộ Folder đã xóa
        List<Folder> allDeletedFolders = folderRepository.findByOwnerIdAndIsDeletedTrue(ownerId);
        
        // Lọc thông minh: Chỉ lấy những Folder mà Cha (Parent) của nó KHÔNG bị xóa
        List<FolderResponse> folderResponses = allDeletedFolders.stream()
                .filter(f -> f.getParentFolder() == null || !f.getParentFolder().isDeleted())
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        // 2. Lấy toàn bộ File đã xóa
        List<File> allDeletedFiles = fileRepository.findByOwnerIdAndIsDeletedTrue(ownerId);
        
        // Lọc thông minh: Chỉ lấy những File mà Folder chứa nó KHÔNG bị xóa
        List<FileResponse> fileResponses = allDeletedFiles.stream()
                .filter(f -> f.getFolder() == null || !f.getFolder().isDeleted())
                .map(this::mapFileToResponse)
                .collect(Collectors.toList());

        return FolderContentResponse.builder()
                .folders(folderResponses)
                .files(fileResponses)
                .build();
    }

    private FileResponse mapFileToResponse(File file) {
        return FileResponse.builder()
                .id(file.getId())
                .name(file.getName())
                .folderId(file.getFolder() != null ? file.getFolder().getId() : null)
                .ownerId(file.getOwner().getId())
                .size(file.getStorageObject().getSize())
                .mimeType(file.getStorageObject().getMimeType())
                .sha256(file.getStorageObject().getSha256())
                .createdAt(file.getCreatedAt())
                .isDeleted(file.isDeleted())
                .build();
    }

    private FolderResponse mapToResponse(Folder folder) {
        return FolderResponse.builder()
                .id(folder.getId())
                .name(folder.getName())
                .parentId(folder.getParentFolder() != null ? folder.getParentFolder().getId() : null)
                .ownerId(folder.getOwner().getId())
                .createdAt(folder.getCreatedAt())
                .isDeleted(folder.isDeleted())
                .build();
    }

    @Override
    @Transactional
    public void forceDeleteFolder(String email, Long folderId) {
        User owner = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Không tìm thấy user"));
        Long ownerId = owner.getId();
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thư mục"));

        if (!folder.getOwner().getId().equals(ownerId)) {
            throw new RuntimeException("Truy cập bị từ chối");
        }

        // 1. Force delete tất cả các File con (ở cả dạng deleted và chưa deleted)
        // fileService.forceDeleteFile() đã có logic lo liệu khoản StorageObject và S3, cho nên cứ gọi foreach
        List<File> files = fileRepository.findByOwnerIdAndFolderIdAndIsDeleted(ownerId, folderId, false);
        files.addAll(fileRepository.findByOwnerIdAndFolderIdAndIsDeleted(ownerId, folderId, true));
        // Lấy lại danh sách file không cần phân biệt isDeleted, ta có thể dùng findAll... nhưng chúng ta đã có list.
        // Thực chất tốt nhất là fetch lại 1 lượt tất cả File trỏ tới folder này, không quan tâm isDeleted
        // Ở đây tận dụng 2 query có sẵn (isDeleted=false và isDeleted=true) vì hiện tại trong bảng boolean chỉ mang 2 giá trị này.
        for (File file : files) {
            fileService.forceDeleteFile(email, file.getId());
        }

        // 2. Đệ quy force delete tất cả Folder con
        List<Folder> subFolders = folderRepository.findByOwnerIdAndParentFolderIdAndIsDeleted(ownerId, folderId, false);
        subFolders.addAll(folderRepository.findByOwnerIdAndParentFolderIdAndIsDeleted(ownerId, folderId, true));
        for (Folder sub : subFolders) {
            forceDeleteFolder(email, sub.getId());
        }

        // 3. Cuối cùng xoá bản ghi chính Folder này
        folderRepository.delete(folder);
    }
}
