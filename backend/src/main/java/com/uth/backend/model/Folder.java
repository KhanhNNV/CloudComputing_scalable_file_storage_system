package com.uth.backend.model;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Table( name = "folders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Folder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String name;

    @ManyToOne
    @JoinColumn(name = "parent_id")
    private Folder parentFolder;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User owner;


}
