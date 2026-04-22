package com.uth.backend.dto.request;
import lombok.Data;

@Data
public class InitiateMultipartRequestDto {
    private String fileName;
    private String contentType;
    private Integer totalParts;
    private Long folderId;
    private String sha256;
}