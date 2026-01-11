package com.foody.service;

import com.foody.model.Cart;
import com.foody.model.CartItem;
import com.foody.model.Order;
import com.foody.model.Product;
import com.foody.repository.CartRepository;
import com.foody.repository.OrderRepository;
import com.foody.repository.ProductRepository;
import org.springframework.stereotype.Service;
import com.foody.model.OrderStatus;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository,
                        CartRepository cartRepository,
                        ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
    }

    public synchronized Order placeOrder(String email) {

        Cart cart = cartRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Cart is empty"));

        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        List<Product> productsToUpdate = new ArrayList<>();

        for (CartItem item : cart.getItems()) {

            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            if (!product.isAvailable() || product.getStock() <= 0) {
                throw new RuntimeException(product.getName() + " is out of stock");
            }

            if (product.getStock() < item.getQuantity()) {
                throw new RuntimeException(
                        "Only " + product.getStock() + " item(s) left for " + product.getName()
                );
            }

            productsToUpdate.add(product);
        }

        for (int i = 0; i < productsToUpdate.size(); i++) {
            Product product = productsToUpdate.get(i);
            CartItem item = cart.getItems().get(i);

            product.setStock(product.getStock() - item.getQuantity());
            product.setAvailable(product.getStock() > 0);
            productRepository.save(product);
        }

        List<CartItem> orderItems = new ArrayList<>();
        double totalAmount = 0;

        for (CartItem item : cart.getItems()) {
            CartItem snapshot = new CartItem();
            snapshot.setProductId(item.getProductId());
            snapshot.setName(item.getName());
            snapshot.setPrice(item.getPrice());
            snapshot.setQuantity(item.getQuantity());

            orderItems.add(snapshot);
            totalAmount += snapshot.getTotalPrice();
        }

        Order order = new Order();
        order.setUserEmail(email);
        order.setItems(orderItems);
        order.setTotalAmount(totalAmount);
        order.setOrderTime(LocalDateTime.now());
        order.setStatus(OrderStatus.PLACED);

        cartRepository.delete(cart);

        return orderRepository.save(order);
    }

    public List<Order> getUserOrders(String email) {
        return orderRepository.findByUserEmail(email);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public double getTotalRevenue() {
        return orderRepository.findAll()
                .stream()
                .mapToDouble(Order::getTotalAmount)
                .sum();
    }


public Order updateOrderStatus(String orderId) {

    Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));

    if (order.getStatus() == OrderStatus.DELIVERED) {
        throw new RuntimeException("Order already delivered");
    }

    order.setStatus(OrderStatus.DELIVERED);
    return orderRepository.save(order);
}

}
