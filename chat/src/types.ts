type Room = {
    id: number;
    name: string;
}

type Message = {
    content: string;
    user_id: number;
    room_id?: number;
}

type AddedToRoomEvent = {
    room_id: number;
    room_name: string;
};

type UserJoinedEvent = {
    user_id: number;
    username: string;
    room_id: number;
    room_name: string;
};


export type { Room, Message, AddedToRoomEvent, UserJoinedEvent }
