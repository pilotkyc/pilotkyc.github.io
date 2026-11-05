# Result object

Sessions and direct checks return the same object. A direct check has `object: "check"`, an `id` starting with `chk_` and no `url`.

```json title="Session object"
{
  "id": "ses_2b9f…",
  "object": "session",
  "livemode": true,
  "mode": "selfie_document",
  "status": "approved",
  "url": "{{API_ORIGIN}}/s/ses_2b9f…",
  "reference_id": "user-1842",
  "metadata": {},
  "decision": "approved",
  "reasons": [],
  "document": {
    "name": "NGUYEN VAN A",
    "date_of_birth": "1990-04-12",
    "document_number": "C1234567",
    "nationality": "VNM",
    "expiry_date": "2031-02-03",
    "mrz_checked": true
  },
  "scores": {
    "document_authenticity": 0.86,
    "name_match": 0.97,
    "face_match": 0.81,
    "liveness": 0.9
  },
  "expected_name": "Nguyen Van A",
  "data_erased": false,
  "created_at": "2026-11-05T07:00:00Z",
  "completed_at": "2026-11-05T07:01:12Z",
  "expires_at": "2026-11-06T07:00:00Z"
}
```

## Fields

| Field | Description |
|---|---|
| `id` | `ses_…` for sessions, `chk_…` for direct checks. |
| `object` | `session` or `check`. |
| `livemode` | `true` for `pk_live_` keys, `false` for sandbox. |
| `mode` | `document` or `selfie_document`. |
| `status` | Session lifecycle status. See [Hosted sessions](#/hosted-sessions). |
| `url` | Hosted page link. Sessions only. |
| `reference_id` | Your own id, echoed back. |
| `metadata` | Your string key/value pairs, echoed back. |
| `decision` | `approved`, `declined` or `review`; `null` while pending. |
| `reasons` | Machine-readable reason codes. See [Decisions and reason codes](#/decisions-and-reasons). |
| `document` | Extracted data: `name`, `date_of_birth`, `document_number`, `nationality`, `expiry_date`, and `mrz_checked`. |
| `scores` | Numbers from 0 to 1, higher is better. `null` means not applicable. |
| `expected_name` | The name you asked to compare with. |
| `data_erased` | `true` after the personal data was erased (manually or by retention). |
| `created_at`, `completed_at`, `expires_at` | ISO 8601 timestamps in UTC. |

### Scores

| Score | Meaning | Applies to |
|---|---|---|
| `document_authenticity` | How authentic the document looks | both modes |
| `name_match` | Similarity between the extracted name and `expected_name` | when `expected_name` was provided |
| `face_match` | Similarity between the document portrait and the selfie | `selfie_document` |
| `liveness` | Passive liveness (anti-spoof) | `selfie_document` |

A score that is not applicable to the request is `null`.

> [!NOTE]
> Treat scores as supporting evidence. Base your business logic on `decision` and `reasons`: PilotKYC's decision layer maps signals to a decision, and its thresholds can change between deployments.

## Personal data lifecycle

The `document` fields and names are personal data. They are removed after the retention period (default 30 days) or earlier with `DELETE /v1/sessions/{id}/data`; scores, decision and reasons stay for audit. See [Data retention and privacy](#/data-retention-and-privacy).
