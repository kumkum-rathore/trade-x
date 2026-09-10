import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
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
                "/auth/register",
                formData
            );

            setMessage(response.data.message);

            setFormData({
                name: "",
                email: "",
                password: ""
            });

            setTimeout(() => navigate("/login"), 900);

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Registration failed"
            );
        }
    };

    return (
        <main className="auth-page auth-page-register">
            <section className="auth-showcase">
                <div className="brand-mark">TP</div>
                <p className="eyebrow">JOIN THE NEXT MOVE</p>
                <h1>Build your edge, one trade at a time.</h1>
                <p className="showcase-copy">One focused workspace for your watchlist, portfolio, market data, and signals.</p>
                <div className="showcase-stats"><span><strong>24/7</strong>Market insights</span><span><strong>1 place</strong>Your trading view</span></div>
            </section>

            <section className="auth-panel">
                <div className="auth-card">
                    <p className="eyebrow">GET STARTED</p>
                    <h2>Create your account</h2>
                    <p className="auth-subtitle">Start making more informed decisions today.</p>

                    <form onSubmit={handleSubmit}>
                        <label htmlFor="register-name">Full name</label>
                        <input
                            id="register-name"
                    type="text"
                    name="name"
                            placeholder="Your full name"
                    value={formData.name}
                    onChange={handleChange}
                            autoComplete="name"
                            required
                />
                        <label htmlFor="register-email">Email address</label>
                        <input
                            id="register-email"
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete="email"
                            required
                        />
                        <label htmlFor="register-password">Password</label>
                        <input
                            id="register-password"
                            type="password"
                            name="password"
                            placeholder="At least 6 characters"
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete="new-password"
                            minLength="6"
                            required
                        />
                        <button className="auth-submit" type="submit">Create account <span aria-hidden="true">-&gt;</span></button>
                    </form>

                    {message && <p className="auth-message">{message}</p>}
                    <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
                </div>
            </section>
        </main>
    );
}

export default Register;