# PilotKYC documentation

PilotKYC is a hosted identity-verification API. Your backend sends a document photo (and, optionally, a live selfie); PilotKYC returns a machine-readable decision — `approved`, `declined` or `review` — with reason codes and 0..1 scores.

Base URL: `{{BASE_URL}}`

## What it does

Two verification modes cover the common onboarding cases:

| `mode` | What your user provides | What PilotKYC checks |
|---|---|---|
| `document` | A photo of an identity document | The document is present and readable, authenticity signals, data extraction (name, date of birth, document number, nationality, expiry), MRZ checksum validation when the document has an MRZ, and an optional match against the name you expect |
| `selfie_document` | A photo of the document **and** a live selfie | Everything from `document`, plus a face match between the document photo and the selfie, and passive liveness (anti-spoofing against a photo of a screen or a printed photo) |

Supported document types: `passport`, `national_id`, `driver_license`. See [Verification modes](#/modes).

## Two ways to integrate

You can use either style, or both:

1. **Hosted flow.** Your backend creates a *session* and sends the returned `url` to your user. The user captures the document (and selfie) on PilotKYC's mobile-friendly page. You receive a signed webhook and/or poll the session. No front-end work on your side. See [Hosted sessions](#/hosted-sessions).
2. **Direct API.** You already have your own capture UI. You upload the images to `POST /v1/checks` and get the answer synchronously. See [Direct checks](#/direct-checks).

## Core concepts

- **Authentication** is a server-side Bearer API key. `pk_live_` keys run real recognition; `pk_test_` keys use the free sandbox. See [Authentication](#/authentication).
- **Result object** is the same shape for sessions and direct checks. See [Result object](#/result-object).
- **Webhooks** are signed with HMAC-SHA256 in the `PilotKYC-Signature` header. See [Webhooks](#/webhooks).
- **Billing** is prepaid: top up a USDT balance with crypto, 0.05 USDT per live verification, sandbox is free. See [Billing and balance](#/billing).
- **Idempotency** keys make creating sessions and checks safe to retry. See [Idempotency](#/idempotency).
- **Privacy**: images are deleted right after the check; personal data is kept at most 30 days by default and can be erased via the API at any time. See [Data retention and privacy](#/data-retention-and-privacy).

## Where to start

1. Follow the [Quickstart](#/quickstart) with a free `pk_test_` key.
2. Read [Webhooks](#/webhooks) and implement signature verification.
3. Read the [Integration guides](#/integration-guides) for an exchange onboarding flow or a P2P merchant flow.

Need API keys? [Sign up]({{SIGNUP_URL}}) and create them in the dashboard. Live verifications are paid from a prepaid USDT balance: see [Billing and balance](#/billing).

## Limitations in v1

> [!NOTE]
> PilotKYC reads the **front side / data page** of a document only. The following are **not** part of v1 and are listed here so you can plan around them (Roadmap, no committed dates):
>
> - Back side of two-sided documents
> - Active liveness (head-turn video)
> - Payment-receipt reading
> - Proof of address
> - AML / sanctions screening
> - KYB (business verification)
> - Phone and email checks
> - Per-country document templates beyond what the recognition engine already reads
