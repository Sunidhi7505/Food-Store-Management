package com.foody.service;

import com.foody.dto.RegisterRequest;
import com.foody.model.User;
import com.foody.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public String registerUser(RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());

   
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        user.setPhone(request.getPhone());


        user.setRole("ROLE_CUSTOMER");

        userRepository.save(user);

        return "User registered successfully";
    }
}
