import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import toast from "react-hot-toast";
import api from "../api/axios";
import PasswordInput from "../components/PasswordInput";

import { passwordRules as rules } from "../utils/passwordRules";

export default function Signup() {
  const navigate = useNavigate();
  const captchaRef = useRef(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [captchaToken, setCaptchaToken] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const allRulesPass = rules.every((r) => r.test(form.password));
  const passwordsMatch =
    form.confirmPassword !== "" && form.password === form.confirmPassword;
  const canSubmit = allRulesPass && passwordsMatch && captchaToken && !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/signup", { ...form, captchaToken });
      toast.success(data.message);
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
      captchaRef.current?.reset(); // captcha tokens are one-time use
      setCaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Create account</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Full name"
          value={form.name}
          onChange={handleChange}
          required
        />
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

        <ul className="rules">
          {rules.map((r) => (
            <li key={r.label} className={r.test(form.password) ? "ok" : "bad"}>
              {r.test(form.password) ? "✔" : "✖"} {r.label}
            </li>
          ))}
        </ul>

        <PasswordInput
          name="confirmPassword"
          placeholder="Confirm password"
          value={form.confirmPassword}
          onChange={handleChange}
        />
        {form.confirmPassword && !passwordsMatch && (
          <p className="error">Passwords do not match</p>
        )}

        <ReCAPTCHA
          ref={captchaRef}
          sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
          onChange={(token) => setCaptchaToken(token)}
          onExpired={() => setCaptchaToken(null)}
        />

        <button type="submit" disabled={!canSubmit}>
          {loading ? "Creating..." : "Sign up"}
        </button>
      </form>
      <p className="switch">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}