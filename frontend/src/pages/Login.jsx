import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthCard, { ErrorMessage, SubmitButton } from "../components/AuthCard.jsx";
import AuthInput from "../components/AuthInput.jsx";
import { LockIcon, UserIcon } from "../components/icons.jsx";
import { api, saveToken } from "../api/client.js";

import { saveUser } from "../api/session.js";
// after: saveToken(data.token, form.remember);
// saveUser(data.user ?? { name: form.username.trim() }, form.remember);

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email.trim() || !form.password) {
      setError("Enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const data = await api.login({ email: form.email.trim(), password: form.password });
        // Save the authentication token returned by the backend.
  saveToken(data.token, form.remember);

  // Save user details for display in the frontend.
  saveUser(
    data.user ?? {
      name: form.email.trim(),
      email: form.email.trim(),
    },
    form.remember
  );
      navigate(data.user?.role === "complaint_officer" ? "/officer" : "/Dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Login">
      <form onSubmit={handleSubmit} noValidate>
        <AuthInput
          icon={<UserIcon />}
          type="email"          
          name="email"
          placeholder="Email"
          autoComplete="email"
          value={form.email}
          onChange={update}
        />
        <AuthInput
          icon={<LockIcon />}
          type="password"
          name="password"
          placeholder="Password"
          autoComplete="current-password"
          value={form.password}
          onChange={update}
        />

        <div className="mx-0.5 mb-4.5 mt-0.5 flex items-center justify-between gap-2.5 text-[0.74rem]">
          <label className="flex cursor-pointer items-center gap-1.75">
            <input
              type="checkbox"
              name="remember"
              checked={form.remember}
              onChange={update}
              className="h-3.25 w-3.25 accent-amber-300"
            />
            Remember me
          </label>
          <a href="#" className="hover:underline">Forgot password?</a>
        </div>

        <ErrorMessage>{error}</ErrorMessage>
        <SubmitButton loading={loading}>{loading ? "Signing in…" : "Login"}</SubmitButton>
      </form>

      <p className="mt-4.5 text-center text-xs">
        Don't have an account?{" "}
        <Link to="/signup" className="font-bold hover:underline">Register</Link>
      </p>
    </AuthCard>
  );
}
