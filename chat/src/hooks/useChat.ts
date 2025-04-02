import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import socket from "../services/socket";
import { UserJoinedEvent, AddedToRoomEvent, Room, Message } from "../types";
import { fetchRooms } from "../services/api";
import API_URL from "../services/config";

function useChat() {
    const [messageInput, setMessageInput] = useState("");
    const msg = useRef(null);
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

        fetchRooms(Number(id))
            .then(d => setRoomsAll(d))
            .catch(e =>  console.log(e))

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

        if (id) socket.emit('registerUserOnRoom', id);

        const handleAddedToRoom = ({ room_id, room_name }: AddedToRoomEvent) => {
            setRoomsAll(prevRooms => {
                if (prevRooms.some(r => r.id === room_id)) {
                    return prevRooms;
                }
                return [...prevRooms, { id: room_id, name: room_name }];
            });
            socket.emit('joinRoom', room_id);
        };

        socket.on('delete-room', ({room_id}) => {
            setRoomsAll((prev) => prev.filter(ro => ro.id !== room_id));
        })
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
            const res = await fetch(`${API_URL}/room/add`, {
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
    const onRoom = async(r: Room) => {
        setRoom({id: r.id, name: r.name})
        if (room) {
            socket.emit("leaveRoom", room.id);
        }
        socket.emit("joinRoom", r.id);
        try {
            const res = await fetch(`${API_URL}/messages/${r.id}`);
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

    const addMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!room) return;

        const input = (e.target as HTMLFormElement).querySelector('input');
        if (!input || !input.value.trim()) return;

        try {
            const res = await fetch(`${API_URL}/rooms/member/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: input.value,
                    room_id: room.id
                }),
            });

            if (res.ok) {
                input.value = '';
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
            const res = await fetch(`${API_URL}/message`, {
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

    return  {
        roomsAll,
        messages,
        room,
        messagesEndRef,
        openInfo,
        id,
        messageInput,
        msg,
        setRoom,
        setRoomsAll,
        logOut,
        openSettings,
        createRoom,
        onRoom,
        addMember,
        sendMsg,
        setMessageInput,
    }
}


export default useChat;
