package com.uth.backend.repository;

import com.uth.backend.model.Folder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FolderRepository extends JpaRepository<Folder, Long> {
    List<Folder> findByOwnerIdAndParentFolderId(Long ownerId, Long parentId);
    List<Folder> findByOwnerIdAndParentFolderIsNull(Long ownerId);
    boolean existsByOwnerIdAndNameAndParentFolderId(Long ownerId, String name, Long parentId);
    boolean existsByOwnerIdAndNameAndParentFolderIsNull(Long ownerId, String name);
}
