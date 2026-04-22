package com.uth.backend.service;

import com.uth.backend.dto.request.CompleteMultipartRequestDto;

import java.util.List;

public interface S3Service {
    String generatePresignedUrl(String fileKey, String contentType);
    String generateDownloadPresignedUrl(String fileKey, String fileName);
    void deleteFileFromS3(String fileKey);
    String createMultipartUpload(String fileKey, String contentType);
    List<String> generatePresignedUrlsForParts(String fileKey, String uploadId, int totalParts);
    void completeMultipartUpload(String fileKey, String uploadId, List<CompleteMultipartRequestDto.PartDto> parts);
}
