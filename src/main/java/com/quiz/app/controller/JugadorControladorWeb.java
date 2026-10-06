package com.quiz.app.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.quiz.app.repository.JugadorRepository;

@Controller
public class JugadorControladorWeb {

    private final JugadorRepository repository;

    public JugadorControladorWeb(JugadorRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/jugadores")
    public String listar(Model model) {
        try {
            model.addAttribute("jugadores", repository.findAll());
        } catch (Exception e) {
            model.addAttribute("error", "No se pudo consultar MongoDB: " + e.getClass().getSimpleName());
        }
        return "jugadores";
    }
}
