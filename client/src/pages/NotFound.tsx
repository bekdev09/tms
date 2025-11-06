import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    // Use React Router navigation to prevent full page reloads
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-100 dark:bg-slate-900 text-center transition-colors duration-300">
      {/* Title */}
      <h1 className="text-7xl font-bold text-slate-800 dark:text-slate-100 mb-4">
        404
      </h1>

      {/* Subtitle */}
      <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
        Oops! The page you’re looking for doesn’t exist.
      </p>

      {/* Buttons */}
      <div className="flex gap-4">
        {/* Go Home */}
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium transition-colors duration-200"
        >
          <Home className="w-5 h-5" />
          Go Home
        </Link>

        {/* Go Back */}
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          Go Back
        </button>
      </div>

      {/* Footer */}
      {/* <div className="absolute bottom-6 text-xs text-slate-500 dark:text-slate-500">
        Designed with ❤️ using React + TailwindCSS
      </div> */}
    </div>
  );
};

export default NotFound;
