package com.uth.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "storage_objects")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StorageObject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String sha256;

    @Column(unique = true, nullable = false)
    private String s3Key;

    @Column(nullable = false)
    private Long size;

    @Column(nullable = false)
    private String mimeType;

    @Builder.Default
    private String status = "uploading";

    private String thumbnailS3Key;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
