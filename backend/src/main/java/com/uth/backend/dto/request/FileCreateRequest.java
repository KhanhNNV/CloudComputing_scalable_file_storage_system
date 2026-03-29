package com.uth.backend.dto.request;

import lombok.Data;

@Data
public class FileCreateRequest {
    private String displayName;
    private Long folderId;
    private Long storageObjectId;
}
