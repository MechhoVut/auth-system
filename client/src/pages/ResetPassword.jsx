import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import PasswordInput from "../components/PasswordInput";
import { passwordRules } from "../utils/passwordRules";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const allRulesPass = passwordRules.every((r) => r.test(form.password));
  const passwordsMatch =
    form.confirmPassword !== "" && form.password === form.confirmPassword;
  const canSubmit = allRulesPass && passwordsMatch && !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, form);
      toast.success(data.message);
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Set new password</h2>
      <form onSubmit={handleSubmit}>
        <PasswordInput
          name="password"
          placeholder="New password"
          value={form.password}
          onChange={handleChange}
        />

        <ul className="rules">
          {passwordRules.map((r) => (
            <li key={r.label} className={r.test(form.password) ? "ok" : "bad"}>
              {r.test(form.password) ? "✔" : "✖"} {r.label}
            </li>
          ))}
        </ul>

        <PasswordInput
          name="confirmPassword"
          placeholder="Confirm new password"
          value={form.confirmPassword}
          onChange={handleChange}
        />
        {form.confirmPassword && !passwordsMatch && (
          <p className="error">Passwords do not match</p>
        )}

        <button type="submit" disabled={!canSubmit}>
          {loading ? "Saving..." : "Reset password"}
        </button>
      </form>
      <p className="switch">
        <Link to="/login">Back to login</Link>
      </p>
    </div>
  );
}