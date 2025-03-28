type Room = {
    id: number;
    name: string;
}

type Message = {
    content: string;
    user_id: number;
    room_id?: number;
}

export type { Room, Message }
