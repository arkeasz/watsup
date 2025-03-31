import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router';

interface User {
  id: number;
  username: string;
  email: string;
  password: string;
}

function App() {
  const navigate = useNavigate();
  const [form ,setForm] = useState({username: '', email: '', password: ''});

  useEffect(() => {
    if (localStorage.getItem('isLogged') == 'true') navigate('/chat');
  }, []);

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    let res = await fetch('http://localhost:3000/users', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    let data;
    try {
      data = await res.json();
      console.log("Data recibida:", data);
    } catch (error) {
      console.error("Error al parsear JSON:", error);
    }
    setForm({ username: "", email: "", password: "" });
    localStorage.setItem('isLogged', 'true');
    localStorage.setItem('user_id', data.id);
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
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button type="submit">Agregar Usuario</button>
      </form>
    </>
  )
}

export default App
