# Verification modes

The `mode` field selects what your user provides and what PilotKYC checks. It is required for both [sessions](#/hosted-sessions) and [direct checks](#/direct-checks).

| `mode` | Price | What the end user provides | What PilotKYC checks |
|---|---|---|---|
| `document` | **0.04 USDT** | Photo of an identity document | Document is present and readable, authenticity signals, data extraction, MRZ checksum when the document has one, optional match against the expected name |
| `selfie_document` | **0.08 USDT** | Photo of the document **and** a live selfie | Everything from `document`, plus face match document ↔ selfie and passive liveness |

## `document`

Checks the document on its own:

- **Presence and readability**: is there an identity document in the photo, and can it be read?
- **Data extraction**: name, date of birth, document number, nationality, expiry date.
- **MRZ checksum validation** for passports and ID cards that have a machine-readable zone. The result reports `document.mrz_checked`.
- **Authenticity signals**: tampering, screen-capture and print signals; reported as `document_suspicious`.
- **Optional name match**: pass `expected_name` and the extracted name is compared with it (Latin or native script). The result is in `scores.name_match`; a mismatch yields `name_mismatch`.

## `selfie_document`

Everything above, plus:

- **Face match** between the portrait on the document and the live selfie (`scores.face_match`).
- **Passive liveness**: anti-spoofing that detects a photo of a screen or a printed photo (`scores.liveness`). No head-turn or video is required from the user.

## Document types

| `document_type` | Document |
|---|---|
| `passport` | Passport (data page) |
| `national_id` | National ID card |
| `driver_license` | Driver licence |

`document_type` is optional. For [sessions](#/hosted-sessions) you can preselect it; otherwise the user picks it on the hosted page. For [direct checks](#/direct-checks) it is an optional form field.

> [!NOTE]
> PilotKYC reads the **front side / data page** of a document. The back side of two-sided documents is not read in v1.

## Languages of the hosted page

The hosted page is available in English (`en`), Russian (`ru`), Thai (`th`), Vietnamese (`vi`), Portuguese (`pt`), Spanish (`es`) and Chinese (`zh`), mobile-first. Choose it with the `language` field when creating a session (default `en`).
