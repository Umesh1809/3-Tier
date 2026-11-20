import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const empty = { name: '', email: '', course: '' };

function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [pod, setPod] = useState('loading...');
  const [error, setError] = useState('');

  async function load() {
    setError('');
    try {
      const [studentResponse, infoResponse] = await Promise.all([
        fetch('/api/students'), fetch('/api/info')
      ]);
      if (!studentResponse.ok) throw new Error('Could not load students');
      setStudents(await studentResponse.json());
      if (infoResponse.ok) setPod((await infoResponse.json()).podHostname);
    } catch (err) { setError(err.message); }
  }

  useEffect(() => { load(); }, []);

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      const response = await fetch(editing ? `/api/students/${editing}` : '/api/students', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!response.ok) throw new Error('Could not save student');
      setForm(empty); setEditing(null); await load();
    } catch (err) { setError(err.message); }
  }

  async function remove(id) {
    if (!confirm('Delete this student?')) return;
    setError('');
    try {
      const response = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Could not delete student');
      await load();
    } catch (err) { setError(err.message); }
  }

  function edit(student) {
    setEditing(student.id);
    setForm({ name: student.name, email: student.email, course: student.course });
  }

  return (
    <main>
      <header><div><p className="eyebrow">Student Registry</p><h1>Manage students</h1></div>
        <div className="pod">
          <span>Served by pod: <strong>{pod}</strong></span>
          <button className="secondary" type="button" onClick={load}>Refresh pod</button>
        </div></header>
      {error && <div className="error">{error}</div>}
      <section className="grid">
        <aside>
          <h2>{editing ? 'Edit student' : 'Add student'}</h2>
          <form onSubmit={submit}>
            {['name', 'email', 'course'].map(field => (
              <label key={field}>{field[0].toUpperCase() + field.slice(1)}
                <input required type={field === 'email' ? 'email' : 'text'} value={form[field]}
                  onChange={event => setForm({ ...form, [field]: event.target.value })} />
              </label>
            ))}
            <button type="submit">{editing ? 'Save changes' : 'Add student'}</button>
            {editing && <button className="secondary" type="button" onClick={() => { setEditing(null); setForm(empty); }}>Cancel</button>}
          </form>
        </aside>
        <div className="table-card">
          <h2>Students <span>{students.length}</span></h2>
          <div className="table-wrap"><table>
            <thead><tr><th>Name</th><th>Email</th><th>Course</th><th></th></tr></thead>
            <tbody>{students.map(student => (
              <tr key={student.id}><td>{student.name}</td><td>{student.email}</td><td>{student.course}</td>
                <td className="actions"><button onClick={() => edit(student)}>Edit</button><button className="danger" onClick={() => remove(student.id)}>Delete</button></td>
              </tr>
            ))}</tbody>
          </table></div>
          {!students.length && <p className="empty">No students yet.</p>}
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
