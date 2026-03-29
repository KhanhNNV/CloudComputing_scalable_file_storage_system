package com.uth.backend.repository;

import com.uth.backend.model.StorageObject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StorageObjectRepository extends JpaRepository<StorageObject, Long> {
    Optional<StorageObject> findBySha256(String sha256);
}
