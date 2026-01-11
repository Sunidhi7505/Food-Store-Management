package com.foody.controller;

import com.foody.model.Order;
import com.foody.service.OrderService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/place")
    public Order placeOrder(Authentication auth) {
        return orderService.placeOrder(auth.getName());
    }

    @GetMapping
    public List<Order> myOrders(Authentication auth) {
        return orderService.getUserOrders(auth.getName());
    }

    @GetMapping("/admin/all")
    public List<Order> allOrders() {
        return orderService.getAllOrders();
    }

    @GetMapping("/admin/revenue")
    public double totalRevenue() {
        return orderService.getTotalRevenue();
    }
}
