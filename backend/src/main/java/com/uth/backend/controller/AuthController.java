package com.uth.backend.controller;


import com.uth.backend.dto.request.LoginRequest;
import com.uth.backend.dto.request.RegisterRequest;
import com.uth.backend.dto.response.LoginResponse;
import com.uth.backend.model.User;
import com.uth.backend.repository.UserRepository;
import com.uth.backend.service.auth.AuthenticationService;
import com.uth.backend.service.auth.JwtService;
import com.uth.backend.service.auth.TokenBlacklistService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationService authenticationService;
    private final JwtService jwtService;
    private final TokenBlacklistService tokenBlacklistService;
    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = authenticationService.login(request);

        // Gắn Refresh Token vào Cookie
        ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken", response.getRefreshToken())
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(30 * 24 * 60 * 60) // 30 ngày
                .sameSite("Strict")
                .build();

        response.setRefreshToken(null);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString())
                .body(response);
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        authenticationService.register(request);
        return ResponseEntity.ok("Người dùng đã đăng ký thành công");
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(
            @CookieValue(name = "refreshToken", required = false) String refreshToken) {

        try {
            if (refreshToken == null || !jwtService.verifyToken(refreshToken)) {
                return ResponseEntity.status(403).build(); // 403 Bị cấm
            }

            String email = jwtService.extractUsername(refreshToken);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

            String newAccessToken = jwtService.generateAccessToken(user);

            return ResponseEntity.ok(LoginResponse.builder().accessToken(newAccessToken).build());
        } catch (Exception e) {
            return ResponseEntity.status(403).build();
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            HttpServletRequest request,
            @CookieValue(name = "refreshToken", required = false) String refreshToken) {

        // Lấy Access Token từ Header đưa vào Redis
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String accessToken = authHeader.substring(7);
            tokenBlacklistService.addToBlacklist(accessToken);
        }

        // Đưa Refresh Token vào Redis
        if (refreshToken != null && !refreshToken.isEmpty()) {
            tokenBlacklistService.addToBlacklist(refreshToken);
        }

        // Xóa Cookie ở máy Client
        ResponseCookie cleanCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0) // Hết hạn ngay lập tức
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cleanCookie.toString())
                .build();
    }
}