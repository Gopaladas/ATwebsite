import GaintLogo from "../assets/Gaint_logo.png";
import { Link } from "react-router-dom";

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <img src={GaintLogo} alt="Gaint Logo" className="h-14 mx-auto mb-4" />

        <h2 className="text-2xl font-bold text-center mb-6">
          Attendance System Login
        </h2>

        <form className="space-y-4">
          <input
            type="email"
            placeholder="Enter Your Email"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            placeholder="Enter Your Password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-right text-sm">
            <Link
              to="/forgot-password"
              className="text-blue-600 hover:underline"
            >
              Forgot password?
            </Link>
          </p>
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
            Login
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Don’t have an account?
          <Link to="/signup" className="text-blue-600 ml-1 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
