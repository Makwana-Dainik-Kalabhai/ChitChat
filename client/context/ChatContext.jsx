import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {

    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [unseenMessages, setUnseenMessages] = useState({});

    const { socket, axios } = useContext(AuthContext);


    //* Function to get all users
    const getUsers = async () => {
        try {
            const { data } = await axios.get("/api/messages/users");

            if (data.status) {
                setUsers(data.users);
                setUnseenMessages(data.unseenMessages);
            }
        } catch (err) {
            toast.error(err.message);
        }
    }


    //* Function to get messages of selected user
    const getMessages = async (userId) => {
        try {
            const { data } = await axios.get(`/api/messages/${userId}`);

            if (data.status) {
                setMessages(data.messages);
            }
        } catch (err) {
            toast.error(err.message);
        }

    }



    //* Function to send messages to selected user
    const sendMessages = async (messageData) => {
        try {
            const { data } = await axios.post(`/api/messages/send/${selectedUser?._id}`, messageData);

            if (data.status) {
                setMessages(prev => [...prev, data.newMessage]);
            }
        } catch (err) {
            toast.error(err.message);
        }

    }



    //* Function to subscribe to messages for selected user
    const subscribeToMessages = async () => {
        if (!socket) return;

        socket.on("newMessage", (newMessage) => {
            if (selectedUser && newMessage.senderId === selectedUser._id) {
                newMessage.seen = true;
                setMessages(prev => [...prev, newMessage]);
                axios.put(`/api/messages/mark/${newMessage._id}`);
                //
            }
            else {
                setUnseenMessages(prev => ({
                    ...prev,
                    [newMessage.senderId]: prev[newMessage.senderId] ? prev[newMessage.senderId] + 1 : 1
                }));
            }
        });
    }




    //* Function to unsubscribe to messages for selected user
    const unsubscribeFromMessages = async () => {
        if (socket) socket.off("newMessage");
    }


    useEffect(() => {
        subscribeToMessages();
        return () => unsubscribeFromMessages();
    }, [socket, selectedUser]);

    const value = {
        messages,
        users,
        selectedUser,
        getUsers,
        getMessages,
        sendMessages,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}