package com.foody.controller;

import com.foody.service.OrderService;
import com.foody.service.ProductService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final OrderService orderService;
    private final ProductService productService;

    public AdminController(OrderService orderService,
                           ProductService productService) {
        this.orderService = orderService;
        this.productService = productService;
    }

    @GetMapping("/dashboard")
    public Map<String, Object> dashboardStats() {

        return Map.of(
                "totalRevenue", orderService.getTotalRevenue(),
                "totalOrders", orderService.getAllOrders().size(),
                "totalProducts", productService.getAll().size()
        );
    }
}
