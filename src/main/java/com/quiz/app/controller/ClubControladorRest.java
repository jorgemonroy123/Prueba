package com.quiz.app.controller;

import java.util.List;
import java.util.Objects;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.quiz.app.model.Club;
import com.quiz.app.model.Competicion;
import com.quiz.app.model.Jugador;
import com.quiz.app.repository.AsociacionRepository;
import com.quiz.app.repository.ClubRepository;
import com.quiz.app.repository.CompeticionRepository;
import com.quiz.app.repository.EntrenadorRepository;
import com.quiz.app.repository.JugadorRepository;

@RestController
@RequestMapping("/api/clubes")
public class ClubControladorRest {

    private final ClubRepository clubRepository;
    private final EntrenadorRepository entrenadorRepository;
    private final AsociacionRepository asociacionRepository;
    private final JugadorRepository jugadorRepository;
    private final CompeticionRepository competicionRepository;

    public ClubControladorRest(ClubRepository clubRepository,
                               EntrenadorRepository entrenadorRepository,
                               AsociacionRepository asociacionRepository,
                               JugadorRepository jugadorRepository,
                               CompeticionRepository competicionRepository) {
        this.clubRepository = clubRepository;
        this.entrenadorRepository = entrenadorRepository;
        this.asociacionRepository = asociacionRepository;
        this.jugadorRepository = jugadorRepository;
        this.competicionRepository = competicionRepository;
    }

    @GetMapping
    public List<Club> listar() {
        return clubRepository.findAll();
    }

    @GetMapping("/{id}")
    public Club obtener(@PathVariable Long id) {
        return clubRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Club no encontrado"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Club crear(@RequestBody Club body) {
        body.setId(null);
        return guardar(body);
    }

    @PutMapping("/{id}")
    public Club actualizar(@PathVariable Long id, @RequestBody Club body) {
        obtener(id);
        body.setId(id);
        return guardar(body);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        Club club = obtener(id);
        if (club.getJugadores() != null) {
            jugadorRepository.deleteAll(club.getJugadores().stream().filter(Objects::nonNull).toList());
        }
        clubRepository.deleteById(id);
    }

    private Club guardar(Club club) {
        if (club.getEntrenador() == null || !existe(club.getEntrenador().getId(), entrenadorRepository::existsById)) {
            throw badRequest("El entrenador es obligatorio y debe existir");
        }
        if (club.getAsociacion() == null || !existe(club.getAsociacion().getId(), asociacionRepository::existsById)) {
            throw badRequest("La asociación es obligatoria y debe existir");
        }
        if (club.getJugadores() != null) {
            for (Jugador j : club.getJugadores()) {
                if (j == null || !existe(j.getId(), jugadorRepository::existsById)) {
                    throw badRequest("Todos los jugadores deben existir");
                }
            }
        }
        if (club.getCompeticiones() != null) {
            for (Competicion c : club.getCompeticiones()) {
                if (c == null || !existe(c.getId(), competicionRepository::existsById)) {
                    throw badRequest("Todas las competiciones deben existir");
                }
            }
        }
        Club guardado = clubRepository.save(club);
        return obtener(guardado.getId());
    }

    private boolean existe(Long id, java.util.function.Predicate<Long> existsById) {
        return id != null && existsById.test(id);
    }

    private ResponseStatusException badRequest(String mensaje) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, mensaje);
    }
}
