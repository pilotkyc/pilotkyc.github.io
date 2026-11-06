# Quickstart: sandbox in 5 minutes

Create a hosted verification session with a free sandbox key, open the link, and receive a signed webhook. No real recognition runs and no image is kept in the sandbox.

## Before you start

- A sandbox API key starting with `pk_test_` and your webhook secret (`whsec_…`). [Sign up]({{SIGNUP_URL}}), confirm your email, and create the key in the dashboard under **API keys**. Sandbox is free and needs no balance.
- A public HTTPS URL that can receive webhooks. For local work, a tunnelling tool that exposes your localhost over HTTPS is enough.

> [!WARNING]
> API keys are server-side secrets. Never put them in a browser or a mobile app.

## 1. Create a session

```bash tab="curl"
curl -X POST {{BASE_URL}}/sessions \
  -H "Authorization: Bearer pk_test_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: order-1842-kyc" \
  -d '{
    "mode": "selfie_document",
    "reference_id": "user-1842",
    "expected_name": "Nguyen Van A",
    "language": "en",
    "callback_url": "https://example.com/webhooks/pilotkyc",
    "redirect_url": "https://example.com/kyc/done"
  }'
```

```js tab="Node.js"
const res = await fetch("{{BASE_URL}}/sessions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.PILOTKYC_API_KEY}`,
    "Content-Type": "application/json",
    "Idempotency-Key": "order-1842-kyc",
  },
  body: JSON.stringify({
    mode: "selfie_document",
    reference_id: "user-1842",
    expected_name: "Nguyen Van A",
    language: "en",
    callback_url: "https://example.com/webhooks/pilotkyc",
    redirect_url: "https://example.com/kyc/done",
  }),
});
const session = await res.json();
console.log(session.url);
```

```python tab="Python"
import os, requests

res = requests.post(
    "{{BASE_URL}}/sessions",
    headers={
        "Authorization": f"Bearer {os.environ['PILOTKYC_API_KEY']}",
        "Idempotency-Key": "order-1842-kyc",
    },
    json={
        "mode": "selfie_document",
        "reference_id": "user-1842",
        "expected_name": "Nguyen Van A",
        "language": "en",
        "callback_url": "https://example.com/webhooks/pilotkyc",
        "redirect_url": "https://example.com/kyc/done",
    },
    timeout=30,
)
print(res.json()["url"])
```

Response `201` (abridged): a [Session object](#/result-object) with `status: "created"` and a `url`:

```json title="201 Created"
{
  "id": "ses_2b9f…",
  "object": "session",
  "livemode": false,
  "mode": "selfie_document",
  "status": "created",
  "url": "{{API_ORIGIN}}/s/ses_2b9f…",
  "reference_id": "user-1842",
  "decision": null,
  "reasons": [],
  "expected_name": "Nguyen Van A",
  "created_at": "2026-11-05T07:00:00Z",
  "expires_at": "2026-11-06T07:00:00Z"
}
```

## 2. Open the link

Send `url` to your user, or open it yourself. The hosted page shows a **Sandbox** ribbon and accepts any image. In the sandbox, the outcome is chosen by the text in `expected_name` (or `reference_id` when no name is given):

| `expected_name` contains | Result |
|---|---|
| `DECLINE` | `declined`, reasons `["face_mismatch"]` |
| `REVIEW` | `review`, reasons `["low_document_quality"]` |
| `UNREADABLE` | `declined`, reasons `["document_unreadable"]` |
| anything else | `approved` with fixed sample document data |

To try a declined outcome, create the session with `"expected_name": "DECLINE Test"`.

## 3. Receive the webhook

When the user finishes, PilotKYC sends `POST` to your `callback_url`:

```json title="session.completed"
{
  "id": "evt_…",
  "type": "session.completed",
  "created_at": "2026-11-05T07:01:12Z",
  "data": { "id": "ses_2b9f…", "object": "session", "status": "approved", "decision": "approved", "…": "…" }
}
```

with a header `PilotKYC-Signature: t=<unix_ts>,v1=<hex>`. **Verify the signature on the raw body before trusting the payload** — code for Node.js, Python and PHP is on the [Webhooks](#/webhooks) page.

## 4. Or poll

```bash
curl {{BASE_URL}}/sessions/ses_2b9f… \
  -H "Authorization: Bearer pk_test_YOUR_KEY"
```

## Go live

Create a `pk_live_` key in the dashboard (this needs a confirmed email and your password) and [top up your balance](#/billing); live verifications cost **0.04 USDT** (`document`) or **0.08 USDT** (`selfie_document`). Swap the `pk_test_` key for the `pk_live_` key. Nothing else changes in your integration: same endpoints, same result object, same webhooks. If the balance is too low, creating a session or check returns [`402 insufficient_balance`](#/billing/insufficient-balance).
