import React from "react";
import { Button } from "./ui/button";
// @ts-ignore: allow importing svg without type declarations
import googleLogo from "../assets/google_logo.svg";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { firebaseConfig } from "@/config/firebase";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/lib/AuthContext";

const LogIn = () => {
  const provider = new GoogleAuthProvider();
  const auth = getAuth(firebaseConfig);
  const navigate = useNavigate();
  const { loginWithGoogle, loginWithEmail } = useAuth();
  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
  });

  const handleFormDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const user = result.user;

      if (credential && credential.accessToken && user) {
        // Store user info in auth context
        loginWithGoogle(user, credential.accessToken);

        // Store display info
        const displayName = user.displayName || "";
        const displayPhoto = user.photoURL || "";
        localStorage.setItem("ProfileName", displayName);
        localStorage.setItem("Photo", displayPhoto);

        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Google login error:", error.message);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = result.user;
      const token = await user.getIdToken();

      if (token && user) {
        loginWithEmail(user, token);
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Email login error:", error.message);
    }
  };
  return (
    <div className="flex flex-col justify-center items-center p-4 gap-4 border rounded-lg">
      <form
        onSubmit={handleEmailLogin}
        className="flex flex-col items-start gap-1"
      >
        <span className="text-3 font-bold">Email</span>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleFormDataChange}
          className="w-[363px] h-12 rounded-lg border border-gray-300 px-4 text-[18px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <span className="text-3 font-bold">Password</span>
        <input
          type="password"
          name="password"
          placeholder="Enter your Password"
          value={formData.password}
          onChange={handleFormDataChange}
          className="w-[363px] h-12 rounded-lg border border-gray-300 px-4 text-[18px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <Button
          type="submit"
          className="w-[363px] h-14 mt-10 rounded-2xl bg-indigo-600 hover:bg-indigo-800 text-white text-lg font-bold"
        >
          Log in
        </Button>
        <span className="">
          Don't have an account? Click <Link to="/signup">here</Link>
        </span>
      </form>
      <span className="text-lg text-slate-500 font-bold">OR</span>
      <Button
        className="w-[363px] h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-800 text-white text-[21px] font-bold"
        onClick={handleGoogleLogin}
      >
        <div className="flex flex-row justify-center items-center">
          <img src={googleLogo} alt="google-logo" className="mr-7" />
          Log in with Google
        </div>
      </Button>
    </div>
  );
};

export default LogIn;
