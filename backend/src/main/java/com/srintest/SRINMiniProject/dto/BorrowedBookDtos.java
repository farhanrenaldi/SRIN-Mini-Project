package com.srintest.SRINMiniProject.dto;

import java.time.LocalDate;

import com.srintest.SRINMiniProject.dto.BookDtos.BookSummary;
import com.srintest.SRINMiniProject.dto.MemberDtos.MemberSummary;
import com.srintest.SRINMiniProject.entity.BorrowStatus;

import jakarta.validation.constraints.NotNull;

public final class BorrowedBookDtos {

    private BorrowedBookDtos() {
    }

    public record BorrowedBookRequest(
            @NotNull(message = "Book is required")
            Long bookId,

            @NotNull(message = "Member is required")
            Long memberId,

            @NotNull(message = "Borrow date is required")
            LocalDate borrowDate,

            LocalDate dueDate,

            LocalDate returnDate,

            BorrowStatus status) {
    }

    public record BorrowedBookResponse(
            Long id,
            BookSummary book,
            MemberSummary member,
            LocalDate borrowDate,
            LocalDate dueDate,
            LocalDate returnDate,
            BorrowStatus status) {
    }
}
