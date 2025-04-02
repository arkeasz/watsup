import type { JSX } from "react";
import { deleteRoom } from "../services/api";
import { Room } from "../types";
import socket from "../services/socket";

type RoomContext  = {
    room: Room;
    x: number;
    y: number;
    openSettings: () => void;
    setRoom: React.Dispatch<React.SetStateAction<Room | null>>;
}

const RoomContext = ({ room, x, y, openSettings,  setRoom }: RoomContext): JSX.Element => {
    const removeRoom = async (id: number) => {
        try {
            const res = await deleteRoom(id);
            if (!res.ok) throw new Error("Failed to delete room");
            setRoom(null);
            socket.emit("leaveRoom", room.id);
        } catch (error) {
            console.error('Error deleting room', error);
        }
    }
    return (
        <div className="room__context" style={{ position: 'absolute', top: y, left: x }}>
            <div
                className="room__delete"
                onClick={() => removeRoom(room.id)}
            >
                Delete
            </div>
            <div
                className="room__settings"
                onClick={openSettings}
            >
                Open Settings
            </div>
        </div>
    )

}

export default RoomContext;
