package com.srintest.SRINMiniProject.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.srintest.SRINMiniProject.dto.BookDtos.BookRequest;
import com.srintest.SRINMiniProject.dto.BookDtos.BookResponse;
import com.srintest.SRINMiniProject.dto.BookDtos.BookSummary;
import com.srintest.SRINMiniProject.dto.PageResponse;
import com.srintest.SRINMiniProject.entity.Author;
import com.srintest.SRINMiniProject.entity.Book;
import com.srintest.SRINMiniProject.exception.ResourceNotFoundException;
import com.srintest.SRINMiniProject.repository.AuthorRepository;
import com.srintest.SRINMiniProject.repository.BookRepository;
import com.srintest.SRINMiniProject.repository.BorrowedBookRepository;

@Service
@Transactional
public class BookService {
    
    private final BookRepository bookRepository;
    private final AuthorRepository authorRepository;
    private final BorrowedBookRepository borrowedBookRepository;
    
    public BookService(
        BookRepository bookRepository,
        AuthorRepository authorRepository,
        BorrowedBookRepository borrowedBookRepository
    ) {
        this.bookRepository = bookRepository;
        this.authorRepository = authorRepository;
        this.borrowedBookRepository = borrowedBookRepository;
    }
        
    @Transactional(readOnly = true)
    public PageResponse<BookResponse> list(String search, Pageable pageable) {
        Page<Book> page = (search == null || search.isBlank())
        ? bookRepository.findAll(pageable)
        : bookRepository.search(search, pageable);
        return PageResponse.from(page, EntityMapper::toBookResponse);
    }
    
    @Transactional(readOnly = true)
    public List<BookSummary> listAll() {
        return bookRepository.findAll().stream()
        .map(EntityMapper::toBookSummary)
        .toList();
    }

    @Transactional(readOnly = true)
    public BookResponse get(Long id) {
        return EntityMapper.toBookResponse(findOrThrow(id));
    }
    
    public BookResponse create(BookRequest request) {
        Book book = new Book();
        apply(book, request);
        return EntityMapper.toBookResponse(bookRepository.save(book));
    }

    public BookResponse update(Long id, BookRequest request) {
        Book book = findOrThrow(id);
        apply(book, request);
        return EntityMapper.toBookResponse(bookRepository.save(book));
    }

    public void delete(Long id) {
        Book book = findOrThrow(id);
        if (borrowedBookRepository.existsByBookId(id)) {
            throw new IllegalArgumentException("Cannot delete book '" + book.getTitle() + "' because it has borrow records.");
        }
        bookRepository.delete(book);
    }

    private Book findOrThrow(Long id) {
        return bookRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Book", id));
    }

    private void apply(Book book, BookRequest request) {
        Author author = authorRepository.findById(request.authorId())
        .orElseThrow(() -> new ResourceNotFoundException("Author", request.authorId()));
        book.setTitle(request.title());
        book.setCategory(request.category());
        book.setPublishingYear(request.publishingYear());
        book.setIsbn(request.isbn() == null || request.isbn().isBlank() ? null : request.isbn());
        book.setAuthor(author);
    }
}
