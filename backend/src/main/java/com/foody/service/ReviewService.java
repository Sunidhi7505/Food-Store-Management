package com.foody.service;

import com.foody.model.Order;
import com.foody.model.Review;
import com.foody.repository.OrderRepository;
import com.foody.repository.ReviewRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;

    public ReviewService(ReviewRepository reviewRepository,
                         OrderRepository orderRepository) {
        this.reviewRepository = reviewRepository;
        this.orderRepository = orderRepository;
    }

    public Review addReview(
            String email,
            String productId,
            int rating,
            String comment
    ) {


        reviewRepository.findByProductIdAndUserEmail(productId, email)
                .ifPresent(r -> {
                    throw new RuntimeException("You already reviewed this product");
                });


        List<Order> orders = orderRepository.findByUserEmail(email);

        boolean hasOrdered = orders.stream()
                .flatMap(order -> order.getItems().stream())
                .anyMatch(item -> item.getProductId().equals(productId));

        if (!hasOrdered) {
            throw new RuntimeException("You can review only products you ordered");
        }

        Review review = new Review();
        review.setProductId(productId);
        review.setUserEmail(email);
        review.setRating(rating);
        review.setComment(comment);

        return reviewRepository.save(review);
    }

    public List<Review> getReviews(String productId) {
        return reviewRepository.findByProductId(productId);
    }
}
