import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';
import { useNavigate } from "react-router-dom";

function Login() {    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post("http://localhost:3001/login", { email, password })
        .then(result => {
            console.log(result);
            if(result.data === "Success"){
                localStorage.setItem('userEmail', email);
                navigate("/home");
            } else {
                navigate("/register");
                alert("You are not registered to this service");
            }
        })
        .catch(err => console.log(err));
    }

    return (
        <div className="min-h-screen w-screen fixed inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="relative py-3 sm:max-w-xl sm:mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-300 to-purple-300 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
            <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
                <div className="max-w-md mx-auto">
                    <div className="divide-y divide-gray-200">
                        <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold text-indigo-600 mb-2">Login</h1>
                                <p className="text-gray-500 text-sm">Welcome back to Smart Pantry Manager</p>
                            </div>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="relative">
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            autoComplete="off"
                                            className="block w-full px-3 py-2 text-gray-900 bg-transparent border-b-2 border-gray-300 appearance-none focus:outline-none focus:border-indigo-600"
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                        <label
                                        htmlFor="email"
                                        className="absolute text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                                    >
                                        Email
                                    </label>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            placeholder="Password"
                                            className="block w-full px-3 py-2 text-gray-900 bg-transparent border-b-2 border-gray-300 appearance-none focus:outline-none focus:border-indigo-600"
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <label
                                        htmlFor="password"
                                        className="absolute text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                                    >
                                        Password
                                    </label>
                                    </div>
                                    <div className="relative">
                                        <button
                                            type="submit"
                                            className="bg-indigo-600 text-white rounded-md px-6 py-2 w-full hover:bg-indigo-700 transition-colors duration-300 ease-in-out"
                                        >
                                            Login
                                        </button>
                                    </div>
                                </form>
                                <div className="text-center mt-6">
                                    <p className="text-sm text-gray-500 mb-4">Don't have an account?</p>
                                    <Link
                                        to="/register"
                                        className="text-indigo-600 hover:text-indigo-800 transition-colors duration-300 text-sm font-semibold"
                                    >
                                        Sign Up here
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;