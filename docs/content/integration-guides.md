# Integration guides

Two generic patterns. Adapt the names to your own system.

## Guide 1: crypto exchange onboarding

**Goal:** let a new user trade or withdraw only after their identity document and face have been verified.

**Recommended style:** hosted flow (`selfie_document` mode). No front-end work, mobile-first capture page in seven languages.

### Flow

1. The user starts verification in your app. Your backend creates a session:

   ```bash
   curl -X POST {{BASE_URL}}/sessions \
     -H "Authorization: Bearer pk_live_YOUR_KEY" \
     -H "Content-Type: application/json" \
     -H "Idempotency-Key: kyc-user-1842-attempt-1" \
     -d '{
       "mode": "selfie_document",
       "reference_id": "user-1842",
       "expected_name": "Nguyen Van A",
       "language": "en",
       "callback_url": "https://exchange.example.com/webhooks/pilotkyc",
       "redirect_url": "https://exchange.example.com/kyc/done"
     }'
   ```

2. Store the returned session `id` next to the user, and send the user to `url`.
3. The user captures the document and a selfie on the hosted page and returns to your `redirect_url`.
4. Your webhook endpoint verifies the signature (see [Webhooks](#/webhooks)) and handles `session.completed`:

   | `decision` | Action |
   |---|---|
   | `approved` | Mark the user verified and unlock the gated features. |
   | `review` | Put the user in a manual-review queue, or offer a retry. |
   | `declined` | Keep the account restricted. Use `reasons` (for example `document_unreadable`) to decide whether to offer a retry. |

5. On a retry, create a **new** session with a new idempotency key (`…-attempt-2`).

### Tips

- Pass `expected_name` when the user already gave their name at signup; `scores.name_match` and `name_mismatch` then tell you whether the document agrees.
- The `redirect_url` page is just a UX landing: decide with the webhook or `GET /v1/sessions/{id}`, never with a query string.
- Handle `session.expired`: let the user start again.
- Reconcile on a schedule with `GET /v1/sessions?reference_id=…&status=…` in case a webhook was missed.
- Use `DELETE /v1/sessions/{id}/data` after you have copied what you need, or let the 30-day default retention apply. See [Data retention and privacy](#/data-retention-and-privacy).

## Guide 2: P2P merchant, before releasing funds

**Goal:** before releasing funds to a counterparty, confirm that the person behind the account is the same person named on the order.

**Recommended style:** hosted link sent to the counterparty (no UI work), or the direct API if your platform already captures photos in your own flow.

### Flow

1. When an order needs verification, create a session with the order id as `reference_id` and the counterparty's expected name as `expected_name`:

   ```json
   {
     "mode": "selfie_document",
     "reference_id": "order-77120",
     "expected_name": "Nguyen Van A",
     "expires_in": 1800,
     "callback_url": "https://merchant.example.com/webhooks/pilotkyc"
   }
   ```

2. Send the `url` to the counterparty (for example in your order chat).
3. **Hold the funds** until a verified webhook arrives. Do not release on `session.in_progress`.
4. On `session.completed`:
   - `approved` — release the funds according to your normal process.
   - `review` — keep holding; check manually.
   - `declined` — do not release; check `reasons`.
5. On `session.expired` or `session.canceled`, keep holding and re-send a fresh link.

### Direct API variant

If you collect photos yourself, upload them from your server and use the synchronous answer:

```bash
curl -X POST {{BASE_URL}}/checks \
  -H "Authorization: Bearer pk_live_YOUR_KEY" \
  -H "Idempotency-Key: order-77120-check-1" \
  -F mode=selfie_document \
  -F expected_name="Nguyen Van A" \
  -F reference_id=order-77120 \
  -F document=@document.jpg \
  -F selfie=@selfie.jpg
```

### Tips

- Use `expires_in` to match your order's payment window (`300`..`604800` seconds).
- Keep `reference_id` unique per order, and look sessions up with `GET /v1/sessions?reference_id=order-77120`.
- PilotKYC verifies a document and a face. It does not perform AML or sanctions screening; keep your own screening in place. See the limitations on the [Overview](#/overview).
