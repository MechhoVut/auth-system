import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <div className="card">
      <h2>Welcome, {user.name} 👋</h2>
      <p>{user.email}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}