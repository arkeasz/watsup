import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";

function Chat() {
    const navigate = useNavigate();
    const logOut = () => {
        localStorage.removeItem('isLogged');
        navigate('/');
    };
    let messages = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (localStorage.getItem('isLogged') !== 'true') navigate('/');
        fetch('http://localhost:3000/messages')
            .then(res => res.json())
            .then(data => {
                data.forEach((msg: any) => {
                    let message = document.createElement('div');
                    message.textContent = msg.message;
                    messages.current?.appendChild(message);
                });
            }
        );
    }, []);


    const submitMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        let message = (e.target as HTMLFormElement).querySelector('input')?.value;
        if (!message) return;
        await fetch('http://localhost:3000/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, user_id: 1, room_id: 1 }),
        });
        let newMessage = document.createElement('div');
        newMessage.textContent = message;
        messages.current?.appendChild(newMessage);
        (e.target as HTMLFormElement).querySelector('input')!.value = '';
        (e.target as HTMLFormElement).querySelector('input')!.focus()
    };

    return (
        <div className="chat">
            <header>
                <button onClick={logOut}>
                    Salir
                </button>
            </header>
            <div className="rooms">
                <div className="rooms__settings">
                    <button>Create a room</button>
                </div>
            </div>
            <div className="chatbox">
                <div ref={messages} className="chatbox__messages">

                </div>
                <form action="" onSubmit={submitMessage}>
                    <input type="text" placeholder="Mensaje" />
                    <button type="submit">Enviar</button>
                </form>
            </div>
        </div>
    );
}

export default Chat;
