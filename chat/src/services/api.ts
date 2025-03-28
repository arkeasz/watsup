export async function fetchRooms(userId: number) {
    const res = await fetch(`http://localhost:3000/rooms/${userId}`);
    return res.json();
}

export async function fetchMessages(roomId: number) {
    const res = await fetch(`http://localhost:3000/messages/${roomId}`);
    return res.json();
}

export async function sendMessage(userId: number, roomId: number, content: string) {
    return fetch(`http://localhost:3000/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, room_id: roomId, content }),
    });
}
