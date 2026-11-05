# Rate limits

Limits apply **per API key**:

| Calls | Limit |
|---|---|
| Reads (`GET`) | 30 requests per second |
| `POST /v1/checks` | 10 requests per second |

Hosted capture pages (`/s/*`, used by your end users, no API key) are limited to **60 requests per minute per IP address**.

When a limit is exceeded the API returns `429` with the error code `rate_limited` and a `Retry-After` header:

```json
{"error": {"code": "rate_limited", "message": "…"}}
```

## Staying within the limits

- Prefer [webhooks](#/webhooks) to polling.
- If you poll, back off between calls and stop at a terminal status.
- Queue bursts of direct checks on your side and send them at a steady rate.
- On `429`, wait for `Retry-After` and retry with the same [`Idempotency-Key`](#/idempotency).

Need higher limits? [Contact us]({{CONTACT_URL}}).
