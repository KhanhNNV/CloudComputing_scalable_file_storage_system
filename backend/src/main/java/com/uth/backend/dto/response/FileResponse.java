package com.uth.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileResponse {
    private Long id;
    private String name;
    private Long folderId;
    private Long ownerId;
    private String sha256;
    private Long size;
    private String mimeType;
    private boolean isDeleted;
    private LocalDateTime createdAt;
    private String downloadUrl;
    private String thumbnailUrl;
}
