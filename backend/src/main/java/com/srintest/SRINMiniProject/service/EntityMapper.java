package com.srintest.SRINMiniProject.service;

import com.srintest.SRINMiniProject.dto.AuthorDtos.AuthorResponse;
import com.srintest.SRINMiniProject.dto.AuthorDtos.AuthorSummary;
import com.srintest.SRINMiniProject.dto.BookDtos.BookResponse;
import com.srintest.SRINMiniProject.dto.BookDtos.BookSummary;
import com.srintest.SRINMiniProject.dto.BorrowedBookDtos.BorrowedBookResponse;
import com.srintest.SRINMiniProject.dto.MemberDtos.MemberResponse;
import com.srintest.SRINMiniProject.dto.MemberDtos.MemberSummary;
import com.srintest.SRINMiniProject.entity.Author;
import com.srintest.SRINMiniProject.entity.Book;
import com.srintest.SRINMiniProject.entity.BorrowedBook;
import com.srintest.SRINMiniProject.entity.Member;

public final class EntityMapper {

    private EntityMapper() {
    }

    public static AuthorSummary toAuthorSummary(Author author) {
        return new AuthorSummary(author.getId(), author.getName());
    }

    public static AuthorResponse toAuthorResponse(Author author, long bookCount) {
        return new AuthorResponse(
                author.getId(),
                author.getName(),
                author.getBio(),
                author.getNationality(),
                author.getBirthYear(),
                bookCount);
    }

    public static BookSummary toBookSummary(Book book) {
        return new BookSummary(book.getId(), book.getTitle());
    }

    public static BookResponse toBookResponse(Book book) {
        return new BookResponse(
                book.getId(),
                book.getTitle(),
                book.getCategory(),
                book.getPublishingYear(),
                book.getIsbn(),
                toAuthorSummary(book.getAuthor()));
    }

    public static MemberSummary toMemberSummary(Member member) {
        return new MemberSummary(member.getId(), member.getName());
    }

    public static MemberResponse toMemberResponse(Member member, long borrowedCount) {
        return new MemberResponse(
                member.getId(),
                member.getName(),
                member.getEmail(),
                member.getPhone(),
                member.getAddress(),
                member.getMembershipDate(),
                borrowedCount);
    }

    public static BorrowedBookResponse toBorrowedBookResponse(BorrowedBook borrowedBook) {
        return new BorrowedBookResponse(
                borrowedBook.getId(),
                toBookSummary(borrowedBook.getBook()),
                toMemberSummary(borrowedBook.getMember()),
                borrowedBook.getBorrowDate(),
                borrowedBook.getDueDate(),
                borrowedBook.getReturnDate(),
                borrowedBook.getStatus());
    }
}
