package com.uth.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "storage_objects")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StorageObject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String sha256;

    private String s3Key;

    private Long size;
    
    private String status = "uploading";
}
