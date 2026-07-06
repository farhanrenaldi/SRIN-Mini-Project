package com.srintest.SRINMiniProject.config;

import java.time.LocalDate;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import com.srintest.SRINMiniProject.entity.Author;
import com.srintest.SRINMiniProject.entity.Book;
import com.srintest.SRINMiniProject.entity.BorrowStatus;
import com.srintest.SRINMiniProject.entity.BorrowedBook;
import com.srintest.SRINMiniProject.entity.Member;
import com.srintest.SRINMiniProject.repository.AuthorRepository;
import com.srintest.SRINMiniProject.repository.BookRepository;
import com.srintest.SRINMiniProject.repository.BorrowedBookRepository;
import com.srintest.SRINMiniProject.repository.MemberRepository;

/**
 * Seeds demo library data on startup when the database is empty.
 * Disabled under the "test" profile.
 */
@Component
@Profile("!test")
public class DataSeeder implements CommandLineRunner {

    private final AuthorRepository authorRepository;
    private final BookRepository bookRepository;
    private final MemberRepository memberRepository;
    private final BorrowedBookRepository borrowedBookRepository;

    public DataSeeder(AuthorRepository authorRepository,
                      BookRepository bookRepository,
                      MemberRepository memberRepository,
                      BorrowedBookRepository borrowedBookRepository) {
        this.authorRepository = authorRepository;
        this.bookRepository = bookRepository;
        this.memberRepository = memberRepository;
        this.borrowedBookRepository = borrowedBookRepository;
    }

    @Override
    public void run(String... args) {
        if (authorRepository.count() > 0) {
            return;
        }

        Author fitzgerald = new Author("F. Scott Fitzgerald",
                "American novelist widely regarded as one of the greatest American writers of the 20th century.",
                "American", 1896);
        Author orwell = new Author("George Orwell",
                "English novelist, essayist and critic, famous for Animal Farm and Nineteen Eighty-Four.",
                "British", 1903);
        Author austen = new Author("Jane Austen",
                "English novelist known primarily for her six major novels of the landed gentry.",
                "British", 1775);
        Author tolkien = new Author("J.R.R. Tolkien",
                "English writer and philologist, author of the high-fantasy works The Hobbit and The Lord of the Rings.",
                "British", 1892);
        Author marquez = new Author("Gabriel García Márquez",
                "Colombian novelist and Nobel laureate, a leading figure of magical realism.",
                "Colombian", 1927);
        authorRepository.saveAll(List.of(fitzgerald, orwell, austen, tolkien, marquez));

        Book gatsby = new Book("The Great Gatsby", "Fiction", 1925, "9780743273565", fitzgerald);
        Book tender = new Book("Tender Is the Night", "Fiction", 1934, "9780684801544", fitzgerald);
        Book nineteen = new Book("1984", "Dystopian", 1949, "9780451524935", orwell);
        Book animalFarm = new Book("Animal Farm", "Satire", 1945, "9780451526342", orwell);
        Book pride = new Book("Pride and Prejudice", "Romance", 1813, "9780141439518", austen);
        Book hobbit = new Book("The Hobbit", "Fantasy", 1937, "9780547928227", tolkien);
        Book lotr = new Book("The Lord of the Rings", "Fantasy", 1954, "9780618640157", tolkien);
        Book solitude = new Book("One Hundred Years of Solitude", "Magical Realism", 1967, "9780060883287", marquez);
        bookRepository.saveAll(List.of(gatsby, tender, nineteen, animalFarm, pride, hobbit, lotr, solitude));

        Member jack = new Member("Jack Thompson", "jack@email.com", "+1-202-555-0143",
                "12 Maple Street, Springfield", LocalDate.of(2023, 1, 15));
        Member emily = new Member("Emily Carter", "emily.carter@email.com", "+1-202-555-0167",
                "45 Oak Avenue, Riverdale", LocalDate.of(2023, 3, 22));
        Member liam = new Member("Liam Nguyen", "liam.nguyen@email.com", "+1-202-555-0198",
                "78 Pine Road, Lakeside", LocalDate.of(2024, 6, 5));
        Member sophia = new Member("Sophia Martinez", "sophia.m@email.com", "+1-202-555-0110",
                "9 Birch Lane, Hillcrest", LocalDate.of(2024, 9, 30));
        memberRepository.saveAll(List.of(jack, emily, liam, sophia));

        LocalDate today = LocalDate.now();
        borrowedBookRepository.saveAll(List.of(
                new BorrowedBook(gatsby, jack, today.minusDays(10), today.plusDays(4), null, BorrowStatus.BORROWED),
                new BorrowedBook(nineteen, jack, today.minusDays(40), today.minusDays(26),
                        today.minusDays(28), BorrowStatus.RETURNED),
                new BorrowedBook(hobbit, emily, today.minusDays(20), today.minusDays(6), null, BorrowStatus.OVERDUE),
                new BorrowedBook(pride, emily, today.minusDays(5), today.plusDays(9), null, BorrowStatus.BORROWED),
                new BorrowedBook(solitude, liam, today.minusDays(2), today.plusDays(12), null, BorrowStatus.BORROWED),
                new BorrowedBook(animalFarm, sophia, today.minusDays(60), today.minusDays(46),
                        today.minusDays(50), BorrowStatus.RETURNED),
                new BorrowedBook(lotr, sophia, today.minusDays(1), today.plusDays(13), null, BorrowStatus.BORROWED)));
    }
}
