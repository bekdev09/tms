import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useChangePasswordMutation } from "../features/auth/authApi";

export type ApiResponse = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
};

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [changePassword] = useChangePasswordMutation();
  // PASSWORD STRENGTH CHECKER
  const getStrength = (password: string) => {
    if (!password) return "";

    let score = 0;

    // Length scoring
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // Character variety
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1; // symbols

    // Penalize obvious patterns
    const lower = password.toLowerCase();

    const commonPatterns = ["password", "123456", "qwerty", "letmein", "admin"];

    if (commonPatterns.some((pattern) => lower.includes(pattern))) {
      score = 1; // force Weak
    }

    // Penalize repetition (aaa, 111, !!!)
    if (/([a-zA-Z0-9!@#$%^&*])\1\1/.test(password)) {
      score -= 1;
    }

    // Penalize sequential letters or numbers (abcd, 1234)
    const sequences = ["abcdefghijklmnopqrstuvwxyz", "0123456789"];

    if (sequences.some((seq) => seq.includes(lower.substring(0, 4)))) {
      score -= 1;
    }

    // Final scoring
    if (score <= 1) return "Weak";
    if (score <= 3) return "Medium";
    if (score <= 5) return "Strong";
    return "Very Strong";
  };

  const strength = getStrength(newPassword);

  const validate = () => {
    const e: Record<string, string> = {};

    if (!currentPassword) e.currentPassword = "Current password is required";

    if (!newPassword) e.newPassword = "New password is required";
    else if (newPassword.length < 8)
      e.newPassword = "Must be at least 8 characters";

    if (!confirmPassword) e.confirmPassword = "Please confirm password";
    else if (newPassword !== confirmPassword)
      e.confirmPassword = "Passwords do not match";

    if (currentPassword && newPassword && currentPassword === newPassword)
      e.newPassword = "New password must be different";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSuccess(null);
    setMessage(null);

    if (!validate()) return;

    setLoading(true);

    try {

      await changePassword({
        currentPassword,
        newPassword,
      });
  
      // if (!res.ok || !data.ok) {
      //   setErrors(data.errors || {});
      //   setMessage(data.message || "Failed to change password");
      //   return;
      // }

      setMessage(null);
      setErrors({});
      setSuccess("Password updated successfully!");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => setSuccess(null), 4000);
    } catch {
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const EyeButton = ({
    show,
    onClick,
  }: {
    show: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className="absolute right-3 inset-y-0 flex items-center text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-white"
    >
      {show ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );

  const strengthColor =
    strength === "Weak"
      ? "text-red-500"
      : strength === "Medium"
      ? "text-yellow-500"
      : strength === "Strong"
      ? "text-green-500"
      : "text-emerald-400";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-white">
            Change Password
          </h2>
          <p className="text-center text-slate-600 dark:text-slate-400 mb-6">
            Keep your account secure by updating your password
          </p>

          {/* SUCCESS */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400 text-sm">
              {success}
            </div>
          )}

          {/* ERROR */}
          {message && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Current password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 outline-none"
                />
                <EyeButton
                  show={showCurrent}
                  onClick={() => setShowCurrent(!showCurrent)}
                />
              </div>
              {errors.currentPassword && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.currentPassword}
                </p>
              )}
            </div>

            {/* New password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 outline-none"
                />
                <EyeButton
                  show={showNew}
                  onClick={() => setShowNew(!showNew)}
                />
              </div>

              {/* Strength Meter */}
              {newPassword && (
                <p className={`text-sm mt-1 font-medium ${strengthColor}`}>
                  Strength: {strength}
                </p>
              )}

              {errors.newPassword && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.newPassword}
                </p>
              )}
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 outline-none"
                />
                <EyeButton
                  show={showConfirm}
                  onClick={() => setShowConfirm(!showConfirm)}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? "Saving..." : "Change Password"}
            </button>

            {/* Reset */}
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setErrors({});
                setMessage(null);
                setSuccess(null);
              }}
              className="w-full text-sm text-blue-600 dark:text-cyan-400 hover:underline text-center mt-2"
            >
              Reset fields
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
