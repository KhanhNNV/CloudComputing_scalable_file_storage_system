package com.uth.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "files")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class File {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String displayName;

    @ManyToOne
    @JoinColumn(name = "folder_id")
    private Folder folder;

    @ManyToOne
    @JoinColumn(name = "storage_object_id")
    private StorageObject storageObject; // Trỏ tới file vật lý thực tế

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User owner;
}
