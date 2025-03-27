import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import './Chat.css';

type Room = {
    id: number;
    name: string;
}

function Chat() {
    const navigate = useNavigate();
    const [roomsAll, setRoomsAll] = useState<Room[]>([]);
    const [id, setId] = useState<string | null>(localStorage.getItem('user_id'));

    useEffect(() => {
        if (localStorage.getItem('isLogged') !== 'true') {
            navigate('/');
            return;
        }

        const fetchRooms = async () => {
            try {
                const res = await fetch(`http://localhost:3000/rooms/${id}`);
                const data = await res.json();
                setRoomsAll(data);
            } catch (error) {
                console.error("Error al obtener las salas:", error);
            }
        };

        if (id) fetchRooms();
    }, [id]);

    const logOut = () => {
        localStorage.removeItem('isLogged');
        localStorage.removeItem('user_id');
        navigate('/');
    };

    const createRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        const input = (e.target as HTMLFormElement).querySelector('input');
        if (!input || !input.value) return;

        try {
            const res = await fetch('http://localhost:3000/room', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: input.value, user_id: id }),
            });

            if (res.ok) {
                const newRoom: Room = await res.json();
                setRoomsAll(prevRooms => [...prevRooms, newRoom]);
                input.value = '';
            }
        } catch (error) {
            console.error("Error al crear la sala:", error);
        }
    };

    return (
        <div className="chat">
            <header>
                <button onClick={logOut}>Salir</button>
            </header>
            <div className="rooms">
                <div className="rooms__settings">
                    <form onSubmit={createRoom}>
                        <input type="text" placeholder="room" />
                        <button type="submit">Add</button>
                    </form>
                </div>
                <div className="rooms_all">
                    {roomsAll.map(room => (
                        <section key={room.id} className="room">{room.name}</section>
                    ))}
                        <section className="room room__hidden">dsa</section>
                </div>
            </div>
            <div className="chatbox">
                <div className="chatbox__messages"></div>
                <form>
                    <input type="text" placeholder="Mensaje" />
                    <button type="submit">Enviar</button>
                </form>
            </div>
        </div>
    );
}

export default Chat;
