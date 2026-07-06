package com.srintest.SRINMiniProject.service;

import java.time.LocalDate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.srintest.SRINMiniProject.dto.BorrowedBookDtos.BorrowedBookRequest;
import com.srintest.SRINMiniProject.dto.BorrowedBookDtos.BorrowedBookResponse;
import com.srintest.SRINMiniProject.dto.PageResponse;
import com.srintest.SRINMiniProject.entity.Book;
import com.srintest.SRINMiniProject.entity.BorrowStatus;
import com.srintest.SRINMiniProject.entity.BorrowedBook;
import com.srintest.SRINMiniProject.entity.Member;
import com.srintest.SRINMiniProject.exception.ResourceNotFoundException;
import com.srintest.SRINMiniProject.repository.BookRepository;
import com.srintest.SRINMiniProject.repository.BorrowedBookRepository;
import com.srintest.SRINMiniProject.repository.MemberRepository;

@Service
@Transactional
public class BorrowedBookService {

    private final BorrowedBookRepository borrowedBookRepository;
    private final BookRepository bookRepository;
    private final MemberRepository memberRepository;

    public BorrowedBookService(
        BorrowedBookRepository borrowedBookRepository,
        BookRepository bookRepository,
        MemberRepository memberRepository
    ) {
        this.borrowedBookRepository = borrowedBookRepository;
        this.bookRepository = bookRepository;
        this.memberRepository = memberRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<BorrowedBookResponse> list(String search, LocalDate borrowDate, Pageable pageable) {
        String normalized = (search == null || search.isBlank()) ? "" : search.trim();
        Page<BorrowedBook> page = (borrowDate == null)
                ? borrowedBookRepository.search(normalized, pageable)
                : borrowedBookRepository.searchByDate(normalized, borrowDate, pageable);
        return PageResponse.from(page, EntityMapper::toBorrowedBookResponse);
    }

    @Transactional(readOnly = true)
    public BorrowedBookResponse get(Long id) {
        return EntityMapper.toBorrowedBookResponse(findOrThrow(id));
    }

    public BorrowedBookResponse create(BorrowedBookRequest request) {
        BorrowedBook borrowedBook = new BorrowedBook();
        apply(borrowedBook, request);
        return EntityMapper.toBorrowedBookResponse(borrowedBookRepository.save(borrowedBook));
    }

    public BorrowedBookResponse update(Long id, BorrowedBookRequest request) {
        BorrowedBook borrowedBook = findOrThrow(id);
        apply(borrowedBook, request);
        return EntityMapper.toBorrowedBookResponse(borrowedBookRepository.save(borrowedBook));
    }

    public void delete(Long id) {
        borrowedBookRepository.delete(findOrThrow(id));
    }

    private BorrowedBook findOrThrow(Long id) {
        return borrowedBookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Borrowed book", id));
    }

    private void apply(BorrowedBook borrowedBook, BorrowedBookRequest request) {
        Book book = bookRepository.findById(request.bookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book", request.bookId()));
        Member member = memberRepository.findById(request.memberId())
                .orElseThrow(() -> new ResourceNotFoundException("Member", request.memberId()));

        borrowedBook.setBook(book);
        borrowedBook.setMember(member);
        borrowedBook.setBorrowDate(request.borrowDate());
        borrowedBook.setDueDate(request.dueDate());
        borrowedBook.setReturnDate(request.returnDate());
        borrowedBook.setStatus(resolveStatus(request));
    }

    /** Derive a sensible status when the client does not send one explicitly. */
    private BorrowStatus resolveStatus(BorrowedBookRequest request) {
        if (request.status() != null) {
            return request.status();
        }
        if (request.returnDate() != null) {
            return BorrowStatus.RETURNED;
        }
        if (request.dueDate() != null && request.dueDate().isBefore(LocalDate.now())) {
            return BorrowStatus.OVERDUE;
        }
        return BorrowStatus.BORROWED;
    }
}
