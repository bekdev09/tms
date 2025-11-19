import { useState } from "react";
import ThemeToggle from "../ThemeToggle";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAppDispatch } from "../../store/hooks";
import { useLogoutMutation } from "../../features/auth";
import { clearAuth } from "../../features/auth/authSlice";

type Props = {
  user: any;
};

export default function UserMenu({ user }: Props) {
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activePanel, setActivePanel] = useState<
    "menu" | "profile" | "notifications" | "billing" | "integrations" | "help"
  >("menu");

  const dispatch = useAppDispatch();
  const [logoutMutation] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (e) {
      console.warn("logout failed", e);
    } finally {
      dispatch(clearAuth());
      navigate("/login");
    }
  };

  const fullName = (user as any)?.name ?? (user as any)?.fullName ?? "—";
  const email = user?.email ?? "—";
  const phone = (user as any)?.phone ?? "—";
  const username =
    (user as any)?.username ?? (user?.email ? user.email.split("@")[0] : "—");
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "—";
  const initials =
    fullName && fullName !== "—"
      ? fullName
          .split(" ")
          .map((s: string) => s[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : username && username !== "—"
      ? username.slice(0, 1).toUpperCase()
      : "U";

  return (
    <div className="relative">
      <button
        onClick={() => {
          setShowUserMenu((s) => !s);
          setActivePanel("menu");
        }}
        aria-haspopup="true"
        aria-expanded={showUserMenu}
        className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-200 font-semibold shadow-sm hover:shadow-md transition-all"
        title="Account"
      >
        {initials}
      </button>

      {showUserMenu && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl shadow-lg z-50">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            {/* Header / Back */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-200 font-semibold">
                  {initials}
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {fullName}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {email}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activePanel !== "menu" ? (
                  <button
                    onClick={() => setActivePanel("menu")}
                    className="px-2 py-1 text-sm rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    ← Back
                  </button>
                ) : (
                  <button
                    onClick={() => setShowUserMenu(false)}
                    aria-label="Close"
                    className="px-2 py-1 text-sm rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-4 text-sm text-slate-700 dark:text-slate-200 max-h-[60vh] overflow-auto">
              {activePanel === "menu" && (
                <div className="space-y-2">
                  <button
                    onClick={() => setActivePanel("profile")}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    Profile / Account
                  </button>

                  <button
                    onClick={() => setActivePanel("notifications")}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    Notifications
                  </button>

                  <button
                    onClick={() => setActivePanel("billing")}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    Billing
                  </button>

                  <button
                    onClick={() => setActivePanel("integrations")}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    Settings & Integrations
                  </button>

                  <button
                    onClick={() => setActivePanel("help")}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    Help
                  </button>
                </div>
              )}

              {activePanel === "profile" && (
                <div className="space-y-4">
                  {/* Account Information */}
                  <div>
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                      Account Information
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex justify-between">
                        <div className="text-slate-600 dark:text-slate-300">
                          Full Name
                        </div>
                        <div className="text-slate-900 dark:text-slate-100">
                          {fullName}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <div className="text-slate-600 dark:text-slate-300">
                          Email
                        </div>
                        <div className="text-slate-900 dark:text-slate-100">
                          {email}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <div className="text-slate-600 dark:text-slate-300">
                          Phone
                        </div>
                        <div className="text-slate-900 dark:text-slate-100">
                          {phone}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <div className="text-slate-600 dark:text-slate-300">
                          Username
                        </div>
                        <div className="text-slate-900 dark:text-slate-100">
                          {username}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preferences */}
                  <div>
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                      Preferences
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center justify-between">
                        <div className="text-slate-600 dark:text-slate-300">
                          Language
                        </div>
                        <div className="text-slate-900 dark:text-slate-100">
                          English
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-slate-600 dark:text-slate-300">
                          Theme
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-slate-900 dark:text-slate-100 text-sm">
                            Appearance
                          </div>
                          <ThemeToggle />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-slate-600 dark:text-slate-300">
                          Timezone
                        </div>
                        <div className="text-slate-900 dark:text-slate-100 text-sm">
                          {timezone}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Security */}
                  <div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                          🔐 Security
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {/* Change Password - first and prominent */}
                      <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-700">
                        <div>
                          <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            Change Password
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Update your password regularly
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            navigate("/dashboard/change-password");
                          }}
                          className="px-3 py-1 rounded-md bg-slate-100 dark:bg-slate-600 text-slate-800 dark:text-slate-100"
                        >
                          Change
                        </button>
                      </div>

                      <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                        <div>
                          <div className="text-sm text-slate-900 dark:text-slate-100">
                            Two-Factor Authentication
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Manage 2FA methods
                          </div>
                        </div>
                        <button className="px-3 py-1 rounded-md border text-slate-800 dark:text-slate-100">
                          Manage
                        </button>
                      </div>

                      <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                        <div>
                          <div className="text-sm text-slate-900 dark:text-slate-100">
                            Login Activity
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Recent sign-ins
                          </div>
                        </div>
                        <button className="px-3 py-1 rounded-md border text-slate-800 dark:text-slate-100">
                          View
                        </button>
                      </div>

                      <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                        <div>
                          <div className="text-sm text-slate-900 dark:text-slate-100">
                            Active Sessions
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Manage devices
                          </div>
                        </div>
                        <button className="px-3 py-1 rounded-md border text-slate-800 dark:text-slate-100">
                          Manage
                        </button>
                      </div>

                      <div className="text-xs text-slate-500 dark:text-slate-400 px-3 pt-1">
                        Password requirements: minimum 8 characters, one
                        uppercase, one number. (Helper text)
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Simple placeholders for other panels */}
              {activePanel === "notifications" && (
                <div className="text-sm text-slate-700 dark:text-slate-200">
                  <div className="mb-2 font-medium">Notifications</div>
                  <div className="text-slate-500 dark:text-slate-400">
                    Manage alert and email preferences.
                  </div>
                </div>
              )}

              {activePanel === "billing" && (
                <div className="text-sm text-slate-700 dark:text-slate-200">
                  <div className="mb-2 font-medium">Billing</div>
                  <div className="text-slate-500 dark:text-slate-400">
                    View invoices and payment methods.
                  </div>
                </div>
              )}

              {activePanel === "integrations" && (
                <div className="text-sm text-slate-700 dark:text-slate-200">
                  <div className="mb-2 font-medium">
                    Settings & Integrations
                  </div>
                  <div className="text-slate-500 dark:text-slate-400">
                    Connect apps and manage integrations.
                  </div>
                </div>
              )}

              {activePanel === "help" && (
                <div className="text-sm text-slate-700 dark:text-slate-200">
                  <div className="mb-2 font-medium">Help</div>
                  <div className="text-slate-500 dark:text-slate-400">
                    Support articles, contact support, and FAQs.
                  </div>
                </div>
              )}
              {/* Logout Confirmation */}
              <div className="mt-1 pt-1 border-t border-slate-100 dark:border-slate-700">
                <button
                  onClick={() => setConfirming(true)}
                  aria-label="Logout"
                  title="Logout"
                  className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-red-600 dark:text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
              {confirming && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                  <div
                    className="absolute inset-0 bg-black opacity-30"
                    onClick={() => setConfirming(false)}
                    aria-hidden
                  />
                  <div
                    className="bg-white dark:bg-slate-800 rounded-xl p-6 z-10 shadow-lg"
                    role="dialog"
                    aria-modal="true"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="mb-4 text-slate-800 dark:text-slate-200">
                      Are you sure you want to logout?
                    </p>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setConfirming(false)}
                        className="px-4 py-2 rounded-lg border dark:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          setConfirming(false);
                          await handleLogout();
                        }}
                        className="px-4 py-2 rounded-lg bg-red-500 text-white"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
