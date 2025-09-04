package edu.juanoff.taskmanager.controller;

import edu.juanoff.taskmanager.dto.LoginRequestDTO;
import edu.juanoff.taskmanager.dto.user.UserRequestDTO;
import edu.juanoff.taskmanager.dto.user.UserResponseDTO;
import edu.juanoff.taskmanager.entity.User;
import edu.juanoff.taskmanager.security.UserDetailsImpl;
import edu.juanoff.taskmanager.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody UserRequestDTO request) {
        userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body("Пользователь успешно зарегистрирован");
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponseDTO> login(@RequestBody LoginRequestDTO loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.username(), loginRequest.password())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userService.getUserByUsername(loginRequest.username());
        return ResponseEntity.ok(UserResponseDTO.fromEntity(user));
    }

    // Сохраняем контекст в сессии вручную
    //        HttpSession session = request.getSession(true); // Создаем сессию, если её нет
    //        session.setAttribute(
    //                HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
    //                SecurityContextHolder.getContext()
    //        );

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        SecurityContextHolder.clearContext();
        request.getSession().invalidate();
        return ResponseEntity.ok("Logged out successfully");
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getCurrentUser(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userService.getUserByUsername(userDetails.username());
        return ResponseEntity.ok(UserResponseDTO.fromEntity(user));
    }
}
