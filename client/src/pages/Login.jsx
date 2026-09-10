import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {

    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            const response = await api.post(
                "/auth/login",
                formData
            );

            login(
                response.data.token,
                response.data.user
            );

            setMessage("Login successful");

            navigate("/dashboard");

        } catch (error) {

            setMessage(
                error.response?.data?.message ||
                "Login failed"
            );

        }
    };

    return (
        <main className="auth-page">
            <section className="auth-showcase">
                <div className="brand-mark">TP</div>
                <p className="eyebrow">TRADE PLATFORM</p>
                <h1>Trade with a clearer view of the market.</h1>
                <p className="showcase-copy">Track momentum, discover opportunities, and make every decision with confidence.</p>
                <div className="market-ticker">
                    <span>NIFTY 50</span>
                    <strong>24,768.35</strong>
                    <em>+1.24%</em>
                </div>
            </section>

            <section className="auth-panel">
                <div className="auth-card">
                    <p className="eyebrow">WELCOME BACK</p>
                    <h2>Sign in to your account</h2>
                    <p className="auth-subtitle">Your portfolio is waiting for you.</p>

                    <form onSubmit={handleSubmit}>
                        <label htmlFor="login-email">Email address</label>
                        <input
                            id="login-email"
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete="email"
                            required
                        />

                        <label htmlFor="login-password">Password</label>
                        <input
                            id="login-password"
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                            required
                        />

                        <button className="auth-submit" type="submit">Sign in <span aria-hidden="true">-&gt;</span></button>
                    </form>

                    {message && <p className="auth-message">{message}</p>}
                    <p className="auth-switch">New to Trade Platform? <Link to="/register">Create an account</Link></p>
                </div>
            </section>
        </main>
    );
}

export default Login;