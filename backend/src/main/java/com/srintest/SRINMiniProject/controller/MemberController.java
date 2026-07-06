package com.srintest.SRINMiniProject.controller;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
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

import com.srintest.SRINMiniProject.dto.MemberDtos.MemberRequest;
import com.srintest.SRINMiniProject.dto.MemberDtos.MemberResponse;
import com.srintest.SRINMiniProject.dto.MemberDtos.MemberSummary;
import com.srintest.SRINMiniProject.dto.MemberDtos.MemberWithBorrowedResponse;
import com.srintest.SRINMiniProject.dto.PageResponse;
import com.srintest.SRINMiniProject.service.MemberService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/members")
public class MemberController {

    private final MemberService memberService;

    public MemberController(MemberService memberService) {
        this.memberService = memberService;
    }

    @GetMapping
    public PageResponse<MemberResponse> list(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 10, sort = "name") Pageable pageable) {
        return memberService.list(search, pageable);
    }

    @GetMapping("/all")
    public List<MemberSummary> listAll() {
        return memberService.listAll();
    }

    @GetMapping("/{id}")
    public MemberResponse get(@PathVariable Long id) {
        return memberService.get(id);
    }

    @GetMapping("/{id}/borrowed-books")
    public MemberWithBorrowedResponse getWithBorrowedBooks(@PathVariable Long id) {
        return memberService.getWithBorrowedBooks(id);
    }

    @PostMapping
    public ResponseEntity<MemberResponse> create(@Valid @RequestBody MemberRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(memberService.create(request));
    }

    @PutMapping("/{id}")
    public MemberResponse update(@PathVariable Long id, @Valid @RequestBody MemberRequest request) {
        return memberService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        memberService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
