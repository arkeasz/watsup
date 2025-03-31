import { JSX } from "react";
import { Room } from "../types"
import useChat from "../hooks/useChat";
import { deleteRoom } from "../services/api";
import './Room.css'

type Rooms = {
    createRoom: (e: React.FormEvent) => void;
    roomsAll: Room[];
    onRoom: (r: Room) => void;
    setRoomsAll: React.Dispatch<React.SetStateAction<Room[]>>
}

const Rooms = ({ createRoom, roomsAll, onRoom, setRoomsAll }: Rooms): JSX.Element => {

    const removeRoom = async (id: number) => {
        try {
            const res = await deleteRoom(id);
            if (!res.ok) throw new Error("Failed to delete room");

            // setRoomsAll((prev) => prev.filter(ro => ro.id !== id));
        } catch (error) {
            console.error('Error deleting room', error);
        }
    }

    return (
        <div className="rooms">
            <div className="rooms__settings">
                <form onSubmit={createRoom}>
                    <input type="text" placeholder="room" />
                    <button type="submit">Add</button>
                </form>
            </div>
            <div className="rooms_all">
                <section className="room room__hidden">wazaaaa</section>
                {roomsAll.map((r: Room) => (
                    <section
                        onClick={() => onRoom(r)}
                        data-peer-id={r.id}
                        key={r.id}
                        className="room"
                    >
                        <div>{r.name}</div>
                        <div className="delete" onClick={() => removeRoom(r.id)}>X</div>
                    </section>
                ))}
            </div>
        </div>
    )
}

export default Rooms;
