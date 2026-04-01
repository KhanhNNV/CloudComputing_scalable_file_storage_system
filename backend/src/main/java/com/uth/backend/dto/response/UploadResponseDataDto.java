package com.uth.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UploadResponseDataDto {
    @com.fasterxml.jackson.annotation.JsonProperty("isDuplicate")
    private boolean isDuplicate;
    private String uploadUrl;
    private String fileKey;
}
