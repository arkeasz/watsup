import './Chat.css';
import Rooms from "../components/Rooms";
import ChatBox from "../components/ChatBox";
import useChat from "../hooks/useChat";

function Chat() {
    const {
        roomsAll,
        messages,
        room,
        messagesEndRef,
        openInfo,
        id,
        messageInput,
        msg,
        logOut,
        openSettings,
        createRoom,
        onRoom,
        addMember,
        sendMsg,
        setMessageInput,
        setRoomsAll
    } = useChat()

    return (
        <div className="chat">
            <header>
                <button onClick={logOut}>Salir</button>
            </header>
            <Rooms
                createRoom={createRoom}
                roomsAll={roomsAll}
                onRoom={onRoom}
                setRoomsAll={setRoomsAll}
            />
            <ChatBox
                room={room}
                addMember={addMember}
                id={id}
                messageInput={messageInput}
                messages={messages}
                messagesEndRef={messagesEndRef}
                msg={msg}
                openInfo={openInfo}
                openSettings={openSettings}
                sendMsg={sendMsg}
                setMessageInput={setMessageInput}
            />
        </div>
    );
}

export default Chat;
