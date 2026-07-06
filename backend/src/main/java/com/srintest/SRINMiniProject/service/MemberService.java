package com.srintest.SRINMiniProject.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.srintest.SRINMiniProject.dto.MemberDtos.MemberRequest;
import com.srintest.SRINMiniProject.dto.MemberDtos.MemberResponse;
import com.srintest.SRINMiniProject.dto.MemberDtos.MemberSummary;
import com.srintest.SRINMiniProject.dto.MemberDtos.MemberWithBorrowedResponse;
import com.srintest.SRINMiniProject.dto.PageResponse;
import com.srintest.SRINMiniProject.dto.BorrowedBookDtos.BorrowedBookResponse;
import com.srintest.SRINMiniProject.entity.Member;
import com.srintest.SRINMiniProject.exception.ResourceNotFoundException;
import com.srintest.SRINMiniProject.repository.BorrowedBookRepository;
import com.srintest.SRINMiniProject.repository.MemberRepository;

@Service
@Transactional
public class MemberService {

    private final MemberRepository memberRepository;
    private final BorrowedBookRepository borrowedBookRepository;

    public MemberService(MemberRepository memberRepository, BorrowedBookRepository borrowedBookRepository) {
        this.memberRepository = memberRepository;
        this.borrowedBookRepository = borrowedBookRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<MemberResponse> list(String search, Pageable pageable) {
        Page<Member> page = (search == null || search.isBlank())
                ? memberRepository.findAll(pageable)
                : memberRepository.findByNameOrEmail(
                        search, search, pageable);
        return PageResponse.from(page, this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<MemberSummary> listAll() {
        return memberRepository.findAll().stream()
                .map(EntityMapper::toMemberSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public MemberResponse get(Long id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional(readOnly = true)
    public MemberWithBorrowedResponse getWithBorrowedBooks(Long id) {
        Member member = findOrThrow(id);
        List<BorrowedBookResponse> borrowed =
                borrowedBookRepository.findByMemberIdOrderByBorrowDateDesc(id).stream()
                        .map(EntityMapper::toBorrowedBookResponse)
                        .toList();
        return new MemberWithBorrowedResponse(
                member.getId(),
                member.getName(),
                member.getEmail(),
                member.getPhone(),
                member.getAddress(),
                member.getMembershipDate(),
                borrowed);
    }

    public MemberResponse create(MemberRequest request) {
        Member member = new Member();
        apply(member, request);
        if (member.getMembershipDate() == null) {
            member.setMembershipDate(LocalDate.now());
        }
        return toResponse(memberRepository.save(member));
    }

    public MemberResponse update(Long id, MemberRequest request) {
        Member member = findOrThrow(id);
        apply(member, request);
        return toResponse(memberRepository.save(member));
    }

    public void delete(Long id) {
        Member member = findOrThrow(id);
        if (borrowedBookRepository.existsByMemberId(id)) {
            throw new IllegalArgumentException(
                    "Cannot delete member '" + member.getName() + "' because they have borrow records.");
        }
        memberRepository.delete(member);
    }

    private Member findOrThrow(Long id) {
        return memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member", id));
    }

    private void apply(Member member, MemberRequest request) {
        member.setName(request.name());
        member.setEmail(request.email());
        member.setPhone(request.phone());
        member.setAddress(request.address());
        if (request.membershipDate() != null) {
            member.setMembershipDate(request.membershipDate());
        }
    }

    private MemberResponse toResponse(Member member) {
        long count = borrowedBookRepository.findByMemberIdOrderByBorrowDateDesc(member.getId()).size();
        return EntityMapper.toMemberResponse(member, count);
    }
}
