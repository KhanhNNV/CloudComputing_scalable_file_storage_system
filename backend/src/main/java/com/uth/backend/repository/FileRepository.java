package com.uth.backend.repository;

import com.uth.backend.model.File;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FileRepository extends JpaRepository<File, Long> {
    List<File> findByOwnerIdAndFolderIdAndIsDeletedFalse(Long ownerId, Long folderId);
    List<File> findByOwnerIdAndFolderIdAndIsDeleted(Long ownerId, Long folderId, boolean isDeleted);
    List<File> findByOwnerIdAndFolderIsNullAndIsDeletedFalse(Long ownerId);
    boolean existsByOwnerIdAndNameAndFolderIdAndIsDeletedFalse(Long ownerId, String name, Long folderId);
    boolean existsByOwnerIdAndNameAndFolderIsNullAndIsDeletedFalse(Long ownerId, String name);
    List<File> findByOwnerIdAndIsDeletedTrue(Long ownerId);
    boolean existsByStorageObjectIdAndIdNot(Long storageObjectId, Long fileId);
}
