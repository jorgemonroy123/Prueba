package com.quiz.app.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.quiz.app.repository.ClubRepository;

@Controller
public class ClubControladorWeb {

    private final ClubRepository clubRepository;

    public ClubControladorWeb(ClubRepository clubRepository) {
        this.clubRepository = clubRepository;
    }

    @GetMapping("/clubes")
    public String listar(Model model) {
        try {
            model.addAttribute("clubes", clubRepository.findAll());
        } catch (Exception e) {
            model.addAttribute("error", "No se pudo consultar MongoDB: " + e.getClass().getSimpleName());
        }
        return "clubes";
    }

    @GetMapping("/clubes/{id}")
    public String detalle(@PathVariable Long id, Model model) {
        return clubRepository.findById(id)
                .map(club -> {
                    model.addAttribute("club", club);
                    return "club-detalle";
                })
                .orElse("redirect:/clubes");
    }
}
