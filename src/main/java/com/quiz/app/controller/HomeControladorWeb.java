package com.quiz.app.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.quiz.app.repository.AsociacionRepository;
import com.quiz.app.repository.ClubRepository;
import com.quiz.app.repository.CompeticionRepository;
import com.quiz.app.repository.EntrenadorRepository;
import com.quiz.app.repository.JugadorRepository;

@Controller
public class HomeControladorWeb {

    private final ClubRepository clubRepository;
    private final EntrenadorRepository entrenadorRepository;
    private final JugadorRepository jugadorRepository;
    private final AsociacionRepository asociacionRepository;
    private final CompeticionRepository competicionRepository;

    public HomeControladorWeb(ClubRepository clubRepository,
                              EntrenadorRepository entrenadorRepository,
                              JugadorRepository jugadorRepository,
                              AsociacionRepository asociacionRepository,
                              CompeticionRepository competicionRepository) {
        this.clubRepository = clubRepository;
        this.entrenadorRepository = entrenadorRepository;
        this.jugadorRepository = jugadorRepository;
        this.asociacionRepository = asociacionRepository;
        this.competicionRepository = competicionRepository;
    }

    @GetMapping("/")
    public String inicio(Model model) {
        try {
            model.addAttribute("totalClubes", clubRepository.count());
            model.addAttribute("totalEntrenadores", entrenadorRepository.count());
            model.addAttribute("totalJugadores", jugadorRepository.count());
            model.addAttribute("totalAsociaciones", asociacionRepository.count());
            model.addAttribute("totalCompeticiones", competicionRepository.count());
        } catch (Exception e) {
            model.addAttribute("error", "No se pudo consultar MongoDB: " + e.getClass().getSimpleName());
        }
        return "inicio";
    }

    @GetMapping("/gestion")
    public String gestion() {
        return "gestion";
    }

    @GetMapping("/demo")
    public String demo() {
        return "demo";
    }
}
