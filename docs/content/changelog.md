# Changelog

## Self-serve accounts and billing

- **Dashboard:** sign up, confirm your email, create and revoke API keys yourself, and manage your webhook and balance. No more asking for keys.
- **Prepaid USDT balance:** top up with crypto via OxaPay (10 to 5000 USDT per top-up). Live verifications cost 0.05 USDT in both modes; sandbox stays free. See [Billing and balance](#/billing).
- **API:** new `price` field in results, and `402 insufficient_balance` (with `available` and `required`) on `POST /v1/sessions` and `POST /v1/checks`.
- **Processing time:** documents with an MRZ take seconds; other documents, read by the AI, usually take from about 30 seconds up to 2 minutes.

## v1.0.0 — 2026-11-05

First public release of the PilotKYC API.

- **Modes:** `document` and `selfie_document`.
- **Hosted sessions:** create, retrieve, list, cancel, erase data, resend webhooks; hosted capture page in seven languages (`en`, `ru`, `th`, `vi`, `pt`, `es`, `zh`).
- **Direct checks:** `POST /v1/checks` (multipart) and `GET /v1/checks/{id}`.
- **Result object** with `decision`, machine-readable `reasons`, document fields and 0..1 `scores`.
- **Sandbox** keys (`pk_test_`) with deterministic outcomes.
- **Webhooks** signed with HMAC-SHA256 in the `PilotKYC-Signature` header; up to 8 delivery attempts.
- **Idempotency** on `POST /v1/sessions` and `POST /v1/checks`.
- **Rate limits** per API key.
- **Privacy:** images deleted after the check, personal data kept 30 days by default, erasure on demand.

## Roadmap

Not in v1, no committed dates:

- Back side of two-sided documents
- Active liveness (head-turn video)
- Payment-receipt reading
- Proof of address
- AML / sanctions screening
- KYB
- Phone and email checks
- Per-country document templates

## Versioning

The API is versioned in the path (`/v1`). Changes are listed on this page. We recommend writing your integration so that it tolerates unknown fields, reason codes and webhook event types.
