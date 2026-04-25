package com.uth.backend.service.impl;

import com.uth.backend.service.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.model.CompletedPart;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;
import java.util.List;

@Service
@RequiredArgsConstructor
public class S3ServiceImpl implements S3Service {

    private final S3Presigner s3Presigner;
    private final software.amazon.awssdk.services.s3.S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Override
    public String generatePresignedUrl(String fileKey, String contentType) {
        PutObjectRequest objectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(fileKey)
                .contentType(contentType)
                .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(15))
                .putObjectRequest(objectRequest)
                .build();

        PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);
        return presignedRequest.url().toString();
    }

    @Override
    public String generateDownloadPresignedUrl(String fileKey, String fileName) {
        GetObjectRequest objectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(fileKey)
                .responseContentDisposition("attachment; filename=\"" + fileName + "\"")
                .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(15))
                .getObjectRequest(objectRequest)
                .build();

        PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);
        return presignedRequest.url().toString();
    }

    @Override
    public void deleteFileFromS3(String fileKey) {
        if (fileKey == null || fileKey.isEmpty()) {
            return;
        }
        software.amazon.awssdk.services.s3.model.DeleteObjectRequest deleteRequest = software.amazon.awssdk.services.s3.model.DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(fileKey)
                .build();
        s3Client.deleteObject(deleteRequest);
    }


    // 1. Xin AWS cấp một cái ID cho phiên Upload này
    public String createMultipartUpload(String fileKey, String contentType) {
        software.amazon.awssdk.services.s3.model.CreateMultipartUploadRequest request =
                software.amazon.awssdk.services.s3.model.CreateMultipartUploadRequest.builder()
                        .bucket(bucketName)
                        .key(fileKey)
                        .contentType(contentType)
                        .build();

        return s3Client.createMultipartUpload(request).uploadId();
    }

    // 2. Tạo danh sách Presigned URLs tương ứng với số lượng cục file (chunks)
    public List<String> generatePresignedUrlsForParts(String fileKey, String uploadId, int totalParts) {
        List<String> urls = new java.util.ArrayList<>();

        // AWS S3 quy định PartNumber bắt đầu từ 1 (không phải 0)
        for (int i = 1; i <= totalParts; i++) {
            software.amazon.awssdk.services.s3.model.UploadPartRequest uploadPartRequest =
                    software.amazon.awssdk.services.s3.model.UploadPartRequest.builder()
                            .bucket(bucketName)
                            .key(fileKey)
                            .uploadId(uploadId)
                            .partNumber(i)
                            .build();

            software.amazon.awssdk.services.s3.presigner.model.UploadPartPresignRequest presignRequest =
                    software.amazon.awssdk.services.s3.presigner.model.UploadPartPresignRequest.builder()
                            .signatureDuration(java.time.Duration.ofMinutes(30)) // Cho hẳn 30 phút để up
                            .uploadPartRequest(uploadPartRequest)
                            .build();

            urls.add(s3Presigner.presignUploadPart(presignRequest).url().toString());
        }
        return urls;
    }

    // 3. Ra lệnh cho AWS gộp các cục file lại
    public void completeMultipartUpload(String fileKey, String uploadId, List<com.uth.backend.dto.request.CompleteMultipartRequestDto.PartDto> parts) {
        // Chuyển đổi PartDto của mình thành CompletedPart của AWS
        List<CompletedPart> completedParts = parts.stream()
                .map(p -> software.amazon.awssdk.services.s3.model.CompletedPart.builder()
                        .partNumber(p.getPartNumber())
                        .eTag(p.getEtag())
                        .build())
                .collect(java.util.stream.Collectors.toList());

        software.amazon.awssdk.services.s3.model.CompletedMultipartUpload completedMultipartUpload =
                software.amazon.awssdk.services.s3.model.CompletedMultipartUpload.builder()
                        .parts(completedParts)
                        .build();

        software.amazon.awssdk.services.s3.model.CompleteMultipartUploadRequest completeRequest =
                software.amazon.awssdk.services.s3.model.CompleteMultipartUploadRequest.builder()
                        .bucket(bucketName)
                        .key(fileKey)
                        .uploadId(uploadId)
                        .multipartUpload(completedMultipartUpload)
                        .build();

        s3Client.completeMultipartUpload(completeRequest);
    }
}
