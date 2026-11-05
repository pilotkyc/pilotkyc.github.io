# Sandbox

Sandbox keys (`pk_test_…`) let you build and test your whole integration for free.

- The recognition engine is **never called**.
- No image is stored.
- Results are **deterministic**.
- **Nothing is charged** and no balance is needed. `price` is `null`.

Everything else is the same as in production: the same endpoints, the same [result object](#/result-object), the same [webhooks](#/webhooks) and the same signature.

## Choosing the outcome

The outcome is chosen by the text in `expected_name`, or by `reference_id` when no name is given:

| Contains | Result |
|---|---|
| `DECLINE` | `declined`, reasons `["face_mismatch"]` for `selfie_document`, `["document_suspicious"]` for `document` |
| `REVIEW` | `review`, reasons `["low_document_quality"]` |
| `UNREADABLE` | `declined`, reasons `["document_unreadable"]` |
| anything else | `approved`, with fixed sample document data |

```bash
# declined outcome
curl -X POST {{BASE_URL}}/sessions \
  -H "Authorization: Bearer pk_test_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"mode":"selfie_document","expected_name":"DECLINE Test"}'

# review outcome, chosen via reference_id
curl -X POST {{BASE_URL}}/sessions \
  -H "Authorization: Bearer pk_test_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"mode":"document","reference_id":"REVIEW-case-1"}'
```

## Hosted sessions in the sandbox

Hosted sandbox sessions show the real capture page with a **Sandbox** ribbon and accept any image. Use them to test your redirect and webhook flow end to end.

## Direct checks in the sandbox

`POST /v1/checks` with a `pk_test_` key returns the deterministic outcome above. Images you upload are not processed and are not kept.

## Going live

Create a `pk_live_` key in the dashboard, top up your [balance](#/billing) and replace the key. Your code, webhooks and result handling stay the same.

> [!TIP]
> Test every branch before going live: `approved`, `declined` with a reason, `review`, and an expired session.
