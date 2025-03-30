import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import './Chat.css';
import socket from './socket'
import { UserJoinedEvent, AddedToRoomEvent, Room, Message } from './types'
import Rooms from "./components/Rooms";
function Chat() {
    const navigate = useNavigate();
    const [roomsAll, setRoomsAll] = useState<Room[]>([]);
    const [id, setId] = useState<string | null>(localStorage.getItem('user_id'));
    const [messages, setMessages] = useState<Message[]>([]);
    const [room, setRoom] = useState<Room | null>(null)
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const [openInfo, setOpenInfo] = useState(false)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

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

        const handleNewMessage = (newMsg: Message) => {
            setMessages(prevMessages => [...prevMessages, newMsg]);
        };

        const handleUserJoined = ({ room_id, room_name }: UserJoinedEvent) => {
            setRoomsAll(prevRooms =>
                prevRooms.some(room => room.id === room_id)
                    ? prevRooms
                    : [...prevRooms, { id: room_id, name: room_name }]
            );
        };

        if (id) {
            socket.emit('registerUser', id);
        }

        const handleAddedToRoom = ({ room_id, room_name }: AddedToRoomEvent) => {
            setRoomsAll(prevRooms => {
                if (prevRooms.some(r => r.id === room_id)) {
                    return prevRooms;
                }
                return [...prevRooms, { id: room_id, name: room_name }];
            });
            socket.emit('joinRoom', room_id);
        };

        socket.on('youWereAddedToRoom', handleAddedToRoom);

        socket.on('userJoined', handleUserJoined);
        socket.on('new-msg', handleNewMessage);
        return () => {
            socket.off('youWereAddedToRoom', handleAddedToRoom);
            socket.off('new-msg', handleNewMessage);
            socket.off('userJoined', handleUserJoined);
        };
    }, [id, navigate]);

    const logOut = () => {
        localStorage.removeItem('isLogged');
        localStorage.removeItem('user_id');
        navigate('/');
    };
    const openSettings = () => {
        setOpenInfo(!openInfo)
    }
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
                setRoomsAll(prevRooms =>
                    prevRooms.some(room => room.id === newRoom.id) ? prevRooms : [...prevRooms, newRoom]
                );

                input.value = '';
            }
        } catch (error) {
            console.error("Error al crear la sala:", error);
        }
    };
    const msg = useRef(null);
    const onRoom = async(r: Room) => {
        setRoom({id: r.id, name: r.name})
        if (room) {
            socket.emit("leaveRoom", room.id);
        }
        socket.emit("joinRoom", r.id);
        socket.emit("joinRoom", r.id);
        try {
            const res = await fetch(`http://localhost:3000/messages/${r.id}`);
            const data = await res.json();
            setMessages(data);
        } catch (error) {
            console.error("Error al obtener mensajes:", error);
        }
    }

    useEffect(() => {
        if (!room) return;

        socket.off("new-msg");

        const handleNewMessage = (newMsg: Message & { room_id: number }) => {
            if (newMsg.room_id === room.id) {
                setMessages(prevMessages => [...prevMessages, newMsg]);
            }
        };

        socket.on("new-msg", handleNewMessage);

        return () => {
            socket.off("new-msg", handleNewMessage);
        };
    }, [room]);


    const [messageInput, setMessageInput] = useState("");

    const addMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!room) return;

        const input = (e.target as HTMLFormElement).querySelector('input');
        if (!input || !input.value.trim()) return;

        try {
            const res = await fetch('http://localhost:3000/rooms/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: input.value,
                    room_id: room.id
                }),
            });

            if (res.ok) {
                input.value = '';
                // No necesitas actualizar el estado aquí, lo manejará el socket
            } else {
                const error = await res.json();
                alert(error.error || "Error al agregar miembro");
            }
        } catch (error) {
            console.error("Error al agregar miembro:", error);
        }
    };

    const sendMsg = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim() || !room) return;

        try {
            const res = await fetch(`http://localhost:3000/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: id,
                    room_id: room.id,
                    content: messageInput
                }),
            });

            if (res.ok) {
                setMessageInput('');
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="chat">
            <header>
                <button onClick={logOut}>Salir</button>
            </header>
            <Rooms
                createRoom={createRoom}
                roomsAll={roomsAll}
                onRoom={onRoom}
            />
            <div className="chatbox">
                <div className="chatbox__info" onClick={openSettings}>
                    { room?.name }
                </div>
                <div className={`chatbox__settings ${openInfo ? '' : 'info'}`}>
                    <form action="" onSubmit={addMember}>
                        <input type="text" placeholder="email"/>
                        <button type="submit">Add member</button>
                    </form>
                </div>
                <div className={`chatbox__messages ${openInfo ? 'info': ''}`}>
                    {messages.map((msg, index) => (
                        <span
                            className={(msg.user_id == Number(id)) ? 'receptor message' : 'sender message'}
                            key={index}
                        >
                            {msg.content}
                        </span>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <form onSubmit={sendMsg} ref={msg} className={room ? 'chatbox__input': 'chatbox__input no_room'}>
                    <input
                        type="text"
                        placeholder="Send a message"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                    />
                    <button type="submit">Send</button>
                </form>
            </div>
        </div>
    );
}

export default Chat;
