package com.srintest.SRINMiniProject.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AuthorDtos {
	
	private AuthorDtos() { }
	
	public record AuthorRequest(
		@NotBlank(message = "Name is required")
		@Size(max = 255, message = "Name must be at most 255 characters")
		String name,
		
		@Size(max = 2000, message = "Bio must be at most 2000 characters")
		String bio,
		
		String nationality,
		Integer birthYear
	) { }
		
	public record AuthorResponse(
		Long id,
		String name,
		String bio,
		String nationality,
		Integer birthYear,
		long bookCount
	) { }

	public record AuthorSummary(Long id, String name) { }
}
