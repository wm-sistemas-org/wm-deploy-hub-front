# Deploy do Frontend (Coolify / VPS)

Mesmo fluxo do frontend do **wm-crm**: build estático com Nixpacks, sem Docker.

## Variáveis de ambiente

| Variável | Quando usar | Descrição |
|----------|-------------|-----------|
| `VITE_API_URL` | Build time | URL base da API **incluindo** o prefixo (ex: `https://api.exemplo.com/api/v1`) |
| `NIXPACKS_NODE_VERSION` | Build | Versão do Node (ex: `24` ou `22`) |

## Configuração da API em runtime

O app carrega `/config.json` ao iniciar. Se existir, substitui a URL (útil para mudar API sem novo build).

**Edite `public/config.json` antes do build**, ou **substitua o arquivo em `dist/`** após o deploy (no mesmo diretório público do servidor):

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
