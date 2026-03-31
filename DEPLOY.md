# Deploy do Frontend (Coolify / VPS)

Mesmo fluxo do frontend do **wm-crm**: build estático com Nixpacks, sem Docker.

## Variáveis de ambiente

| Variável | Quando usar | Descrição |
|----------|-------------|-----------|
| `VITE_API_URL` | Build time | URL base da API **incluindo** o prefixo (ex: `https://api.exemplo.com/api/v1`) |
| `VITE_PUBLIC_ORG_SLUG` | Build time (opcional) | Slug da org cujo **portal de downloads** abre em `/`. Gestão de instaladores permanece em `/dashboard`. |
| `NIXPACKS_NODE_VERSION` | Build | Versão do Node (ex: `24` ou `22`) |

## Configuração da API em runtime

O app carrega `/config.json` ao iniciar. **Só altera a URL da API se o JSON tiver `VITE_API_URL` preenchido** (string não vazia). O repositório usa `{}` para desenvolvimento: vale o `VITE_API_URL` do `.env` / build.

**Em produção**, edite antes do build ou **substitua só o `config.json` no servidor** após o deploy:

```json
{
  "VITE_API_URL": "https://api.seudominio.com/api/v1"
}
```

> Com frontend em HTTPS, use `https://` na API para evitar mixed content.

## CORS no backend

No backend, inclua a origem exata do frontend em `ALLOWED_ORIGINS` (ou equivalente), sem barra final, separadas por vírgula.

## Checklist

1. [ ] Backend permite a origem do frontend (CORS)
2. [ ] `config.json` ou `VITE_API_URL` no build com a URL correta da API (com `/api/v1` se aplicável)
3. [ ] HTTPS em produção quando o site for HTTPS
