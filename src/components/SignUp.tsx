import React from "react";
import { Button } from "./ui/button";
import {
  getAuth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
} from "firebase/auth";
import { firebaseConfig } from "../config/firebase";
import { useNavigate } from "react-router";

const SignUp = () => {
  const auth = getAuth(firebaseConfig);
  const navigate = useNavigate();
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
  const handleSignUp = async () => {
    await createUserWithEmailAndPassword(
      auth,
      formData.email,
      formData.password
    )
      .then((userCredential) => {
        const user = userCredential.user;
        if (user) {
          navigate("/login");
        }
      })
      .catch((error) => {
        alert(error.message);
      });
  };
  return (
    <div className="flex flex-col justify-center items-center p-4 gap-4 border rounded-lg">
      <div className="flex flex-col items-start gap-1">
        <span className="text-3 font-bold ">Email</span>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleFormDataChange}
          className="w-[363px] h-12 rounded-lg border border-gray-300 px-4 text-[18px] focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-3 font-bold ">Password</span>
        <input
          type="password"
          name="password"
          placeholder="Enter your Password"
          value={formData.password}
          onChange={handleFormDataChange}
          className="w-[363px] h-12 rounded-lg border border-gray-300 px-4 text-[18px]  focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button
          className="w-[363px] h-14 my-10 rounded-lg bg-indigo-600 hover:bg-indigo-800 text-white text-lg font-bold"
          onClick={handleSignUp}
        >
          Sign Up
        </Button>
      </div>
    </div>
  );
};

export default SignUp;
