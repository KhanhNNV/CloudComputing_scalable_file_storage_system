package com.uth.backend.dto.request;

import lombok.Data;

@Data
public class UserCreateRequest {
    private String fullName;
    private String email;
    private String password;
}
