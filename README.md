# NotionGPT

Send a prompt to OpenAI and write the completion into a Notion page. React +
Vite client, Express/MongoDB server, authenticating to Notion via OAuth.

## Prerequisites

- **Node.js 18+** (the server relies on the global `fetch` built into Node 18+)
- **npm**
- **MongoDB** — either a local `mongod` or a MongoDB Atlas cluster
- An **OpenAI API key** — https://platform.openai.com/api-keys
- A **public Notion integration** — https://www.notion.so/my-integrations
  - It must be a *Public* integration; a private/internal one has no OAuth flow.
  - Register `http://localhost:3000/home/` as a redirect URI, exactly.

## Setup

```bash
git clone https://github.com/akhiljerald/NotionGPT.git
cd NotionGPT
```

Create both env files from their templates and fill them in:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

`server/.env` holds the secrets (OpenAI key, Notion OAuth client secret, Mongo
URI). `client/.env` holds only public values — Vite inlines every `VITE_*` var
into the JS bundle, so a secret placed there ships to the browser.

`OAUTH_REDIRECT_URI` (server), `VITE_OAUTH_REDIRECT_URI` (client), and the
redirect URI registered on the Notion integration must all be identical, or
Notion rejects the token exchange.

## Run

Two terminals:

```bash
# terminal 1
cd server
npm install
npm start          # http://localhost:8081/v1
```

```bash
# terminal 2
cd client
npm install
npm start          # http://localhost:3000
```

Check the server came up: `curl http://localhost:8081/health` →
`{"ok":true,"db":true}`. `db:false` means Mongo isn't reachable.

Then open http://localhost:3000, click **Connect**, authorize the workspace, and
pick a page under **ChatGPT**. Only pages explicitly shared with your
integration during the OAuth consent step will appear in the dropdowns.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Liveness + Mongo connection state |
| `POST` | `/v1/notion/createOauthToken` | Exchange an OAuth `code` for an access token |
| `GET` | `/v1/notion/pageList/:access_token` | Pages shared with the integration |
| `GET` | `/v1/notion/databaseList/:access_token` | Databases shared with the integration |
| `POST` | `/v1/notion/template` | Generate a completion and write it to a page |

## Troubleshooting

**`npm install` fails with `SELF_SIGNED_CERT_IN_CHAIN`** — something is
intercepting TLS between you and the registry. Check the newest log under
`npm-cache/_logs/` for the underlying reason: if the failing URL is a redirect
to some other host, the registry is being blocked rather than merely proxied,
and no certificate setting will fix it. If it genuinely is a trust-chain
problem, add the intercepting root CA to Node's trust store:

```bash
# bash
export NODE_EXTRA_CA_CERTS=/path/to/root-ca.pem
# PowerShell
$env:NODE_EXTRA_CA_CERTS="C:\path\to\root-ca.pem"
```

`NODE_EXTRA_CA_CERTS` appends to Node's built-in roots and also covers the
server's outbound calls to `api.openai.com` and `api.notion.com`. Prefer it over
`npm config set cafile` (which *replaces* the default roots) and over
`NODE_TLS_REJECT_UNAUTHORIZED=0` or `strict-ssl false`, which disable
certificate verification outright.

**`Unknown template "..."`** — only the templates listed in `SYSTEM_PROMPTS`
in [server/src/services/notion.service.js](server/src/services/notion.service.js)
are wired up. Add an entry there and to `templateList` in
[client/src/pages/Gpt.js](client/src/pages/Gpt.js).

**Dropdowns are empty** — the integration has no pages shared with it. Re-run
the Connect flow and select pages on the Notion consent screen.

**`401` / `invalid_grant` on connect** — `OAUTH_REDIRECT_URI`,
`VITE_OAUTH_REDIRECT_URI`, and the redirect URI registered on the Notion
integration must match character for character, trailing slash included.
