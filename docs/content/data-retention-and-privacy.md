# Data retention and privacy

PilotKYC is designed to keep as little personal data as possible, for as short a time as possible.

## Images

- Images are kept only in process memory or a short-lived temporary store (at most 15 minutes) while the check runs, then deleted.
- Images are **never written to the database**.
- Sandbox checks do not store images at all.

## Extracted personal data

The data extracted from a document (document fields and names) is kept for `PII_RETENTION_DAYS`, **30 days by default**, and then nulled by a sweeper. The decision, scores and reasons are kept for audit.

After the data is removed, the object has `data_erased: true`.

## Erasure on demand

`DELETE /v1/sessions/{id}/data` erases the personal data (document fields, names) of a finished session at any time. Scores and decision stay. The response is the session with `data_erased: true`.

```bash
curl -X DELETE {{BASE_URL}}/sessions/ses_2b9f…/data \
  -H "Authorization: Bearer pk_live_YOUR_KEY"
```

> [!TIP]
> If you store the result in your own system, you are the controller of that copy. Keep only what you need and delete the rest when the user's account is closed.

## Hosted page and consent

On the hosted page the user gives consent before capturing. PilotKYC records the consent time, IP address and user agent when the session is started. The hosted page never returns the decision, scores or extracted data to the browser.

## Credentials

- API keys are stored only as SHA-256 hashes; the plaintext is shown once.
- Webhooks are signed with HMAC-SHA256 using your `webhook_secret`. See [Webhooks](#/webhooks).
- Use the API only from your server over HTTPS.

## Webhook payload contents

Webhook payloads contain the full Session object, which includes extracted personal data while it is retained. Receive webhooks only on an HTTPS endpoint you control, verify the signature, and avoid logging the full body.
