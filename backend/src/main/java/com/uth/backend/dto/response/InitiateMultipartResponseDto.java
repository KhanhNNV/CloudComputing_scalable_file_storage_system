package com.uth.backend.dto.response;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class InitiateMultipartResponseDto {
    private String uploadId;
    private String fileKey;
    private List<String> presignedUrls;
}