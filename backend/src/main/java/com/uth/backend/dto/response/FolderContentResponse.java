package com.uth.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FolderContentResponse {
    private List<FolderResponse> folders;
    private List<FileResponse> files;
}
