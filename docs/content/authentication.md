# Authentication

Every `/v1/*` call carries an API key as a Bearer token:

```http
Authorization: Bearer pk_live_YOUR_KEY
```

> [!WARNING]
> Use keys **server-to-server only**. A key must never ship in a browser, a mobile app or a public repository.

## Live and test keys

| Key prefix | Environment | Behaviour |
|---|---|---|
| `pk_live_…` | Production | Real recognition. |
| `pk_test_…` | Sandbox | Never calls the recognition engine, never stores images, returns deterministic results. Free. See [Sandbox](#/sandbox). |

Every object carries `livemode: true|false` so you can tell which environment produced it.

## Key storage

PilotKYC stores API keys only as SHA-256 hashes. The plaintext key is shown once, at creation; we cannot show it again. Keep it in your secrets manager.

## Webhook secret

Each tenant also has a `webhook_secret` (`whsec_…`) that is used only to sign the webhooks sent to you. It is not an API credential. See [Webhooks](#/webhooks).

## Getting keys

API keys and the webhook secret are issued by the PilotKYC team on request: [get API keys]({{CONTACT_URL}}). A self-service dashboard is on the roadmap and is not part of v1.

## Authentication errors

A missing, unknown or revoked key returns `401`:

```json
{"error": {"code": "unauthorized"}}
```

Every response carries an `X-Request-Id` header; include it when contacting support. See [Errors](#/errors).
