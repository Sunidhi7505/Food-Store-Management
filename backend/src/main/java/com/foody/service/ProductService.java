package com.foody.service;

import com.foody.model.Product;
import com.foody.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public Product create(Product product) {

        if (product.getName() == null || product.getName().isBlank()) {
            throw new RuntimeException("Product name is required");
        }

        if (product.getPrice() < 0) {
            throw new RuntimeException("Price cannot be negative");
        }

        int stock = Math.max(product.getStock(), 0);
        product.setStock(stock);
        product.setAvailable(stock > 0);


        product.setName(product.getName().trim());

        return productRepository.save(product);
    }


    public Product update(String id, Product updated) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (updated.getName() == null || updated.getName().isBlank()) {
            throw new RuntimeException("Product name is required");
        }

        product.setName(updated.getName().trim());
        product.setDescription(updated.getDescription());
        product.setPrice(updated.getPrice());
        product.setImageUrl(updated.getImageUrl());

        int stock = Math.max(updated.getStock(), 0);
        product.setStock(stock);
        product.setAvailable(stock > 0);

        return productRepository.save(product);
    }

    public void delete(String id) {
        productRepository.deleteById(id);
    }


    public List<Product> getAll() {
        return productRepository.findAll();
    }

    public Product getById(String id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }


    public synchronized void reduceStock(String productId, int quantity) {

        if (quantity <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.isAvailable() || product.getStock() <= 0) {
            throw new RuntimeException(product.getName() + " is out of stock");
        }

        if (product.getStock() < quantity) {
            throw new RuntimeException(
                    "Only " + product.getStock() + " item(s) left for " + product.getName()
            );
        }

        product.setStock(product.getStock() - quantity);
        product.setAvailable(product.getStock() > 0);

        productRepository.save(product);
    }


    public List<Product> searchFilterSort(
            String keyword,
            Boolean available,
            Double minPrice,
            Double maxPrice,
            String sortBy,
            String direction
    ) {
        List<Product> products;

        if (keyword != null && !keyword.isBlank()) {
            products = productRepository.findByNameContainingIgnoreCase(keyword);
        } else {
            products = productRepository.findAll();
        }

        if (available != null) {
            products = products.stream()
                    .filter(p -> p.isAvailable() == available)
                    .toList();
        }

        if (minPrice != null) {
            products = products.stream()
                    .filter(p -> p.getPrice() >= minPrice)
                    .toList();
        }

        if (maxPrice != null) {
            products = products.stream()
                    .filter(p -> p.getPrice() <= maxPrice)
                    .toList();
        }

        if (sortBy != null) {
            switch (sortBy) {
                case "price" -> products = products.stream()
                        .sorted(direction != null && direction.equalsIgnoreCase("desc")
                                ? Comparator.comparing(Product::getPrice).reversed()
                                : Comparator.comparing(Product::getPrice))
                        .toList();
                case "name" -> products = products.stream()
                        .sorted(direction != null && direction.equalsIgnoreCase("desc")
                                ? Comparator.comparing(Product::getName).reversed()
                                : Comparator.comparing(Product::getName))
                        .toList();
            }
        }

        return products;
    }
}
