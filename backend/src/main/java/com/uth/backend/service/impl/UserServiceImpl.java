package com.uth.backend.service.impl;

import com.uth.backend.dto.request.UserCreateRequest;
import com.uth.backend.dto.response.UserResponse;
import com.uth.backend.model.User;
import com.uth.backend.repository.UserRepository;
import com.uth.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public User getUserEntityByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public UserResponse getUserByEmail(String email) {
        User user = getUserEntityByEmail(email);
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .storageUsed(user.getStorageUsed())
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Override
    public UserResponse createUser(UserCreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng");
        }
        
        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        user = userRepository.save(user);
        
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .storageUsed(user.getStorageUsed())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
