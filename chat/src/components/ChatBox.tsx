import { Message, Room } from "../types";

type ChatBox = {
    room: Room | null,
    openSettings: () => void;
    openInfo: boolean;
    addMember: (e: React.FormEvent) => Promise<void>;
    messages: Message[];
    messagesEndRef: React.RefObject<HTMLDivElement | null>;
    sendMsg: (e: React.FormEvent) => Promise<void>;
    id: string | null;
    msg: React.RefObject<HTMLFormElement | null>,
    messageInput: string,
    setMessageInput: React.Dispatch<React.SetStateAction<string>>
}

const ChatBox = ({
    room,
    openSettings,
    openInfo,
    addMember,
    messages,
    messagesEndRef,
    sendMsg,
    id,
    msg,
    messageInput,
    setMessageInput
}: ChatBox) => {
    return (
        <div className="chatbox">
            <div className="chatbox__info" onClick={openSettings}>
                { room?.name }
            </div>
            <div className={`chatbox__settings ${openInfo ? '' : 'info'}`}>
                <form action="" onSubmit={addMember}>
                    <input type="text" placeholder="email"/>
                    <button type="submit">Add member</button>
                </form>
            </div>
            <div className={`chatbox__messages ${openInfo ? 'info': ''}`}>
                {messages.map((msg, index) => (
                    <span
                        className={(msg.user_id == Number(id)) ? 'receptor message' : 'sender message'}
                        key={index}
                    >
                        {msg.content}
                    </span>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMsg} ref={msg} className={room ? 'chatbox__input': 'chatbox__input no_room'}>
                <input
                    type="text"
                    placeholder="Send a message"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                />
                <button type="submit">Send</button>
            </form>
        </div>
    )
}

export default ChatBox;
