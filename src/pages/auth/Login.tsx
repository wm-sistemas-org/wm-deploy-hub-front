import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { authApi } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";
import { AlertCircle } from "lucide-react";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();
  const [errorMsg, setErrorMsg] = useState("");

  const loginMutation = useMutation({
    mutationFn: async () => {
      const tokenData = await authApi.login(email, password);
      // Temporarily set token manually to fetch /me correctly
      localStorage.setItem("token", tokenData.access_token);
      const user = await authApi.getMe();
      return { token: tokenData.access_token, user };
    },
    onSuccess: (data) => {
      login(data.token, data.user);
      navigate("/dashboard");
    },
    onError: (error: any) => {
      localStorage.removeItem("token");
      setErrorMsg(
        error.response?.data?.detail || "Email ou senha incorretos."
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Preencha todos os campos.");
      return;
    }
    setErrorMsg("");
    loginMutation.mutate();
  };

  return (
    <AuthLayout>
      <form className="space-y-6" onSubmit={handleSubmit}>
        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{errorMsg}</p>
              </div>
            </div>
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700"
          >
            Email address
          </label>
          <div className="mt-1">
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-700"
          >
            Password
          </label>
          <div className="mt-1">
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Button
            type="submit"
            className="w-full h-11"
            isLoading={loginMutation.isPending}
          >
            Entrar no portal
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
