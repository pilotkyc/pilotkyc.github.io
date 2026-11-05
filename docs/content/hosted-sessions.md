# Hosted sessions

In the hosted flow your backend creates a **session**, sends the returned `url` to your user, and PilotKYC runs the capture on its own mobile-friendly page. You get the outcome by signed [webhook](#/webhooks) and/or by polling.

## Create a session

<div class="endpoint"><span class="method post">POST</span>/v1/sessions</div>

JSON body:

| Field | Type | Required | Notes |
|---|---|---|---|
| `mode` | enum | yes | `document` or `selfie_document`. See [modes](#/modes). |
| `reference_id` | string | no | Your own user or order id, up to 128 characters; echoed back. |
| `expected_name` | string | no | Full name to compare with the document (Latin or native script). |
| `callback_url` | string | no | HTTPS URL for webhooks on port 443 or 8443; overrides the tenant default. |
| `redirect_url` | string | no | HTTPS URL the user is sent to after finishing. |
| `language` | string | no | Language of the hosted page: `en`, `ru`, `th`, `vi`, `pt`, `es`, `zh`. Default `en`. |
| `expires_in` | integer | no | Seconds, `300`..`604800`. Default `86400` (24 hours). |
| `metadata` | object | no | Up to 20 string keys/values; echoed back. |
| `document_type` | enum | no | Preselect `passport`, `national_id` or `driver_license`; otherwise the user picks. |

Response `201`: a [Session object](#/result-object) with `status: "created"` and the hosted `url`. The endpoint accepts an [`Idempotency-Key`](#/idempotency).

```bash
curl -X POST {{BASE_URL}}/sessions \
  -H "Authorization: Bearer pk_live_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: order-1842-kyc" \
  -d '{"mode":"document","reference_id":"user-1842","language":"en","document_type":"passport"}'
```

## Retrieve, list, cancel

<div class="endpoint"><span class="method get">GET</span>/v1/sessions/{id}</div>

Returns the Session object.

<div class="endpoint"><span class="method get">GET</span>/v1/sessions?reference_id=…&amp;status=…&amp;limit=…&amp;starting_after=…</div>

Returns `{ "data": [ …sessions ], "has_more": true|false }`. Filter by your `reference_id` and/or `status`; page with `limit` and `starting_after`.

<div class="endpoint"><span class="method post">POST</span>/v1/sessions/{id}/cancel</div>

Sets the status to `canceled`. Allowed only while the session is `created`.

<div class="endpoint"><span class="method post">POST</span>/v1/sessions/{id}/webhooks/resend</div>

Re-sends the last webhook event of the session. See [Webhooks](#/webhooks).

<div class="endpoint"><span class="method post">DELETE</span>/v1/sessions/{id}/data</div>

Erases the extracted personal data (document fields, names) of a finished session. Scores and the decision stay. Returns the object with `data_erased: true`. See [Data retention and privacy](#/data-retention-and-privacy).

## Session lifecycle

```
created ──► in_progress ──► processing ──► approved | declined | review
   │                                     
   ├──► expired     (not finished before expires_at)
   └──► canceled    (POST /sessions/{id}/cancel, only from created)
```

| Status | Meaning |
|---|---|
| `created` | The session exists and the link has not been opened yet. |
| `in_progress` | The user opened the page. |
| `processing` | The images were submitted and are being checked. |
| `approved`, `declined`, `review` | The decision is ready. See [Decisions and reason codes](#/decisions-and-reasons). |
| `expired`, `canceled` | The session ended without a decision. |

Terminal statuses: `approved`, `declined`, `review`, `expired`, `canceled`.

## What the user sees

The hosted page is served at the session `url` (`/s/{id}`) and needs no API key: possession of the session id is the capability. Session ids are `ses_` plus 32 random bytes, never sequential, so treat the link as private to the user it was created for.

1. The user opens the link and gives consent. PilotKYC records the consent time, IP address and user agent when the session is started.
2. The user captures the document (and, in `selfie_document` mode, a selfie). A quick readability pre-check on the document gives early feedback; it is limited to 20 calls per session.
3. The images are submitted once; a session can be submitted a single time.
4. The user is sent to your `redirect_url` (if set).

The hosted page never shows the decision, scores or extracted data to the browser. Your backend is the only party that learns the result, via webhook or `GET /v1/sessions/{id}`. Hosted pages are rate limited per IP; see [Rate limits](#/rate-limits).

> [!TIP]
> Sandbox (`pk_test_`) sessions show the real capture page with a "Sandbox" ribbon and accept any image.
