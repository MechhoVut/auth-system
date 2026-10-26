import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import PasswordInput from "../components/PasswordInput";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const captchaRef = useRef(null);
  const [form, setForm] = useState({ email: "", password: "" });
  const [captchaToken, setCaptchaToken] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ ...form, captchaToken });
      toast.success("Welcome back!");
      navigate("/");
    } catch (err) {
      // shows "2 attempt(s) left" or "Account locked..." from the server
      toast.error(err.response?.data?.message || "Something went wrong");
      captchaRef.current?.reset();
      setCaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <PasswordInput
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />
        <Link to="/forgot-password" className="forgot">
          Forgot password?
        </Link>

        <ReCAPTCHA
          ref={captchaRef}
          sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
          onChange={(token) => setCaptchaToken(token)}
          onExpired={() => setCaptchaToken(null)}
        />

        <button type="submit" disabled={!captchaToken || loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p className="switch">
        New here? <Link to="/signup">Create account</Link>
      </p>
    </div>
  );
}