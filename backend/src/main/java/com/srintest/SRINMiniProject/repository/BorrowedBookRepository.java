package com.srintest.SRINMiniProject.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.srintest.SRINMiniProject.entity.BorrowedBook;

public interface BorrowedBookRepository extends JpaRepository<BorrowedBook, Long> {
	@Query("""
		SELECT bb FROM BorrowedBook bb
		WHERE LOWER(bb.book.title) LIKE LOWER(CONCAT('%', :search, '%'))
			OR LOWER(bb.member.name) LIKE LOWER(CONCAT('%', :search, '%'))
		""")
	Page<BorrowedBook> search(@Param("search") String search, Pageable pageable);
		
	@Query("""
		SELECT bb FROM BorrowedBook bb
		WHERE (LOWER(bb.book.title) LIKE LOWER(CONCAT('%', :search, '%'))
		OR LOWER(bb.member.name) LIKE LOWER(CONCAT('%', :search, '%')))
		AND bb.borrowDate = :borrowDate
	""")
	Page<BorrowedBook> searchByDate(
		@Param("search") String search,
		@Param("borrowDate") LocalDate borrowDate,
		Pageable pageable
	);
		
	List<BorrowedBook> findByMemberIdOrderByBorrowDateDesc(Long memberId);
	
	boolean existsByBookId(Long bookId);
	
	boolean existsByMemberId(Long memberId);
}
