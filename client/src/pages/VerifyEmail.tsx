// import { useEffect, useState } from "react";
// import { useSearchParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import LoadingSpinner from "../components/common/LoadingSpinner";

// const VerifyEmail = () => {
//   const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
//   const [message, setMessage] = useState("");
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();

//   useEffect(() => {
//     const verifyEmail = async () => {
//       const token = searchParams.get("token");
//       if (!token) {
//         setStatus("error");
//         setMessage("Invalid or missing verification token.");
//         return;
//       }

//       try {
//         const res = await axios.get(`${import.meta.env.VITE_API_URL}/auth/verify-email?token=${token}`);
//         if (res.data.success) {
//           setStatus("success");
//           setMessage("Your email has been verified successfully! Redirecting to login...");
//           setTimeout(() => navigate("/login"), 2500);
//         } else {
//           setStatus("error");
//           setMessage(res.data.message || "Email verification failed.");
//         }
//       } catch (err: any) {
//         setStatus("error");
//         setMessage(err.response?.data?.message || "Verification link expired or invalid.");
//       }
//     };

//     verifyEmail();
//   }, [searchParams, navigate]);

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
//       {status === "loading" && (
//         <>
//           <LoadingSpinner />
//           <p className="mt-4 text-gray-600">Verifying your email...</p>
//         </>
//       )}

//       {status === "success" && (
//         <div className="p-8 bg-white rounded-2xl shadow-md text-center">
//           <h1 className="text-2xl font-semibold text-green-600 mb-2">✅ Email Verified!</h1>
//           <p>{message}</p>
//         </div>
//       )}

//       {status === "error" && (
//         <div className="p-8 bg-white rounded-2xl shadow-md text-center">
//           <h1 className="text-2xl font-semibold text-red-600 mb-2">❌ Verification Failed</h1>
//           <p>{message}</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default VerifyEmail;


import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Loader2, CheckCircle2, XCircle, Mail } from 'lucide-react';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. No token provided.');
        return;
      }

      try {
        const response = await authService.verifyEmail(token);
        setStatus('success');
        setMessage('Email verified successfully! You can now log in to your account.');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error: any) {
        setStatus('error');
        setMessage(
          error.response?.data?.message || 
          'Email verification failed. The link may have expired or is invalid.'
        );
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === 'loading' && (
            <>
              <div className="flex justify-center mb-4">
                <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
              </div>
              <CardTitle>Verifying Your Email</CardTitle>
              <CardDescription>Please wait while we verify your email address...</CardDescription>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-16 w-16 text-green-600" />
              </div>
              <CardTitle className="text-green-600">Email Verified!</CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="flex justify-center mb-4">
                <XCircle className="h-16 w-16 text-red-600" />
              </div>
              <CardTitle className="text-red-600">Verification Failed</CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {status === 'success' && (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Redirecting to login page in 3 seconds...
              </p>
              <Button 
                onClick={() => navigate('/login')}
                className="w-full"
              >
                Go to Login
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/register')}
                className="w-full"
                variant="default"
              >
                <Mail className="mr-2 h-4 w-4" />
                Register Again
              </Button>
              <Button 
                onClick={() => navigate('/login')}
                className="w-full"
                variant="outline"
              >
                Back to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;
