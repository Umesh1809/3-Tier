package demo;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class StudentService {
    private final StudentRepository repository;
    public StudentService(StudentRepository repository) { this.repository = repository; }

    public List<Student> findAll() { return repository.findAll(); }
    public Student findById(Long id) {
        return repository.findById(id).orElseThrow(() -> new StudentNotFoundException(id));
    }
    public Student create(Student student) { student.setId(null); return repository.save(student); }
    public Student update(Long id, Student student) {
        Student existing = findById(id);
        existing.setName(student.getName());
        existing.setEmail(student.getEmail());
        existing.setCourse(student.getCourse());
        return repository.save(existing);
    }
    public void delete(Long id) { repository.delete(findById(id)); }
}
