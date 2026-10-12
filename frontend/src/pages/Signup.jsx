import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthCard, { ErrorMessage, SubmitButton } from "../components/AuthCard.jsx";
import AuthInput from "../components/AuthInput.jsx";
import { LockIcon, MailIcon, UserIcon } from "../components/icons.jsx";
import { api } from "../api/client.js";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", terms: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const validate = () => {
    if (!form.name.trim()) return "Enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Enter a valid email address.";
    if (form.password.length < 8) return "Password must be at least 8 characters.";
    if (!form.terms) return "Accept the terms to create an account.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    setError("");
    setLoading(true);
    try {
      await api.register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      navigate("/login"); // account created, now log in
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Sign Up">
      <form onSubmit={handleSubmit} noValidate>
        <AuthInput
          icon={<UserIcon />}
          name="name"
          placeholder="Full name"
          autoComplete="name"
          value={form.name}
          onChange={update}
        />
        <AuthInput
          icon={<MailIcon />}
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
          autoComplete="new-password"
          value={form.password}
          onChange={update}
        />

        <div className="mx-0.5 mb-4.5 mt-0.5 text-[0.74rem]">
          <label className="flex cursor-pointer items-center gap-1.75">
            <input
              type="checkbox"
              name="terms"
              checked={form.terms}
              onChange={update}
              className="h-3.25 w-3.25 accent-amber-300"
            />
            I agree to the terms
          </label>
        </div>

        <ErrorMessage>{error}</ErrorMessage>
        <SubmitButton loading={loading}>{loading ? "Creating account…" : "Create account"}</SubmitButton>
      </form>

      <p className="mt-4.5 text-center text-xs">
        Already have an account?{" "}
        <Link to="/login" className="font-bold hover:underline">Login</Link>
      </p>
    </AuthCard>
  );
}
