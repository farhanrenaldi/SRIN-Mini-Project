package com.srintest.SRINMiniProject.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.srintest.SRINMiniProject.entity.Book;

public interface BookRepository extends JpaRepository<Book, Long> {

    @Query("""
            SELECT b FROM Book b
            WHERE LOWER(b.title) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(b.category) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(b.isbn) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(b.author.name) LIKE LOWER(CONCAT('%', :search, '%'))
            """)
    Page<Book> search(@Param("search") String search, Pageable pageable);

    long countByAuthorId(Long authorId);

    boolean existsByAuthorId(Long authorId);
}
