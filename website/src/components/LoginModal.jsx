import React, { useEffect, useRef, useState, useContext } from "react";
import GoogleLoginButton from "./GoogleLoginButton";
import { AuthContext } from "../context/AuthContext";

const Tab = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-t-md ${
      active ? "bg-white text-yellow-900 font-semibold" : "text-gray-500"
    }`}
  >
    {children}
  </button>
);

const LoginModal = ({ open, onClose }) => {
  const modalRef = useRef(null);
  const [tab, setTab] = useState("login");
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  // signup fields
  const [fullName, setFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [pwdChecks, setPwdChecks] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // click outside to close
  useEffect(() => {
    const onDocClick = (e) => {
      if (!open) return;
      if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open, onClose]);

  const { login } = useContext(AuthContext);

  const API_URL = import.meta.env?.VITE_API_URL || "http://localhost:5000/api";

  async function handleGoogleCredential(credential) {
    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });
      if (!res.ok) throw new Error("Auth failed");
      const data = await res.json();
      login(data.user);
      onClose();
    } catch (err) {
      console.error("Google login failed", err);
      alert("Google login failed");
    }
  }

  if (!open) return null;

  return (
    // solid overlay background with blur
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-hidden
      />

      {/* modal frame: solid center card */}
      <div ref={modalRef} className="relative max-w-md w-full mx-4">
        {/* center solid content */}
        <div className="bg-white rounded-xl shadow-lg w-full p-6 z-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {tab === "login" ? "Login" : "Sign up"}
            </h3>
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="mb-4">
            <div className="inline-flex rounded-md bg-gray-100 p-1">
              <Tab active={tab === "login"} onClick={() => setTab("login")}>
                Login
              </Tab>
              <Tab active={tab === "signup"} onClick={() => setTab("signup")}>
                Sign up
              </Tab>
            </div>
          </div>

          <div>
            {tab === "login" ? (
              <div>
                {showForgot ? (
                  <div className="grid gap-3">
                    {forgotSent ? (
                      <div className="p-3 text-sm text-green-700">
                        If the account exists, a password reset link has been
                        sent.
                      </div>
                    ) : (
                      <>
                        <input
                          value={forgotIdentifier}
                          onChange={(e) => setForgotIdentifier(e.target.value)}
                          className="px-3 py-2 border rounded"
                          placeholder="Email or phone"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (forgotIdentifier) setForgotSent(true);
                            }}
                            className="mt-2 bg-yellow-900 text-white px-4 py-2 rounded"
                          >
                            Send reset
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowForgot(false)}
                            className="mt-2 px-4 py-2 rounded border"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <form
                    className="grid gap-3"
                    onSubmit={(e) => e.preventDefault()}
                  >
                    <input
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      className="px-3 py-2 border rounded"
                      placeholder="Email or phone"
                    />
                    <input
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      type="password"
                      className="px-3 py-2 border rounded"
                      placeholder="Password"
                    />
                    <button
                      type="button"
                      className="mt-2 bg-yellow-900 text-white px-4 py-2 rounded"
                    >
                      Login
                    </button>
                    <div className="flex flex-col gap-2 mt-2">
                      <div className="text-sm text-gray-500 flex items-center justify-between">
                        <span>Or continue with</span>
                        <button
                          type="button"
                          onClick={() => {
                            setShowForgot(true);
                            setForgotSent(false);
                            setForgotIdentifier(loginIdentifier);
                          }}
                          className="text-blue-600"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="flex justify-center">
                        <GoogleLoginButton
                          clientId={import.meta.env?.VITE_GOOGLE_CLIENT_ID}
                          onCredential={handleGoogleCredential}
                        />
                      </div>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <form className="grid gap-3" onSubmit={(e) => e.preventDefault()}>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="px-3 py-2 border rounded"
                  placeholder="Full name"
                />
                <input
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="px-3 py-2 border rounded"
                  placeholder="Email"
                />
                <input
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  className="px-3 py-2 border rounded"
                  placeholder="Phone number"
                />
                <input
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  type="password"
                  className="px-3 py-2 border rounded"
                  placeholder="Password"
                />

                {/* password strength */}
                <PasswordStrength
                  password={signupPassword}
                  onChange={setPwdChecks}
                />

                <button
                  type="button"
                  disabled={
                    !(
                      pwdChecks.length &&
                      pwdChecks.upper &&
                      pwdChecks.lower &&
                      pwdChecks.number &&
                      pwdChecks.special &&
                      signupEmail &&
                      signupPhone
                    )
                  }
                  className="mt-2 bg-yellow-900 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  Create account
                </button>
              </form>
            )}
          </div>
        </div>

        {/* (glass sides removed) */}
      </div>
    </div>
  );
};

export default LoginModal;

// Password strength component
const PasswordStrength = ({ password, onChange }) => {
  useEffect(() => {
    const checks = {
      length: password.length > 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };
    onChange && onChange(checks);
  }, [password, onChange]);

  return (
    <div className="text-sm">
      <div className="font-medium">Password must include:</div>
      <ul className="mt-1 space-y-1">
        <li className="flex items-center gap-2">
          <span className="w-2 h-2 bg-gray-300 rounded-full" /> At least 9
          characters
        </li>
        <li className="flex items-center gap-2">
          <span className="w-2 h-2 bg-gray-300 rounded-full" /> Uppercase letter
        </li>
        <li className="flex items-center gap-2">
          <span className="w-2 h-2 bg-gray-300 rounded-full" /> Lowercase letter
        </li>
        <li className="flex items-center gap-2">
          <span className="w-2 h-2 bg-gray-300 rounded-full" /> A number
        </li>
        <li className="flex items-center gap-2">
          <span className="w-2 h-2 bg-gray-300 rounded-full" /> A special
          character
        </li>
      </ul>
    </div>
  );
};
