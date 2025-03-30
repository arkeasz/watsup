import { JSX } from "react";
import { Room } from "../types"

type Rooms = {
    createRoom: (e: React.FormEvent) => void;
    roomsAll: Room[];
    onRoom: (r: Room) => void;
}

const Rooms = ({ createRoom, roomsAll, onRoom }: Rooms): JSX.Element => {
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
                        {r.name}
                    </section>
                ))}
            </div>
        </div>
    )
}

export default Rooms;
