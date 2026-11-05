# Webhooks

PilotKYC notifies your backend when a session changes state. Webhooks are sent to the session's `callback_url`, or to your tenant default when the session has none.

## Events

| `type` | Sent when |
|---|---|
| `session.in_progress` | The user opened the hosted page. |
| `session.completed` | The session reached `approved`, `declined` or `review`. |
| `session.expired` | The session expired before it was finished. |
| `session.canceled` | The session was canceled. |

## Payload

`POST <callback_url>` with a JSON body:

```json
{
  "id": "evt_…",
  "type": "session.completed",
  "created_at": "2026-11-05T07:01:12Z",
  "data": { "…": "the full Session object, see Result object" }
}
```

`data` is the [Session object](#/result-object) at the time of the event.

## Signature

Each request carries a `PilotKYC-Signature` header:

```
PilotKYC-Signature: t=<unix_ts>,v1=<hex>
```

where `v1` is the hex-encoded HMAC-SHA256, keyed with your `webhook_secret` (`whsec_…`), of the string `<t>.<raw_body>` — the timestamp, a dot, then the request body **exactly as received**.

To verify a webhook:

1. Read the **raw** request body (before any JSON parsing or re-serialisation).
2. Parse `t` and `v1` from the header.
3. Reject the request if `t` is older than 5 minutes (or too far in the future).
4. Compute `HMAC_SHA256(webhook_secret, t + "." + raw_body)` as hex.
5. Compare with `v1` using a **constant-time** comparison.
6. Only then parse the JSON and act on it.

> [!WARNING]
> Verify against the raw bytes. If your framework parses the JSON first and you re-serialise it, whitespace or key order may change and the signature will not match.

### Node.js

```js tab="Node.js"
import crypto from "node:crypto";

const TOLERANCE_SECONDS = 300; // 5 minutes

export function verifyPilotKycSignature(rawBody, header, secret) {
  if (!header) return false;

  const parts = {};
  for (const item of header.split(",")) {
    const i = item.indexOf("=");
    if (i > 0) parts[item.slice(0, i).trim()] = item.slice(i + 1).trim();
  }
  if (!/^\d+$/.test(parts.t || "") || !parts.v1) return false;

  const age = Math.abs(Date.now() / 1000 - Number(parts.t));
  if (age > TOLERANCE_SECONDS) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${parts.t}.`)
    .update(rawBody) // Buffer or string, exactly as received
    .digest();
  const received = Buffer.from(parts.v1, "hex");

  return received.length === expected.length && crypto.timingSafeEqual(received, expected);
}
```

```js tab="Express"
import express from "express";
import { verifyPilotKycSignature } from "./verify.js";

const app = express();

// Use the raw body parser for this route only.
app.post("/webhooks/pilotkyc", express.raw({ type: "application/json" }), (req, res) => {
  const ok = verifyPilotKycSignature(
    req.body, // Buffer
    req.get("PilotKYC-Signature"),
    process.env.PILOTKYC_WEBHOOK_SECRET
  );
  if (!ok) return res.sendStatus(400);

  const event = JSON.parse(req.body.toString("utf8"));
  // Handle event.type / event.data here; deduplicate on event.id.
  res.sendStatus(200);
});
```

### Python

```python tab="Python"
import hashlib
import hmac
import time

TOLERANCE_SECONDS = 300  # 5 minutes


def verify_pilotkyc_signature(raw_body: bytes, header: str, secret: str) -> bool:
    try:
        parts = dict(item.strip().split("=", 1) for item in header.split(","))
        timestamp = parts["t"]
        received = parts["v1"]
        timestamp_int = int(timestamp)
    except (AttributeError, KeyError, ValueError):
        return False

    if abs(time.time() - timestamp_int) > TOLERANCE_SECONDS:
        return False

    signed = timestamp.encode() + b"." + raw_body
    expected = hmac.new(secret.encode(), signed, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected.encode(), received.encode())
```

```python tab="Flask"
from flask import Flask, request, abort
import json, os

app = Flask(__name__)


@app.post("/webhooks/pilotkyc")
def pilotkyc_webhook():
    raw = request.get_data()  # raw bytes, before any parsing
    header = request.headers.get("PilotKYC-Signature", "")
    if not verify_pilotkyc_signature(raw, header, os.environ["PILOTKYC_WEBHOOK_SECRET"]):
        abort(400)

    event = json.loads(raw)
    # Handle event["type"] / event["data"] here; deduplicate on event["id"].
    return "", 200
```

### PHP

```php tab="PHP"
<?php

function verifyPilotKycSignature(string $rawBody, string $header, string $secret, int $tolerance = 300): bool
{
    $parts = [];
    foreach (explode(',', $header) as $item) {
        $kv = explode('=', trim($item), 2);
        if (count($kv) === 2) {
            $parts[$kv[0]] = $kv[1];
        }
    }
    if (!isset($parts['t'], $parts['v1']) || !ctype_digit($parts['t'])) {
        return false;
    }
    if (abs(time() - (int) $parts['t']) > $tolerance) {
        return false;
    }

    $expected = hash_hmac('sha256', $parts['t'] . '.' . $rawBody, $secret);
    return hash_equals($expected, $parts['v1']);
}

$rawBody = file_get_contents('php://input');          // raw body, before any parsing
$header  = $_SERVER['HTTP_PILOTKYC_SIGNATURE'] ?? '';

if (!verifyPilotKycSignature($rawBody, $header, getenv('PILOTKYC_WEBHOOK_SECRET'))) {
    http_response_code(400);
    exit;
}

$event = json_decode($rawBody, true);
// Handle $event['type'] / $event['data'] here; deduplicate on $event['id'].
http_response_code(200);
```

### Test vector

Use this to check your implementation (an illustrative example, not a real secret):

| Input | Value |
|---|---|
| Secret | `whsec_test_secret` |
| `t` | `1767225600` |
| Raw body | `{"id":"evt_test","type":"session.completed"}` |
| `v1` | `c42d92890ae4b5158823958240fc10252aae2bb2a96a43d454e00fbb6964af2c` |

The test vector uses a fixed timestamp, so a real verifier will reject it as too old; skip the tolerance check, or inject the current time, when running it in a unit test.

You can also compute a signature in the browser:

<div data-widget="signature-calculator"></div>

## Delivery and retries

- Your endpoint must answer with a **2xx** status.
- Otherwise PilotKYC retries, up to **8 attempts** in total with exponential backoff (roughly from 10 seconds up to 6 hours).
- Every delivery attempt is logged on the PilotKYC side.
- Deduplicate on the event `id`: a webhook can be delivered more than once.
- Respond quickly and process asynchronously.

## Resending

`POST /v1/sessions/{id}/webhooks/resend` re-sends the last event of the session. Use it after fixing a bug in your receiver. See [Hosted sessions](#/hosted-sessions).

## Webhooks and polling

Webhooks are the primary way to get results. You can always reconcile with `GET /v1/sessions/{id}` or `GET /v1/sessions?reference_id=…`.
