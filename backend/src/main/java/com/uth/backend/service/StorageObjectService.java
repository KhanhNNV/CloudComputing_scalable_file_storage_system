package com.uth.backend.service;

import com.uth.backend.model.StorageObject;

public interface StorageObjectService {
    StorageObject createOrGetStorageObject(String sha256, Long size, String s3Key);
}
