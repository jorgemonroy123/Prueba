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

import com.quiz.app.model.Entrenador;
import com.quiz.app.repository.EntrenadorRepository;

@RestController
@RequestMapping("/api/entrenadores")
public class EntrenadorControladorRest {

    private final EntrenadorRepository repository;

    public EntrenadorControladorRest(EntrenadorRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Entrenador> listar() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Entrenador obtener(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Entrenador no encontrado"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Entrenador crear(@RequestBody Entrenador body) {
        body.setId(null);
        return repository.save(body);
    }

    @PutMapping("/{id}")
    public Entrenador actualizar(@PathVariable Long id, @RequestBody Entrenador body) {
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
