import API_URL from "./config";

export async function fetchRooms(userId: number): Promise<any> {
    const res = await fetch(`${API_URL}/rooms/${userId}`);
    return res.json();
}

export async function fetchMessages(roomId: number) {
    const res = await fetch(`${API_URL}/messages/${roomId}`);
    return res.json();
}

export async function sendMessage(userId: number, roomId: number, content: string) {
    return fetch(`${API_URL}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, room_id: roomId, content }),
    });
}

export async function deleteRoom(roomId: number) {
    return fetch(`${API_URL}/room/delete/${roomId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
    });
}
