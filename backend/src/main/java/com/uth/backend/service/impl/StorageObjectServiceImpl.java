package com.uth.backend.service.impl;

import com.uth.backend.model.StorageObject;
import com.uth.backend.repository.StorageObjectRepository;
import com.uth.backend.service.StorageObjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StorageObjectServiceImpl implements StorageObjectService {

    private final StorageObjectRepository storageObjectRepository;

    @Override
    public StorageObject createOrGetStorageObject(String sha256, Long size, String s3Key, String mimeType) {
        // Bắt đầu Deduplication: Nếu mã hash đã tồn tại trên Cloud, lấy ra dùng lại luôn
        Optional<StorageObject> existingObj = storageObjectRepository.findBySha256(sha256);
        if (existingObj.isPresent()) {
            return existingObj.get();
        }

        StorageObject newObj = new StorageObject();
        newObj.setSha256(sha256);
        newObj.setSize(size);
        newObj.setS3Key(s3Key);
        newObj.setMimeType(mimeType);
        
        return storageObjectRepository.save(newObj);
    }
}
