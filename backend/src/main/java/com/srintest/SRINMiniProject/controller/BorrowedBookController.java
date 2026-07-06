package com.srintest.SRINMiniProject.controller;

import java.time.LocalDate;

import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.srintest.SRINMiniProject.dto.BorrowedBookDtos.BorrowedBookRequest;
import com.srintest.SRINMiniProject.dto.BorrowedBookDtos.BorrowedBookResponse;
import com.srintest.SRINMiniProject.dto.PageResponse;
import com.srintest.SRINMiniProject.service.BorrowedBookService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/borrowed-books")
public class BorrowedBookController {

    private final BorrowedBookService borrowedBookService;

    public BorrowedBookController(BorrowedBookService borrowedBookService) {
        this.borrowedBookService = borrowedBookService;
    }

    @GetMapping
    public PageResponse<BorrowedBookResponse> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate borrowDate,
            @PageableDefault(size = 10, sort = "borrowDate") Pageable pageable) {
        return borrowedBookService.list(search, borrowDate, pageable);
    }

    @GetMapping("/{id}")
    public BorrowedBookResponse get(@PathVariable Long id) {
        return borrowedBookService.get(id);
    }

    @PostMapping
    public ResponseEntity<BorrowedBookResponse> create(@Valid @RequestBody BorrowedBookRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(borrowedBookService.create(request));
    }

    @PutMapping("/{id}")
    public BorrowedBookResponse update(@PathVariable Long id, @Valid @RequestBody BorrowedBookRequest request) {
        return borrowedBookService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        borrowedBookService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
