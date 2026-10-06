package com.quiz.app.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.quiz.app.repository.CompeticionRepository;

@Controller
public class CompeticionControladorWeb {

    private final CompeticionRepository repository;

    public CompeticionControladorWeb(CompeticionRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/competiciones")
    public String listar(Model model) {
        try {
            model.addAttribute("competiciones", repository.findAll());
        } catch (Exception e) {
            model.addAttribute("error", "No se pudo consultar MongoDB: " + e.getClass().getSimpleName());
        }
        return "competiciones";
    }
}
