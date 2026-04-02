package com.uth.backend.model;


import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table( name = "folders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Folder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    
    @Builder.Default
    private boolean isDeleted = false;

    @ManyToOne
    @JoinColumn(name = "parent_id")
    private Folder parentFolder;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User owner;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;


}
