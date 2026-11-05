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
| `pk_live_…` | Production | Real recognition. Charged from your prepaid balance. See [Billing](#/billing). |
| `pk_test_…` | Sandbox | Never calls the recognition engine, never stores images, returns deterministic results. Free. See [Sandbox](#/sandbox). |

Every object carries `livemode: true|false` so you can tell which environment produced it.

## Key storage

PilotKYC stores API keys only as SHA-256 hashes. The plaintext key is shown once, at creation; we cannot show it again. Keep it in your secrets manager.

## Webhook secret

Each tenant also has a `webhook_secret` (`whsec_…`) that is used only to sign the webhooks sent to you. It is not an API credential. See [Webhooks](#/webhooks).

## Getting keys

Create your keys yourself in the dashboard:

1. [Sign up]({{SIGNUP_URL}}) and confirm your email. A sandbox key and your webhook secret are available right away.
2. Open **API keys** and create a key. Choose sandbox (`pk_test_`) or live (`pk_live_`). A live key needs a confirmed email and your account password.
3. Copy the key immediately: it is shown once. You can revoke a key at any time, and a revoked key returns `401`.

Already registered? [Log in]({{LOGIN_URL}}). Live keys spend your prepaid balance; see [Billing and balance](#/billing). Dashboard sessions and API keys are separate: an API key never works in the dashboard, and a dashboard login never works on `/v1/*`.

## Authentication errors

A missing, unknown or revoked key returns `401`:

```json
{"error": {"code": "unauthorized"}}
```

Every response carries an `X-Request-Id` header; include it when contacting support. See [Errors](#/errors).
