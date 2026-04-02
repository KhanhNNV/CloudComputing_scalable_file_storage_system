package com.uth.backend.service;

public interface S3Service {
    String generatePresignedUrl(String fileKey, String contentType);
    String generateDownloadPresignedUrl(String fileKey, String fileName);
}
