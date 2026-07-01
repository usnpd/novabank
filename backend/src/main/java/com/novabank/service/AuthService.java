package com.novabank.service;

import com.novabank.payload.request.LoginRequest;
import com.novabank.payload.request.SignupRequest;
import com.novabank.payload.response.JwtResponse;

public interface AuthService {
    JwtResponse authenticateUser(LoginRequest loginRequest);
    String registerUser(SignupRequest signUpRequest);
}
