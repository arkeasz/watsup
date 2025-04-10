import { JSX, useEffect, useRef, useState } from "react";
import { Room } from "../types"
import './Room.css'
import RoomContext from "./RoomContext";

type RoomsComponent = {
    createRoom: (e: React.FormEvent) => void;
    roomsAll: Room[];
    onRoom: (r: Room) => void;
    openSettings: () => void;
    setRoom: React.Dispatch<React.SetStateAction<Room | null>>;
}

type Coords = {
    x: number,
    y: number
}

const Rooms = ({ createRoom, roomsAll, onRoom, openSettings, setRoom }: RoomsComponent): JSX.Element => {
    const [ coords, setCoords ] = useState<Coords>({x:0, y:0})
    const [ contextRoom, setContextRoom ] = useState<number | null>(null);
    const roomsTop =  useRef<HTMLDivElement | null>(null);

    const prevRoomsCount = useRef(roomsAll.length);

    useEffect(() => {
        if (roomsAll.length > prevRoomsCount.current) {
            roomsTop.current?.scrollIntoView({ behavior: "smooth" });
        }
        prevRoomsCount.current = roomsAll.length;
    }, [roomsAll.length]);

    const openCt = (e: React.MouseEvent<HTMLElement>, roomId: number) => {
        e.preventDefault();
        setContextRoom(roomId === contextRoom ? null : roomId);
        setCoords({ x: e.pageX, y: e.pageY });
    };

    useEffect(() => {
        const handleClickOutside = () => setContextRoom(null);
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    return (
        <div className="rooms">
            <div className="rooms__settings">
                <form onSubmit={createRoom}>
                    <input type="text" placeholder="room" />
                    <button type="submit">Add</button>
                </form>
            </div>
            <div className="rooms_all" >
                <section className="room room__hidden">wazaaaa</section>
                {roomsAll.map((r: Room) => (
                    <section
                        onClick={() => onRoom(r)}
                        data-peer-id={r.id}
                        key={r.id}
                        className="room"
                        onContextMenu={ (e) => openCt(e, r.id) }
                    >
                        <div className="room__title">{r.name}</div>
                        {
                            contextRoom === r.id &&
                            <RoomContext
                                room={r}
                                x={coords.x}
                                y={coords.y}
                                openSettings={openSettings}
                                setRoom={setRoom}
                                />
                            }
                    </section>
                ))}
                <section className="room room__hidden-top" ref={roomsTop}>wazaaaa</section>
            </div>
        </div>
    )
}

export default Rooms;
