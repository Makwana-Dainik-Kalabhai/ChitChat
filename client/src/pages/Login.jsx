import { useContext, useState } from "react";
import assets from "../assets/assets"
import { AuthContext } from "../../context/AuthContext";

export const Login = () => {

    const [currState, setCurrState] = useState("signUp");

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [bio, setBio] = useState("");
    const [isDataSubmitted, setIsDataSubmitted] = useState(false);

    const { login } = useContext(AuthContext);


    const handleInput = (e) => {
        const { name, value } = e.target;

        if (name === "fullName") {
            setFullName(value);
        } else if (name === "email") {
            setEmail(value);
        } else if (name === "password") {
            setPassword(value);
        } else if (name === "bio") {
            setBio(value);
        }
    }


    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (currState === "signUp" && !isDataSubmitted) {
            setIsDataSubmitted(true);
            return;
        }
        
        login(currState === "signUp" ? "signup" : "login", { fullName, email, password, bio });
    }


    return (
        <div className="min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl">

            {/* Left Side */}
            <img src={assets.logo_big} alt="" className="w-[20vw]" />


            {/* Right Side */}
            <form onSubmit={handleSubmit} className="border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg">
                <h2 className="font-medium text-2xl flex justify-between items-center">
                    {currState}
                    {isDataSubmitted &&
                        <img onClick={() => setIsDataSubmitted(false)} src={assets.arrow_icon} alt="" className="w-5 cursor-pointer" />
                    }
                </h2>

                {currState === "signUp" && !isDataSubmitted && (
                    <input onChange={handleInput} value={fullName} type="text" className="p-2 border border-gray-500 rounded-md focus:outline-none" placeholder="Full Name" required name="fullName" />
                )}

                {!isDataSubmitted && (
                    <>
                        <input onChange={handleInput} value={email} type="email" placeholder="Email Address" required className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" name="email" />

                        <input onChange={handleInput} value={password} type="password" placeholder="Password" required className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" name="password" />
                    </>
                )}

                {currState === "signUp" && isDataSubmitted && (
                    <textarea onChange={handleInput} value={bio} rows={4} className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" name="bio" placeholder="Provide a short bio" required></textarea>
                )}

                <button type="submit" className="py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer hover:scale-97">{currState === "signUp" ? "Create Account" : "Login Now"}</button>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <input type="checkbox" />
                    <p>Agree to the terms of use & privacy policy.</p>
                </div>

                <div className="flex flex-col gap-2">
                    {currState === "signUp" ? (
                        <p className="text-sm text-gray-600">Already have an account? <span onClick={() => { setCurrState("login"); setIsDataSubmitted(false) }} className="font-medium text-violet-500 cursor-pointer">Login here</span></p>
                    ) : (
                        <p className="text-sm text-gray-600">Create an account <span onClick={() => setCurrState("signUp")} className="font-medium text-violet-500 cursor-pointer">Click here</span></p>
                    )}
                </div>
            </form>
        </div>
    )
}