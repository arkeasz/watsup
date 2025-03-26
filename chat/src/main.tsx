import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router'
import App from './App.tsx'
import Chat from './Chat.tsx'

const root = document.getElementById('root')!;

createRoot(root).render(
  <BrowserRouter>
    <Routes>
      <Route path='/' element={<App />} />
      <Route path='/chat' element={<Chat />} />
    </Routes>
  </BrowserRouter>,
)
