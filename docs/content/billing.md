# Billing and balance

PilotKYC is prepaid. You top up a balance in USDT, and every live verification is paid from it. There are no subscriptions and no monthly minimums.

| Mode | Price |
|---|---|
| `document` (Document check) | **0.04 USDT** per verification |
| `selfie_document` (Selfie + Document) | **0.08 USDT** per verification |
| Sandbox (`pk_test_` keys) | **Free** |

The amount actually charged for a result is always shown in its [`price` field](#/billing/price-in-results).

## Sign up and top up

1. [Sign up]({{SIGNUP_URL}}) and confirm your email address. Sandbox works immediately. Creating live (`pk_live_`) keys and topping up require a confirmed email; otherwise the dashboard answers `403 email_not_verified`.
2. In the dashboard, open **Balance** and enter an amount from **10 to 5000 USDT** (up to two decimals).
3. You are sent to an OxaPay invoice. Pay it with crypto. **Pay the exact amount shown on the invoice.** If you paid a different amount, contact [support]({{CONTACT_URL}}) and include the top-up date and amount.
4. When the payment is confirmed, the balance is credited and the top-up shows as paid in the dashboard. The Balance page checks automatically after you return from the invoice. A top-up whose invoice expired or failed does not change your balance.

The dashboard shows three numbers:

- **Available**: what you can spend right now.
- **Held**: money reserved for hosted sessions that were created but not yet used (see [hosted sessions](#/billing/hosted-sessions)).
- **Spent this month**.

Your balance and its history (top-ups, charges, refunds) are in the dashboard. Receipts and VAT invoices are not available yet. Unused balance is not refunded automatically; contact [support]({{CONTACT_URL}}).

## How you are charged

Only live keys (`pk_live_…`) are charged. Sandbox keys never touch your balance.

You pay for the work done: a result of `approved`, `declined` or `review` is charged the same. You are **not** charged when our own engine fails (unavailable, timed out, or an internal error): the amount is returned automatically.

### Direct checks

`POST /v1/checks` is charged when the request is accepted: after the uploaded files are validated and before recognition starts.

1. The price is charged from your available balance. If the balance does not cover it, the call fails with [`402 insufficient_balance`](#/billing/insufficient-balance) and nothing is created or processed.
2. The check runs and returns the result with `price` set.
3. If our engine failed during the check, the charge is refunded automatically and `price` is `null`.

Requests rejected before the charge (`400`, `413`, `415`, `503 engine_unavailable`) cost nothing. Retrying with the same `Idempotency-Key` never charges twice.

### Hosted sessions

A hosted session is paid in two steps, because your user may never open the link.

1. **Hold.** `POST /v1/sessions` reserves the price. Your balance does not drop yet, but the held amount is no longer available for other checks. If the available balance does not cover it, the call fails with `402 insufficient_balance` and no session is created.
2. **Capture.** When your user submits the document and recognition starts, the hold becomes a charge.
3. **Release.** If the session expires, is canceled, or is closed after too many failed uploads before anything was processed, the hold is released and you pay nothing.
4. **Refund.** If recognition starts and then fails on our side, the charge is refunded automatically.

Creating a session therefore needs the price to be available at that moment, even though it is paid later.

## `price` in results

Every [result object](#/result-object) of a live key carries a `price` field:

```json
"price": { "amount": "0.080000", "currency": "USDT" }
```

`amount` is a string with six decimals (`"0.040000"` for `document`, `"0.080000"` for `selfie_document`). While a session is waiting for your user, `price` shows the amount held for it. `price` is `null` when nothing is owed:

- sandbox results;
- sessions whose hold was released (expired, canceled, closed after failed uploads);
- results that were refunded because of our own failure;
- accounts that are exempt from billing.

A non-null `price` means the result is charged (or, for a session still waiting for the user, held). Use it to reconcile your own records.

## Insufficient balance

When the available balance is lower than the price, `POST /v1/checks` and `POST /v1/sessions` return `402`:

```json title="402 Payment Required"
{
  "error": {
    "code": "insufficient_balance",
    "message": "Insufficient balance: 0.020000 USDT available, 0.080000 USDT required. Top up to continue.",
    "available": "0.020000",
    "required": "0.080000"
  }
}
```

| Field | Meaning |
|---|---|
| `available` | USDT you can spend now (balance minus holds), six decimals. |
| `required` | The price of this request, six decimals. |

Nothing was created, processed or charged. Top up in the dashboard and retry the same request: a `402` is not remembered under your `Idempotency-Key`, so the same key can be reused. Do not retry in a loop before topping up.

## Low balance

The dashboard Overview warns you when your balance is running low and links to the top-up page. Watch your balance in production and handle `402` in your integration (for example, pause onboarding and alert your team) so users never see a raw error.

## Sandbox

`pk_test_` keys are free, return deterministic results and have `price: null`. See [Sandbox](#/sandbox).
