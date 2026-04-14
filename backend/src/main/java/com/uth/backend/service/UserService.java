package com.uth.backend.service;

import com.uth.backend.dto.request.UserCreateRequest;
import com.uth.backend.dto.response.UserResponse;
import com.uth.backend.model.User;

public interface UserService {
    User getUserEntityByEmail(String email);
    UserResponse getUserByEmail(String email);
    UserResponse createUser(UserCreateRequest request);
}
