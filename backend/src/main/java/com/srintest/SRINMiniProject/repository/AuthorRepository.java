package com.srintest.SRINMiniProject.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.srintest.SRINMiniProject.entity.Author;
import org.springframework.data.jpa.repository.Query;

public interface AuthorRepository extends JpaRepository<Author, Long> {

    @Query("""
        SELECT a 
        FROM Author a 
        WHERE lower(a.name) LIKE lower(CONCAT('%', :name, '%')) 
            OR lower(a.nationality) LIKE lower(CONCAT('%', :nationality, '%'))
    """)
    Page<Author> findByNameOrNationality(
        String name,
        String nationality,
        Pageable pageable
    );
}
