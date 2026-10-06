package com.quiz.app.controller;

import java.util.List;

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

import com.quiz.app.model.Jugador;
import com.quiz.app.repository.JugadorRepository;

@RestController
@RequestMapping("/api/jugadores")
public class JugadorControladorRest {

    private final JugadorRepository repository;

    public JugadorControladorRest(JugadorRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Jugador> listar() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Jugador obtener(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Jugador no encontrado"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Jugador crear(@RequestBody Jugador body) {
        body.setId(null);
        return repository.save(body);
    }

    @PutMapping("/{id}")
    public Jugador actualizar(@PathVariable Long id, @RequestBody Jugador body) {
        obtener(id);
        body.setId(id);
        return repository.save(body);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        obtener(id);
        repository.deleteById(id);
    }
}
