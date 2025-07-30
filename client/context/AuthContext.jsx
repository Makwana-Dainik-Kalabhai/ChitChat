import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

// Set the base URL for axios requests
const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [authUser, setAuthUser] = useState("");
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState("");


    
    //* Check If user is authenticated, then set user data and connect the socket
    const checkAuth = async () => {
        try {
            const { data } = await axios.get("/api/auth/check");

            if (data.status) setAuthUser(data.user);

            connectSocket(data.user);
        } catch (error) {
            toast.error(error.message);
        }
    }


    //* Login Function to handle user authentication & socket connection
    const login = async (state, credentials) => {
        try {
            const { data } = await axios.post(`/api/auth/${state}`, credentials);
            console.log(data);

            if (data.status) {
                setAuthUser(data.user);
                connectSocket(data.user);

                axios.defaults.headers.common["token"] = data.token;
                setToken(data.token);
                localStorage.setItem("token", JSON.stringify({ value: data.token, expiry: (new Date()).getTime() + (10 * 24 * 60 * 60 * 1000) }));

                toast.success(data.message);
            }
            else toast.error(data.message);
            //
        } catch (error) {
            toast.error(error.message);
        }
    }



    //* Logout Function to handle user logout & socket disconnection
    const logout = () => {
        localStorage.removeItem("token");
        setToken("");
        setAuthUser("");
        setOnlineUsers([]);

        axios.defaults.headers.common["token"] = "";
        toast.success("Logged out successfully");
        socket.disconnect();
    }



    //* Update profile function, to update the profile
    const updateProfile = async (body) => {
        try {
            const { data } = await axios.put("/api/auth/update-profile", body);

            if (data.status) {
                setAuthUser(data.user);
                toast.success("Profile updated successfully");
            }
            else toast.error(data.message);
        } catch (error) {
            toast.error(error.message);
        }
    }



    //* Connect socket function to handle socket connection and online users updates
    const connectSocket = (userData) => {
        if (!userData || socket?.connected) return;

        const newSocket = io(backendUrl, {
            query: {
                userId: userData._id,
            }
        });
        newSocket.connect();
        setSocket(newSocket);

        newSocket.on("getOnlineUsers", (userIds) => {
            setOnlineUsers(userIds);
        });
    }


    useEffect(() => {
        if (token) axios.defaults.headers.common["token"] = token;
        checkAuth();
    }, [token]);

    const value = {
        axios,
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}