package com.uth.backend.dto.request;

import lombok.Data;

@Data
public class FolderCreateRequest {
    private String name;
    private Long parentId;
}
