# Decisions and reason codes

Every finished verification gets a `decision` and a list of machine-readable `reasons`.

## Decisions

| `decision` | Meaning | Suggested handling |
|---|---|---|
| `approved` | No hard-fail and every signal is above the auto-pass level. | Continue the user's flow. |
| `review` | No hard-fail, but at least one signal sits between the review and auto-pass levels. | Send to manual review, or ask the user to retry with a better photo. |
| `declined` | At least one hard-fail. | Do not proceed; look at `reasons` to decide whether a retry makes sense. |
| `null` | The verification is still pending. | Wait for the webhook, or poll. |

PilotKYC's decision layer turns recognition signals (0..1) into the decision using per-signal levels: a hard-fail level and an auto-pass level for document authenticity, name match, face match and liveness, plus hard-fail for critical document flags. Levels are set per deployment, never per request, so you cannot lower them from the API.

> [!WARNING]
> If the recognition engine times out or fails, the result is `review` with reason `engine_error`. A technical failure is **never** turned into `approved`.

## Reason codes

| Code | Meaning |
|---|---|
| `document_not_found` | No identity document was detected in the image. |
| `document_unreadable` | A document is present but cannot be read. |
| `document_incomplete` | The document is only partly visible or key data is missing. |
| `document_suspicious` | Tampering, screen-capture or print signals. |
| `document_expired` | The document is past its expiry date (`declined` when the MRZ checked out, otherwise `review`). |
| `document_expiry_unknown` | The expiry date is missing or could not be read reliably. PilotKYC never approves a document without a known, future expiry date, so the result is `review`. |
| `mrz_invalid` | The MRZ checksum does not validate. |
| `name_mismatch` | The extracted name does not match `expected_name`. |
| `face_not_found` | No face was found in the document photo or the selfie. |
| `face_mismatch` | The selfie does not match the document portrait. |
| `liveness_failed` | The selfie failed the liveness check. |
| `low_document_quality` | The document image quality is too low for a confident result. |
| `low_face_match` | The face match score is in the review band. |
| `low_liveness` | The liveness score is in the review band. |
| `engine_error` | The recognition engine failed or timed out. |

`declined` means at least one hard-fail reason; `review` means no hard-fail but at least one signal between the review and auto-pass levels.

## Handling decisions

```js
switch (event.data.decision) {
  case "approved":
    await markVerified(event.data.reference_id);
    break;
  case "review":
    await queueForManualReview(event.data.reference_id, event.data.reasons);
    break;
  case "declined":
    await markRejected(event.data.reference_id, event.data.reasons);
    break;
}
```

Handle unknown reason codes gracefully (for example, treat them like a generic failure). Changes are announced in the [Changelog](#/changelog).
