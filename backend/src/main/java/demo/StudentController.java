package demo;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
public class StudentController {
    private final StudentService service;
    public StudentController(StudentService service) { this.service = service; }

    @GetMapping("/students")
    public List<Student> all() { return service.findAll(); }

    @GetMapping("/students/{id}")
    public Student one(@PathVariable Long id) { return service.findById(id); }

    @PostMapping("/students")
    @ResponseStatus(HttpStatus.CREATED)
    public Student create(@RequestBody Student student) { return service.create(student); }

    @PutMapping("/students/{id}")
    public Student update(@PathVariable Long id, @RequestBody Student student) {
        return service.update(id, student);
    }

    @DeleteMapping("/students/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { service.delete(id); }

    @GetMapping("/info")
    public java.util.Map<String, String> info() {
        String host = System.getenv().getOrDefault("HOSTNAME", "unknown");
        return java.util.Map.of("podHostname", host);
    }
}
