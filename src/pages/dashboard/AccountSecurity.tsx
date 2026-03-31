import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "../../api/auth";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { AlertCircle, CheckCircle2, KeyRound } from "lucide-react";

export function AccountSecurity() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [clientError, setClientError] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      authApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setClientError("");
    },
    onError: (error: { response?: { data?: { detail?: string | unknown } } }) => {
      const detail = error.response?.data?.detail;
      setClientError(
        typeof detail === "string"
          ? detail
          : "Não foi possível alterar a senha. Tente novamente."
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.reset();
    setClientError("");
    if (newPassword.length < 8) {
      setClientError("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setClientError("A confirmação não coincide com a nova senha.");
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Conta e segurança</h1>
        <p className="mt-1 text-sm text-slate-500">
          Atualize sua senha de acesso ao portal.
        </p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-brand-600" />
            <CardTitle className="text-lg">Alterar senha</CardTitle>
          </div>
          <CardDescription>
            Informe sua senha atual e escolha uma nova senha forte.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mutation.isSuccess && (
            <div className="mb-4 flex gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <p>Senha alterada com sucesso. Use a nova senha no próximo login.</p>
            </div>
          )}
          {clientError && (
            <div className="mb-4 flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p>{clientError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="current-password"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Senha atual
              </label>
              <Input
                id="current-password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label
                htmlFor="new-password"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Nova senha
              </label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
              <p className="mt-1 text-xs text-slate-500">Mínimo de 8 caracteres.</p>
            </div>
            <div>
              <label
                htmlFor="confirm-password"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Confirmar nova senha
              </label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <Button
              type="submit"
              className="w-full sm:w-auto"
              isLoading={mutation.isPending}
            >
              Salvar nova senha
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
