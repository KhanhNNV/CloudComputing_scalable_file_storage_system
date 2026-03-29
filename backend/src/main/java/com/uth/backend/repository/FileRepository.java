package com.uth.backend.repository;

import com.uth.backend.model.File;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FileRepository extends JpaRepository<File, Long> {
    List<File> findByOwnerIdAndFolderId(Long ownerId, Long folderId);
    List<File> findByOwnerIdAndFolderIsNull(Long ownerId);
    boolean existsByOwnerIdAndDisplayNameAndFolderId(Long ownerId, String displayName, Long folderId);
    boolean existsByOwnerIdAndDisplayNameAndFolderIsNull(Long ownerId, String displayName);
}
