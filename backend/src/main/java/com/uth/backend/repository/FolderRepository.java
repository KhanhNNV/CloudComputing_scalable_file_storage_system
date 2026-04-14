package com.uth.backend.repository;

import com.uth.backend.model.Folder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FolderRepository extends JpaRepository<Folder, Long> {
    List<Folder> findByOwnerIdAndParentFolderIdAndIsDeletedFalse(Long ownerId, Long parentId);
    List<Folder> findByOwnerIdAndParentFolderIdAndIsDeleted(Long ownerId, Long parentId, boolean isDeleted);
    List<Folder> findByOwnerIdAndParentFolderIsNullAndIsDeletedFalse(Long ownerId);
    boolean existsByOwnerIdAndNameAndParentFolderIdAndIsDeletedFalse(Long ownerId, String name, Long parentId);
    boolean existsByOwnerIdAndNameAndParentFolderIsNullAndIsDeletedFalse(Long ownerId, String name);
    List<Folder> findByOwnerIdAndIsDeletedTrue(Long ownerId);
    List<Folder> findByOwnerIdAndNameContainingIgnoreCaseAndIsDeletedFalse(Long ownerId, String name);
}
