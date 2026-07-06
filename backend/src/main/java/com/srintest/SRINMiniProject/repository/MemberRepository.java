package com.srintest.SRINMiniProject.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.srintest.SRINMiniProject.entity.Member;
import org.springframework.data.jpa.repository.Query;

public interface MemberRepository extends JpaRepository<Member, Long> {

    @Query("""
        SELECT m 
        FROM Member m 
        WHERE lower(m.name) LIKE lower(CONCAT('%', :name, '%')) 
            OR lower(m.email) LIKE lower(CONCAT('%', :email, '%'))
    """)
    Page<Member> findByNameOrEmail(
            String name, String email, Pageable pageable);

    boolean existsByEmail(String email);
}
