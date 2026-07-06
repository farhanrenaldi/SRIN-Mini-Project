package com.srintest.SRINMiniProject.dto;

import com.srintest.SRINMiniProject.dto.AuthorDtos.AuthorSummary;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public final class BookDtos {
	
	private BookDtos() { }
	
	public record BookRequest(
		@NotBlank(message = "Title is required")
		@Size(max = 255, message = "Title must be at most 255 characters")
		String title,

		String category,

		Integer publishingYear,

		@Size(max = 32, message = "ISBN must be at most 32 characters")
		String isbn,

		@NotNull(message = "Author is required")
		Long authorId
	) { }
		
	public record BookResponse(
		Long id,
		String title,
		String category,
		Integer publishingYear,
		String isbn,
		AuthorSummary author
	) { }
		
	/** Compact book reference used when embedding inside other resources. */
	public record BookSummary(Long id, String title) 
	{ }
}
