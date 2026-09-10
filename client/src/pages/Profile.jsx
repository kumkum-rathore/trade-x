import { useEffect, useState } from "react";
import api from "../services/api";
import MainLayout from "../components/layout/MainLayout";
import { useAuth } from "../context/AuthContext";

function Profile() {

    const { user, login, token } = useAuth();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");

    const [editing, setEditing] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {

        const fetchProfile = async () => {

            try {

                const response = await api.get(
                    "/profile"
                );

                const profileUser = response.data.user;

                setName(profileUser.name);
                setEmail(profileUser.email);
                setRole(profileUser.role);

            } catch (error) {

                setMessage(
                    error.response?.data?.message ||
                    "Failed to load profile"
                );

            }
        };

        fetchProfile();

    }, []);


    const handleUpdate = async (e) => {

        e.preventDefault();

        try {

            const response = await api.put(
                "/profile",
                {
                    name
                }
            );

            const updatedUser = response.data.user;

            login(token, updatedUser);

            setEditing(false);

            setMessage(
                "Profile updated successfully"
            );

        } catch (error) {

            setMessage(
                error.response?.data?.message ||
                "Profile update failed"
            );

        }
    };


    return (
        <MainLayout>

            <div className="profile-page">

                <div className="page-header">

                    <h1>My Profile</h1>

                    <p>
                        Manage your account information
                    </p>

                </div>


                <div className="profile-card">

                    <div className="profile-avatar">
                        {name?.charAt(0)?.toUpperCase()}
                    </div>


                    {!editing ? (

                        <>
                            <div className="profile-info">

                                <div className="profile-field">
                                    <span>Name</span>
                                    <strong>{name}</strong>
                                </div>

                                <div className="profile-field">
                                    <span>Email</span>
                                    <strong>{email}</strong>
                                </div>

                                <div className="profile-field">
                                    <span>Role</span>
                                    <strong>{role}</strong>
                                </div>

                            </div>

                            <button
                                className="edit-profile-btn"
                                onClick={() =>
                                    setEditing(true)
                                }
                            >
                                Edit Profile
                            </button>
                        </>

                    ) : (

                        <form
                            className="profile-form"
                            onSubmit={handleUpdate}
                        >

                            <label>
                                Name
                            </label>

                            <input
                                type="text"
                                value={name}
                                onChange={(e) =>
                                    setName(e.target.value)
                                }
                            />


                            <label>
                                Email
                            </label>

                            <input
                                type="email"
                                value={email}
                                disabled
                            />


                            <div className="profile-actions">

                                <button type="submit">
                                    Save Changes
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setEditing(false)
                                    }
                                >
                                    Cancel
                                </button>

                            </div>

                        </form>

                    )}

                    {message && (
                        <p className="profile-message">
                            {message}
                        </p>
                    )}

                </div>

            </div>

        </MainLayout>
    );
}

export default Profile;