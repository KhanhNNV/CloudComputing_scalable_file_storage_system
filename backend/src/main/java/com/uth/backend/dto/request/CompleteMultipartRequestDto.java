package com.uth.backend.dto.request;
import lombok.Data;
import java.util.List;

@Data
public class CompleteMultipartRequestDto {
    private String uploadId;
    private String fileKey;
    private String fileName;
    private Long folderId;
    private List<PartDto> parts;
    private String contentType; // Hứng mimeType
    private Long fileSize;      // Hứng dung lượng thật luôn, khỏi để 0L nữa
    private String sha256;

    @Data
    public static class PartDto {
        private Integer partNumber;
        private String etag;
    }
}