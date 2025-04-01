import type { JSX } from "react";
import { deleteRoom } from "../services/api";
import { Room } from "../types";

type RoomContext  = {
    room: Room;
    x: number;
    y: number;
}

const RoomContext = ({ room, x, y }: RoomContext): JSX.Element => {
    const removeRoom = async (id: number) => {
        try {
            const res = await deleteRoom(id);
            if (!res.ok) throw new Error("Failed to delete room");
        } catch (error) {
            console.error('Error deleting room', error);
        }
    }
    return (
        <div className="room__context" style={{ position: 'absolute', top: y, left: x }}>
            <div className="room__delete" onClick={() => removeRoom(room.id)}>X</div>
        </div>
    )

}

export default RoomContext;
