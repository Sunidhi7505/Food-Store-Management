package com.foody.controller;

import com.foody.dto.ReviewRequest;
import com.foody.model.Review;
import com.foody.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping("/{productId}")
    public Review addReview(
            @PathVariable String productId,
            @Valid @RequestBody ReviewRequest request,
            Authentication auth
    ) {
        return reviewService.addReview(
                auth.getName(),
                productId,
                request.getRating(),
                request.getComment()
        );
    }

    @GetMapping("/{productId}")
    public List<Review> getReviews(@PathVariable String productId) {
        return reviewService.getReviews(productId);
    }
}
