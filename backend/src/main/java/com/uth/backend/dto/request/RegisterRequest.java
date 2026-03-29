package com.uth.backend.dto.request;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class RegisterRequest {
    String email;
    String password;
    String fullName;
}
