# API reference

Base URL: `{{BASE_URL}}`

All endpoints require `Authorization: Bearer <api_key>`. See [Authentication](#/authentication).

## OpenAPI

The machine-readable specification:

- [Download openapi.yaml]({{OPENAPI_URL}})
- [View in Swagger Editor]({{SWAGGER_URL}})

## Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/v1/sessions` | Create a hosted verification session. Accepts `Idempotency-Key`. |
| `GET` | `/v1/sessions` | List sessions. Query: `reference_id`, `status`, `limit`, `starting_after`. Returns `{ data, has_more }`. |
| `GET` | `/v1/sessions/{id}` | Retrieve a session. |
| `POST` | `/v1/sessions/{id}/cancel` | Cancel a session; allowed only from `created`. |
| `DELETE` | `/v1/sessions/{id}/data` | Erase extracted personal data of a finished session. |
| `POST` | `/v1/sessions/{id}/webhooks/resend` | Re-send the last webhook event. |
| `POST` | `/v1/checks` | Run a direct check (`multipart/form-data`). Accepts `Idempotency-Key`. |
| `GET` | `/v1/checks/{id}` | Retrieve a check. |

## Common headers

| Header | Direction | Description |
|---|---|---|
| `Authorization` | request | `Bearer <api_key>`. |
| `Idempotency-Key` | request | Up to 255 characters, on `POST /v1/sessions` and `POST /v1/checks`. |
| `X-Request-Id` | response | Present on every response. |
| `Idempotent-Replayed` | response | `true` when a stored response is replayed. |
| `Retry-After` | response | On `429`. |
| `PilotKYC-Signature` | webhook request | `t=<unix_ts>,v1=<hex>`. See [Webhooks](#/webhooks). |

## Objects and enums

| Name | Values |
|---|---|
| `mode` | `document`, `selfie_document` |
| `document_type` | `passport`, `national_id`, `driver_license` |
| `language` | `en`, `ru`, `th`, `vi`, `pt`, `es`, `zh` |
| Session `status` | `created`, `in_progress`, `processing`, `approved`, `declined`, `review`, `expired`, `canceled` |
| `decision` | `approved`, `declined`, `review` (`null` while pending) |
| Webhook `type` | `session.in_progress`, `session.completed`, `session.expired`, `session.canceled` |

## Further reading

- [Result object](#/result-object)
- [Decisions and reason codes](#/decisions-and-reasons)
- [Errors](#/errors) and [Rate limits](#/rate-limits)
