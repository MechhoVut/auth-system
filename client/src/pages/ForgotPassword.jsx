import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import toast from "react-hot-toast";
import api from "../api/axios";

export default function ForgotPassword() {
  const captchaRef = useRef(null);
  const [email, setEmail] = useState("");
  const [captchaToken, setCaptchaToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email, captchaToken });
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
      captchaRef.current?.reset();
      setCaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="card">
        <h2>Check your email 📩</h2>
        <p>
          If <b>{email}</b> is registered, we sent a password reset link. It's
          valid for 15 minutes.
        </p>
        <p className="switch">
          <Link to="/login">Back to login</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Forgot password</h2>
      <p>Enter your email and we'll send you a reset link.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <ReCAPTCHA
          ref={captchaRef}
          sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
          onChange={(token) => setCaptchaToken(token)}
          onExpired={() => setCaptchaToken(null)}
        />

        <button type="submit" disabled={!captchaToken || loading}>
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>
      <p className="switch">
        <Link to="/login">Back to login</Link>
      </p>
    </div>
  );
}