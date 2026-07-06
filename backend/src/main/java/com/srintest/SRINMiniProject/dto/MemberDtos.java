package com.srintest.SRINMiniProject.dto;

import java.time.LocalDate;
import java.util.List;

import com.srintest.SRINMiniProject.dto.BorrowedBookDtos.BorrowedBookResponse;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class MemberDtos {

    private MemberDtos() {
    }

    public record MemberRequest(
            @NotBlank(message = "Name is required")
            @Size(max = 255, message = "Name must be at most 255 characters")
            String name,

            @NotBlank(message = "Email is required")
            @Email(message = "Email must be valid")
            String email,

            String phone,

            String address,

            LocalDate membershipDate) {
    }

    public record MemberResponse(
            Long id,
            String name,
            String email,
            String phone,
            String address,
            LocalDate membershipDate,
            long borrowedCount) {
    }

    /** Compact member reference used when embedding inside other resources. */
    public record MemberSummary(Long id, String name) {
    }

    /** A member together with the books they have borrowed. */
    public record MemberWithBorrowedResponse(
            Long id,
            String name,
            String email,
            String phone,
            String address,
            LocalDate membershipDate,
            List<BorrowedBookResponse> borrowedBooks) {
    }
}
