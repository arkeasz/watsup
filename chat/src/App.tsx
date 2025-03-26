import React, { useEffect, useState } from 'react'
import './App.css'
import socket from './socket';
import { useNavigate } from 'react-router';

interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
}

function App() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [form ,setForm] = useState({username: '', email: '', password_hash: ''});

  useEffect(() => {
    if (localStorage.getItem('isLogged') == 'true') navigate('/chat');
    fetch('http://localhost:3000/users')
      .then(res => res.json())
      .then(data => setUsers(data))

    socket.on('new-usr', (newUser: User) => {
      setUsers((prev) => [...prev, newUser]);
    })

    return () => {
      socket.off('new-usr');
    }
  }, []);

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    await fetch('http://localhost:3000/users', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    setForm({ username: "", email: "", password_hash: "" });
    localStorage.setItem('isLogged', 'true');
    navigate('/chat');
  }

  return (
    <>
      <section>
        <h1>Watsup</h1>
      </section>
      <form action="" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password_hash}
          onChange={(e) => setForm({ ...form, password_hash: e.target.value })}
        />
        <button type="submit">Agregar Usuario</button>
      </form>
    </>
  )
}

export default App
