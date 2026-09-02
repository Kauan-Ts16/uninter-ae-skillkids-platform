package com.kauanrodrigues.backend.model;

import com.kauanrodrigues.backend.enums.ExerciseDifficulty;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "tb_exercises", uniqueConstraints = @UniqueConstraint(columnNames = {"course_id", "sequence"}))
public class ExerciseModel {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "exercise_id")
    private UUID id;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ExerciseDifficulty difficulty;

    @Column(nullable = false)
    private Integer sequence;

    @ElementCollection
    @CollectionTable(
            name = "tb_exercise_options",
            joinColumns = @JoinColumn(name = "exercise_id")
    )
    @OrderColumn(name = "option_index")
    @Column(name = "option", nullable = false)
    private List<String> options;

    @Column(nullable = false)
    private Integer correctOptionIndex;

    @Column(nullable = false)
    private boolean active = true;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private CourseModel course;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

}
