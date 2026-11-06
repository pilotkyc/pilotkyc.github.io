# Direct checks

Use direct checks when you already have your own capture UI. Upload the images to PilotKYC and get the answer back synchronously.

## Create a check

<div class="endpoint"><span class="method post">POST</span>/v1/checks</div>

Content type: `multipart/form-data`.

| Field | Type | Required | Notes |
|---|---|---|---|
| `mode` | text | yes | `document` or `selfie_document`. See [modes](#/modes). |
| `document` | file | yes | Passport data page, or the front side of an ID. |
| `document_type` | text | no | `passport`, `national_id` or `driver_license`. |
| `selfie` | file | when `mode=selfie_document` | A live selfie of the user. |
| `expected_name` | text | no | Name to compare with the document. |
| `reference_id` | text | no | Your own user or order id. |

Files: JPEG, PNG, WebP or HEIC, at most 10 MB each. Larger files return `413 payload_too_large`; other formats return `415 unsupported_media_type`.

```bash
curl -X POST {{BASE_URL}}/checks \
  -H "Authorization: Bearer pk_live_YOUR_KEY" \
  -H "Idempotency-Key: kyc-user-1842-attempt-1" \
  -F mode=selfie_document \
  -F document_type=passport \
  -F expected_name="Nguyen Van A" \
  -F reference_id=user-1842 \
  -F document=@passport.jpg \
  -F selfie=@selfie.jpg
```

Live checks are charged from your [prepaid balance](#/billing): if it cannot cover the price, the call fails with `402 insufficient_balance` and nothing is processed.

The call is synchronous. Documents with an MRZ return in seconds; other documents, read by the AI, usually take 10–30 seconds with automatic failover, so set a generous timeout in your HTTP client. For long waits, the [hosted flow](#/hosted-sessions) with a webhook is often more convenient.

Response `200`: a Check object. It has the same shape as a finished session (see [Result object](#/result-object)) with `object: "check"`, an `id` starting with `chk_`, and no `url`.

The endpoint accepts an [`Idempotency-Key`](#/idempotency) and is limited to 10 requests per second per API key; see [Rate limits](#/rate-limits).

## Retrieve a check

<div class="endpoint"><span class="method get">GET</span>/v1/checks/{id}</div>

Returns the Check object again. Personal data in it is subject to [retention](#/data-retention-and-privacy).

## Image handling

The images you upload are processed and deleted right after the check. They are never written to a database. See [Data retention and privacy](#/data-retention-and-privacy).

> [!NOTE]
> Direct checks send the personal data of your users to PilotKYC. Make sure you have the user's consent and a legal basis for it. In the hosted flow, PilotKYC's page records the consent step.

## Engine failures

If the recognition engine is unavailable the call fails with `503 engine_unavailable`. If the engine times out or errors while a check is running, the result is `review` with reason `engine_error` — never `approved` — and the charge is refunded. See [Decisions and reason codes](#/decisions-and-reasons).
