package com.uth.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UploadRequestDto {
    private String fileName;
    private Long fileSize;
    private String contentType;
    private Long folderId;
    private String sha256;
}
