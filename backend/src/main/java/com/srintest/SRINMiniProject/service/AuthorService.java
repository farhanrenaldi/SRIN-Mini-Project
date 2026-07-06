package com.srintest.SRINMiniProject.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.srintest.SRINMiniProject.dto.AuthorDtos.AuthorRequest;
import com.srintest.SRINMiniProject.dto.AuthorDtos.AuthorResponse;
import com.srintest.SRINMiniProject.dto.AuthorDtos.AuthorSummary;
import com.srintest.SRINMiniProject.dto.PageResponse;
import com.srintest.SRINMiniProject.entity.Author;
import com.srintest.SRINMiniProject.exception.ResourceNotFoundException;
import com.srintest.SRINMiniProject.repository.AuthorRepository;
import com.srintest.SRINMiniProject.repository.BookRepository;

@Service
@Transactional
public class AuthorService {

    private final AuthorRepository authorRepository;
    private final BookRepository bookRepository;

    public AuthorService(AuthorRepository authorRepository, BookRepository bookRepository) {
        this.authorRepository = authorRepository;
        this.bookRepository = bookRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<AuthorResponse> list(String search, Pageable pageable) {
        Page<Author> page = (search == null || search.isBlank())
                ? authorRepository.findAll(pageable)
                : authorRepository.findByNameOrNationality(
                        search, search, pageable);
        return PageResponse.from(page, this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<AuthorSummary> listAll() {
        return authorRepository.findAll().stream()
                .map(EntityMapper::toAuthorSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public AuthorResponse get(Long id) {
        return toResponse(findOrThrow(id));
    }

    public AuthorResponse create(AuthorRequest request) {
        Author author = new Author();
        apply(author, request);
        return toResponse(authorRepository.save(author));
    }

    public AuthorResponse update(Long id, AuthorRequest request) {
        Author author = findOrThrow(id);
        apply(author, request);
        return toResponse(authorRepository.save(author));
    }

    public void delete(Long id) {
        Author author = findOrThrow(id);
        if (bookRepository.existsByAuthorId(id)) {
            throw new IllegalArgumentException(
                    "Cannot delete author '" + author.getName() + "' because they still have books assigned.");
        }
        authorRepository.delete(author);
    }

    private Author findOrThrow(Long id) {
        return authorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Author", id));
    }

    private void apply(Author author, AuthorRequest request) {
        author.setName(request.name());
        author.setBio(request.bio());
        author.setNationality(request.nationality());
        author.setBirthYear(request.birthYear());
    }

    private AuthorResponse toResponse(Author author) {
        return EntityMapper.toAuthorResponse(author, bookRepository.countByAuthorId(author.getId()));
    }
}
