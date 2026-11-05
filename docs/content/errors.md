# Errors

Errors use a common envelope:

```json
{"error": {"code": "invalid_request", "message": "human readable", "param": "mode"}}
```

`param` names the offending field when it applies. Every response, successful or not, carries an `X-Request-Id` header; log it and include it when you contact support.

## Error codes

| HTTP | `code` | Meaning |
|---|---|---|
| 400 | `invalid_request` | A field is missing or invalid. See `param` and `message`. |
| 401 | `unauthorized` | Missing, unknown or revoked API key. |
| 403 | `forbidden` | The request is understood but not permitted for this key. |
| 404 | `not_found` | The resource does not exist. |
| 409 | `conflict` | The `Idempotency-Key` was reused with a different body. See [Idempotency](#/idempotency). |
| 413 | `payload_too_large` | An uploaded file is larger than 10 MB. |
| 415 | `unsupported_media_type` | The file is not JPEG, PNG, WebP or HEIC. |
| 429 | `rate_limited` | Too many requests. A `Retry-After` header tells you when to retry. See [Rate limits](#/rate-limits). |
| 503 | `engine_unavailable` | The recognition engine is unavailable. Retry later. |
| 500 | `internal_error` | Unexpected server error. Retry with the same `Idempotency-Key`. |

## Handling errors

- `4xx` (except `429`) are not worth retrying until you fix the request.
- Retry `429`, `500` and `503` with backoff, honouring `Retry-After`, and reuse the same `Idempotency-Key`.
- A verification that cannot be completed because of a recognition failure is reported as `review` with reason `engine_error`, not as an HTTP error. See [Decisions and reason codes](#/decisions-and-reasons).

```js
async function call(url, init, attempt = 0) {
  const res = await fetch(url, init);
  if ([429, 500, 503].includes(res.status) && attempt < 4) {
    const wait = Number(res.headers.get("Retry-After")) || 2 ** attempt;
    await new Promise((r) => setTimeout(r, wait * 1000));
    return call(url, init, attempt + 1);
  }
  return res;
}
```
