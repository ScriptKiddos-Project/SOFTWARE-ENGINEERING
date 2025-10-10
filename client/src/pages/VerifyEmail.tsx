import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingSpinner from "../components/common/LoadingSpinner";

const VerifyEmail = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");
      if (!token) {
        setStatus("error");
        setMessage("Invalid or missing verification token.");
        return;
      }

      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/auth/verify-email?token=${token}`);
        if (res.data.success) {
          setStatus("success");
          setMessage("Your email has been verified successfully! Redirecting to login...");
          setTimeout(() => navigate("/login"), 2500);
        } else {
          setStatus("error");
          setMessage(res.data.message || "Email verification failed.");
        }
      } catch (err: any) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Verification link expired or invalid.");
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      {status === "loading" && (
        <>
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Verifying your email...</p>
        </>
      )}

      {status === "success" && (
        <div className="p-8 bg-white rounded-2xl shadow-md text-center">
          <h1 className="text-2xl font-semibold text-green-600 mb-2">✅ Email Verified!</h1>
          <p>{message}</p>
        </div>
      )}

      {status === "error" && (
        <div className="p-8 bg-white rounded-2xl shadow-md text-center">
          <h1 className="text-2xl font-semibold text-red-600 mb-2">❌ Verification Failed</h1>
          <p>{message}</p>
        </div>
      )}
    </div>
  );
};

export default VerifyEmail;
