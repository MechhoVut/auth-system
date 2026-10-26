import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function PasswordInput({ name, value, onChange, placeholder }) {
  const [show, setShow] = useState(false);

  return (
    <div className="password-wrap">
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
      />
      <button
        type="button"
        className="eye"
        onClick={() => setShow(!show)}
        aria-label="Show or hide password"
      >
        {show ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>
  );
}