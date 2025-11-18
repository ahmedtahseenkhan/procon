import { useState } from "react";
import logoMark from "../../assets/logos/logo-mark.svg";

interface LoginFormProps {
  onSubmit: (username: string, password: string) => Promise<void>;
  loading: boolean;
  error: string;
}

export default function LoginForm({
  onSubmit,
  loading,
  error,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = String(formData.get("username") || "");
    const password = String(formData.get("password") || "");
    await onSubmit(username, password);
  };

  return (
    <div className="min-h-screen bg-gray-100 bg-[#F9FAFB] flex items-center justify-center py-12">
      <div className="w-full px-4 md:w-[582px]">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 rounded-[4px] p-[40px] border-[rgba(0,0,51,0.0588)]">
          {/* Logo and Brand */}
          <div className="mb-4">
            <div className="flex items-center">
              <img src={logoMark} alt="Procon logo" className="w-10 h-10" />
              <span className="ml-3 text-2xl font-bold text-primary-600">
                Procon Gaming
              </span>
            </div>
            <h2 className="mt-4 text-[20px] font-bold text-black">
              Log in to your account
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-red-400 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-red-700 text-sm font-medium">
                    {error}
                  </span>
                </div>
              </div>
            )}

            <div>
              {/* <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label> */}
              <label
                htmlFor="email"
                className="block mb-2 text-[14px] font-[510] leading-[18px] tracking-[0.25px] text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                name="username"
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                placeholder="reginaphanalge@mail.com"
                disabled={loading}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block mb-2 text-[14px] font-[510] leading-[18px] tracking-[0.25px] text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                {/* <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your password"
                  disabled={loading}
                /> */}
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-md bg-transparent focus:outline-none  transition"
                  disabled={loading}
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5 text-black"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-black"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="text-sm w-full h-8 flex items-center justify-center gap-2 bg-primary-600 text-white rounded-md px-3 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="font-sans font-light text-sm text-gray-600 ">
              Don't have an account?{" "}
              <a href="#" className="text-black font-light ml-3">
                Register
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
