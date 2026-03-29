package com.uth.backend.service;

import com.uth.backend.dto.response.UserResponse;
import com.uth.backend.model.User;

public interface UserService {
    User getUserEntityById(Long id);
    UserResponse getUserById(Long id);
}
