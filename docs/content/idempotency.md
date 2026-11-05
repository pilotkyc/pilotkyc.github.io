# Idempotency

`POST /v1/sessions` and `POST /v1/checks` accept an `Idempotency-Key` header (up to 255 characters). Use it so that a network retry does not create a second session or run a second check.

```http
POST /v1/sessions
Idempotency-Key: order-1842-kyc
```

| Situation | Result |
|---|---|
| Same key, same body, within 24 hours | The original response is replayed, with the header `Idempotent-Replayed: true`. |
| Same key, different body | `409 conflict`. |
| No key | Every call is treated as a new request. |

## Recommendations

- Derive the key from something stable in your system, such as `<order-id>-kyc`, not from a random value generated per retry.
- Generate a new key when you intentionally want a new attempt, for example `kyc-user-1842-attempt-2`.
- Retry on network errors and `5xx` responses with the **same** key.

```js
const key = `kyc-${userId}-attempt-${attempt}`;
const res = await fetch("{{BASE_URL}}/sessions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.PILOTKYC_API_KEY}`,
    "Content-Type": "application/json",
    "Idempotency-Key": key,
  },
  body: JSON.stringify({ mode: "document", reference_id: userId }),
});
```
