import { ArrowRight, Check, Layers3 } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store";

interface AuthPageProps {
  mode: "sign-in" | "sign-up";
}

const AuthPage: React.FC<AuthPageProps> = ({ mode }) => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const signIn = useAuthStore((state) => state.signIn);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    window.setTimeout(() => {
      signIn();
      navigate("/dashboard");
    }, 500);
  };

  return (
    <main className="auth-layout">
      <section className="auth-showcase">
        <Link className="logo" to="/">
          <span>W</span> Weblio
        </Link>
        <div>
          <span className="eyebrow light">Visual development, refined</span>
          <h1>
            Build the web
            <br />
            without boundaries.
          </h1>
          <p>
            A professional canvas for turning ambitious ideas into responsive
            websites.
          </p>
          <ul>
            <li>
              <Check />
              Design with production-ready layout tools
            </li>
            <li>
              <Check />
              Create responsive experiences visually
            </li>
            <li>
              <Check />
              Keep every project in one focused workspace
            </li>
          </ul>
        </div>
        <span className="showcase-footer">
          Crafted for teams who care about details.
        </span>
      </section>
      <section className="auth-form-area">
        <form className="auth-form" onSubmit={submit}>
          <div className="mobile-logo">
            <Layers3 /> Weblio
          </div>
          <span className="eyebrow">Welcome to Weblio</span>
          <h2>
            {mode === "sign-in"
              ? "Sign in to your workspace"
              : "Create your workspace"}
          </h2>
          <p>
            {mode === "sign-in"
              ? "Continue building where you left off."
              : "Start designing your first site in minutes."}
          </p>
          {mode === "sign-up" && (
            <label className="field">
              <span>Full name</span>
              <input required autoComplete="name" placeholder="Alex Morgan" />
            </label>
          )}
          <label className="field">
            <span>Email address</span>
            <input
              required
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              defaultValue="alex@northstar.design"
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              required
              type="password"
              autoComplete={
                mode === "sign-in" ? "current-password" : "new-password"
              }
              minLength={8}
              defaultValue="password"
            />
          </label>
          <button
            type="submit"
            className="button primary auth-submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Opening workspace…"
              : mode === "sign-in"
                ? "Sign in"
                : "Create account"}
            <ArrowRight />
          </button>
          <p className="auth-switch">
            {mode === "sign-in" ? "New to Weblio?" : "Already have an account?"}{" "}
            <Link to={mode === "sign-in" ? "/auth/sign-up" : "/auth/sign-in"}>
              {mode === "sign-in" ? "Create an account" : "Sign in"}
            </Link>
          </p>
          <div className="mock-notice">
            Demo authentication — no credentials leave your browser.
          </div>
        </form>
      </section>
    </main>
  );
};

export default AuthPage;
