# Payment gateways: research reference for `packages/payments`

Researched 2026-09-23 for Step 1 (Plan first) of `arabic-websites-master-prompt.md`.
This file is the source material for the provider-agnostic adapter layer
(`createPaymentSession` / `verifyPayment` / `handleWebhook` / `refund`) and for the
go-live guide `docs/payments.md` that comes later. It is **research notes, not code**. Nothing here has been
tested against a live or sandbox account; every endpoint must be confirmed with real sandbox credentials
before an adapter leaves "stub" status.

## Confidence labels

Every fact below carries one of these labels:

| Label | Meaning |
|---|---|
| **[V]** | Verified. Read on the provider's own docs, support site, or official artefact on 2026-09-23. The URL is given. |
| **[L]** | Likely. Comes from a third-party source (SDK, package, blog) or from a search-engine snippet of an official page I could not open. Treat as a strong hint. Confirm it in sandbox. |
| **[U]** | Unverified. Could not be confirmed, or it is an assumption or proposal of ours. Do not build on it without checking. |

Env-var names in this file are **our proposals [U]**, not names the providers require.

---

## 1. Money: minor units, and why IQD is special

### 1.1 ISO 4217 minor units (official list)

Source: SIX Group ISO 4217 List One, published **2026-09-17**
(https://www.six-group.com/dam/download/financial-information/data-center/iso-currrency/lists/list-one.xml). Downloaded and parsed **[V]**.

| Code | Num | ISO minor units | Country |
|---|---|---|---|
| BHD | 048 | **3** | Bahrain |
| KWD | 414 | **3** | Kuwait |
| OMR | 512 | **3** | Oman |
| JOD | 400 | **3** | Jordan |
| IQD | 368 | **3** | Iraq |
| SAR | 682 | **2** | Saudi Arabia |
| AED | 784 | **2** | UAE |
| QAR | 634 | **2** | Qatar |

### 1.2 What the display layer (CLDR / `Intl`) does

I ran this locally on Node v22.18.0 (ICU 77.1, CLDR 47.0) with `Intl.NumberFormat(..., {style:'currency'})` **[V]**:

| Code | Intl min/max fraction digits | `ar-XX` sample for 1234.5 |
|---|---|---|
| BHD | 3 / 3 | ١٬٢٣٤٫٥٠٠ د.ب.‏ |
| KWD | 3 / 3 | ١٬٢٣٤٫٥٠٠ د.ك.‏ |
| OMR | 3 / 3 | ١٬٢٣٤٫٥٠٠ ر.ع.‏ |
| JOD | 3 / 3 | ١٬٢٣٤٫٥٠٠ د.أ.‏ |
| SAR | 2 / 2 | ١٬٢٣٤٫٥٠ ر.س.‏ |
| QAR | 2 / 2 | ١٬٢٣٤٫٥٠ ر.ق.‏ |
| AED | 2 / 2 | 1,234.50 د.إ.‏ (note: `ar-AE` uses Latin digits by default) |
| **IQD** | **0 / 0** | ١٬٢٣٥ د.ع.‏ |

### 1.3 IQD: ISO says 3, everything practical says 0

- **ISO 4217 says 3** minor units (fils) **[V]**.
- **CLDR/`Intl` formats IQD with 0 decimals** **[V]**. No fils coins circulate. Iraqi prices are whole dinars.
- **Checkout.com treats IQD as a 3-decimal currency.** You send the amount ×1000, and the last digit must be `0` **[V]**
  (https://www.checkout.com/docs/payments/accept-payments/format-the-amount-value).
- **FastPay** takes `bill_amount` as an **integer** in IQD. `currency` must always be `"IQD"` **[V]**. Its responses and IPN
  return `received_amount` as a string with 2 decimals, for example `"250.00"` **[V]**. Parse it, don't string-compare it.
- **ZainCash** takes whole-dinar amounts. The legacy API has a minimum of 250 IQD **[L]** (third-party packages).
- **Tap, MyFatoorah, Moyasar**: IQD is not in their published currency lists **[V for MyFatoorah and Moyasar; L for Tap]**.
- **PayTabs** has an Iraq region (`secure-iraq.paytabs.com`) **[V]**. How it expects IQD decimals is **[U]**.

**Conflict with the brief.** The brief says "IQD = 0". That is right for display and for the Iraqi gateways. It is **not** the
ISO value. Recommendation: `packages/i18n` or `packages/commerce` keeps its **own** exponent table
(`BHD:3, KWD:3, OMR:3, JOD:3, SAR:2, AED:2, QAR:2, IQD:0`), documented as a deliberate deviation from ISO for IQD.
Each adapter converts at its boundary with an explicit per-gateway rule (for example, Checkout.com needs IQD ×1000).
Never derive the exponent from `Intl` or ISO at runtime.

### 1.4 Amount format each gateway expects

| Gateway | Wire format | 3-decimal currencies | Notes |
|---|---|---|---|
| Tap | **major decimal** (`10.5` = 10.500) | up to 3 dp for BHD/KWD/OMR (JOD listed as 3 in hashstring doc) **[V]** | Webhook hashstring needs the amount **formatted to the currency's decimals** (`"3.000"` for BHD) **[V]** |
| MyFatoorah (v2 and v3) | **major decimal** number **[V]** | decimal (for example, `23` KWD) | Refunds use the **account default currency**, and there is no currency param **[V]** |
| Moyasar | **minor integer** **[V]** | `1.00 KWD = 1000` **[V]** | `1.00 SAR = 100` |
| PayTabs | **major decimal** (`cart_amount` int, float or string, 0.01–9999999999.99) **[V]** | per-currency dp not documented **[U]** | Returned as string, for example `"200.00"` |
| Checkout.com | **minor integer** **[V]** | BHD, IQD, JOD, KWD, LYD, OMR, TND: ×1000, **last digit must be 0** **[V]** | So KWD/BHD/OMR prices must be multiples of 10 fils (0.010) if Checkout.com might be used |
| Credimax (MPGS) | **major decimal string** (`"100.00"`) **[V]** | 3 dp for BHD expected **[L]** | "consists of the characters 0-9 and '.'" |
| ZainCash | **integer IQD** **[L]** | n/a | min 250 IQD on legacy API **[L]** |
| FastPay | **integer IQD** (`bill_amount`) **[V]** | n/a | Web-PGW minimum not documented. The QR API documents min 1000 **[V]** |

Implementation notes:

- Store money as integer minor units (`bigint` or safe `number`) plus a currency code.
- Build decimal strings with string arithmetic from the integer (`12345` KWD minor → `"12.345"`). Don't use float division
  followed by `toFixed`. For gateways that want a JSON number, `Number("12.345")` serialises exactly.
- Check Checkout.com's "last digit 0" rule in the adapter. Also consider it a **content rule**: keep KWD/BHD prices on
  0.010 steps (for example 12.250, not 12.255).

---

## 2. Summary matrix

| | Tap | MyFatoorah | Moyasar | PayTabs | Checkout.com | Credimax (MPGS) | ZainCash | FastPay |
|---|---|---|---|---|---|---|---|---|
| Merchant countries | KW, BH, SA, AE, QA, OM (+more) **[L]** | KW, SA, BH, AE, QA, EG, OM, JO **[V]** | **SA only** **[V]** | AE, SA, EG, OM, JO, KW, IQ, MA, QA, Global **[V]** (BH not listed) | Global; UAE acquiring licence **[L]** | BH **[V]** | IQ **[V]** | IQ **[V]** |
| Currencies relevant to us | KWD, BHD, SAR, AED, QAR, OMR (+USD) **[V]** | KWD, SAR, BHD, AED, QAR, OMR, JOD, EGP **[V]** | SAR default; AED, BHD, KWD, QAR, USD (cards only) **[V]** | region-dependent **[U]** | per table **[V]** | BHD (+DCC) **[V/L]** | IQD | IQD only **[V]** |
| KNET | yes, `src_kw.knet`, KWD only **[V]** | yes **[V]** | no | yes (`knet`, `knetdebit`, `knetcredit`) **[V]** | yes on HPP **[V]** | via MPGS "KNET Gateway" (not relevant in BH) | no | no |
| BENEFIT debit (BH) | yes, `src_bh.benefit`, BHD only, redirect **[V]** | **[U]** | no | **not in `payment_methods` list** **[V]** | yes, "Benefit Payment Gateway", BHD **[V]** | yes, needs a separate BENEFIT MID **[V]** | no | no |
| BenefitPay wallet (QR) | **Web SDK only** (no redirect source documented) **[V]** | **[U]** | no | **[U]** | **[U]** | not listed **[V]** | no | no |
| mada | yes, `src_sa.mada`, SAR **[V]** | yes (test cards published) **[V]** | yes **[V]** | yes (`mada`) **[V]** | as card; in-KSA needs Saudi acquirer MID **[V]** | listed **[V]** | no | no |
| Apple Pay | auto on hosted page (not in iframe) **[V]** | yes **[V]** | yes **[V]** | yes (`applepay`) **[V]** | yes on HPP **[V]** | yes **[V]** | no | no |
| STC Pay | `src_sa.stcpay`, SAR, OTP flow via API **[V]** | yes (test mobiles published) **[V]** | yes, `stcpay` source **[V]** | yes (`stcpay`, `stcpayqr`) **[V]** | yes on HPP **[V]** | no | no | no |
| Hosted redirect | yes (`transaction.url`) **[V]** | yes (`PaymentURL`) **[V]** | yes, Invoice `url` **[V]** | yes (`redirect_url`) **[V]** | yes (`_links.redirect.href`) **[V]** | **no plain URL**: JS `Checkout.showPaymentPage()` with `session.id` **[V]** | yes **[V/L]** | yes (`redirect_uri`) **[V]** |
| Webhook auth | HMAC-SHA256 `hashstring` header over selected fields **[V]** | HMAC-SHA256 base64, `MyFatoorah-Signature`, over selected fields **[V]** | **shared `secret_token` in JSON body**, no HMAC **[V]** | HMAC-SHA256 hex of raw body, `Signature` header **[V]** | HMAC (hex) of raw body, `Cko-Signature` **[V]**; SHA-256 **[L]** | static secret, `X-Notification-Secret` header **[V]** | v2: production-only webhooks; scheme **[U]** | **IPN unsigned**; must call Validate API **[V]** |
| Refund API | yes, partial **[V]** | yes (v2 MakeRefund), partial **[V]** | yes, partial **[V]** | yes (`tran_type: refund`) **[V]**; partial **[U]** | yes, partial **[V]** | yes, REFUND op; BENEFIT ≤90 days **[V]** | v2 "reverse" **[L]**; legacy none **[U]** | yes; needs customer msisdn + refund secret **[V]** |
| Sandbox | same host, `sk_test_` key **[L/V]** | `apitest.myfatoorah.com` **[V]** | same host, `sk_test_` **[V]** | same regional host, **test profile** **[V]** | `{prefix}.api.sandbox.checkout.com` **[V]** | same host, `TEST`-prefixed merchant ID **[V]** | v2 `pg-api-uat.zaincash.iq` **[L]**; legacy `test.zaincash.iq` **[L]** | `staging-apigw-merchant.fast-pay.iq` **[V]** |

---

## 3. Tap Payments

Docs index: https://developers.tap.company/llms.txt **[V]**

### Coverage
- Method docs pin countries and currencies **[V]**:
  - KNET `src_kw.knet`: "Knet accepts KWD currency only", redirect only (https://developers.tap.company/docs/knet.md)
  - BENEFIT `src_bh.benefit`: "Benefit only supports payments in BHD", redirect via `transaction.url`, no authorize (https://developers.tap.company/docs/benefit.md)
  - mada `src_sa.mada`: SAR only, appears automatically on hosted page (https://developers.tap.company/docs/mada)
  - STC Pay `src_sa.stcpay`: SAR only. Flow is create charge with phone → OTP → update charge. No authorize or recurring (https://developers.tap.company/docs/stcpay.md)
  - OmanNet `src_omannet`: OMR only (https://developers.tap.company/docs/omannet.md)
  - QPay/NAPS `src_qa.qpay`: QAR only (https://developers.tap.company/docs/qpay.md)
  - Apple Pay: "will appear on our hosted payment page automatically". Supported in UAE, KSA, KW, QA, BH (AED, SAR, KWD, QAR, BHD, plus USD). iframe and popup don't support Apple Pay (https://developers.tap.company/docs/apple-pay)
  - `src_all`: unified hosted page showing all enabled methods; `src_card`: cards (https://developers.tap.company/docs/redirect, search snippets) **[V/L]**
- **BenefitPay (wallet)** is documented only as a **Web SDK** button that shows a QR for the BenefitPay app. I found no redirect `source.id` for it (https://developers.tap.company/docs/benefitpay-web-sdk.md) **[V]**. BenefitPay via Tap therefore needs a client-side island, not the plain redirect flow.
- Whether STC Pay appears on the `src_all` hosted page: **[U]**.

### Auth and environments
- `Authorization: Bearer sk_...` **[V]** (reference schema: apiKey in header, bearer)
- Base `https://api.tap.company/v2/`. Test vs live is decided **by the key** (`sk_test_…` vs `sk_live_…`); there is no separate sandbox host **[L]** (search snippet of Tap docs: "the mode of payment is determined by the API key used"). Key pairs appear as `test.secret sk_test…`, `live.secret sk_live…` in the Connect API sample **[V]**.

### createPaymentSession: Create a Charge
- `POST https://api.tap.company/v2/charges` **[V]** (https://developers.tap.company/reference/create-a-charge)
- Required: `amount`, `currency`, `customer`, `source`, `redirect` **[V]**. Within `customer` the schema requires `first_name` and `email` **[V as per schema; confirm in sandbox]**.
- `source.id`: `src_all` (hosted, all methods), or a method-specific id above **[V]**
- `redirect.url`: where the customer returns **[V]**. `post.url`: webhook target for this charge **[V]**
- Amount: "positive decimal … 100 to charge $100 and 100.5 to charge $100.50" **[V]**
- Response: `id` (`chg_…`), `status: INITIATED`, `transaction.url` (send the customer here) **[V]**

### verifyPayment
- On return, Tap adds `tap_id` (= charge id) to `redirect.url` **[V]** (https://developers.tap.company/docs/redirect)
- `GET https://api.tap.company/v2/charges/{charge_id}` **[V]**
- Statuses: `INITIATED, ABANDONED, CANCELLED, FAILED, DECLINED, RESTRICTED, CAPTURED, VOID, TIMEDOUT, UNKNOWN`. Only `CAPTURED` = paid **[V]** (https://developers.tap.company/reference/charges)

### handleWebhook: `hashstring`
Source: https://developers.tap.company/docs/webhook **[V]**
- Header: `hashstring`
- Charges, authorizes and refunds: concatenate
  `'x_id'+id + 'x_amount'+amount + 'x_currency'+currency + 'x_gateway_reference'+reference.gateway + 'x_payment_reference'+reference.payment + 'x_status'+status + 'x_created'+transaction.created`
- Invoices: `x_id, x_amount, x_currency, x_updated, x_status, x_created`
- `HMAC-SHA256(toBeHashed, secretApiKey)`, hex (PHP `hash_hmac('sha256', …)`). The key is **your secret API key**.
- Format the amount to the currency's decimals: 2 dp for AED, QAR, SAR, USD, EUR, GBP, EGP; 3 dp for BHD, KWD, OMR, JOD (`"BHD - 3.000"`).
- Posts **only when status is CAPTURED or FAILED**. Expects HTTP 200, with 2 retries before the delivery is marked ERROR. Public HTTPS with a valid cert is required (no localhost, no self-signed).
- Adapter rule: verify `hashstring` with a constant-time compare, **then** re-fetch the charge anyway.

### refund
- `POST https://api.tap.company/v2/refunds`. Required: `charge_id`, `amount`, `currency`, `reason`. Optional `post.url`. Full or partial **[V]** (https://developers.tap.company/reference/create-a-refund.md)
- Amount: "For currencies BHD, KWD, and OMR, amount should be specified with up to 3 decimal places. For others … up to 2" **[V]**

### Test data
Source: https://developers.tap.company/reference/testing-cards **[V]**
- KNET: `8888880000000001`, 09/30, PIN 1234 → CAPTURED; `8888880000000002`, 09/30 → CAPTURED; `8888880000000001`, 05/21 → NOT CAPTURED
- BENEFIT: `4600410123456789`, 12/27, PIN 1234 → CAPTURED; `7777770123456789` → NOT CAPTURED; `1111110123456789` → DECLINED
- Cards (3DS): Mastercard `5123450000000008`, Visa `4508750015741019`, Amex `345678901234564`, mada `4464040000000007` (3DS), mada `5588480000000003` (no 3DS). CVV 100 = MATCH (Amex 1000). OmanNet CVV 844, OTP 9999.
- To enter a KNET test card on the KNET page, pick bank "KNET Test Card [KNET1]" **[L]** (search snippet of Tap docs).

### Merchant onboarding
Source: https://support.tap.company/en/support/solutions/articles/153000242639 **[V]**
- Business licence or commercial registration, authorised signatory name, owners and shareholders list, address proof
- National ID (front and back) of the signatory and of every owner with ≥20%. Passport for foreign nationals.
- IBAN certificate or statement (account name in English, matching the legal name)
- **Online presence with product descriptions, pricing, About Us, T&C, Refund Policy, Privacy Policy, checkout.** Our demo sites' policy pages directly serve this.
- Kuwait detail: CR, civil ID, IBAN and a signed activation letter. Test account is immediate; live credentials take 3–7 business days **[L]** (https://kuwaitdev.com/en/insights/tap-payments-integration-guide-kuwait-2026/).

### Proposed env keys [U]
`TAP_SECRET_KEY` (also the webhook HMAC key), `TAP_PUBLIC_KEY` (only if a Tap web SDK is used, for example BenefitPay), `TAP_SOURCE_ID` (default `src_all`).

---

## 4. MyFatoorah

Docs index: https://docs.myfatoorah.com/llms.txt **[V]**. **v3 is the current API.** The v2 endpoints named in the brief
(SendPayment, InitiatePayment, ExecutePayment, GetPaymentStatus) are still documented, under "Old Integration" **[V]**
(https://docs.myfatoorah.com/docs/v3-hosted-payment-page). I found no removal date **[U]**.

### Coverage
- Countries: Kuwait, Saudi Arabia, Bahrain, UAE, Qatar, Egypt, Oman, Jordan **[V]** (https://docs.myfatoorah.com/docs/live-account.md)
- Currencies: KWD, SAR, BHD, AED, QAR, OMR, JOD, EGP **[V]** (initiate-payment, create-payment references). **No IQD.**
- Methods: the account decides. `GET /v3/payment-methods` returns each enabled method's `ApiName`, commission and currency (example shows APPLEPAY, CARD, GOOGLEPAY, KNET) **[V]** (https://docs.myfatoorah.com/reference/get-payment-methods.md). The `PaymentMethod` enum in the Create Payment reference lists `CARD, APPLE_PAY, GOOGLE_PAY, KNET` **[V]**. BENEFIT, BenefitPay, mada and STC Pay are exposed through the account method list **[L]**; mada and STC Pay test data are published (below).

### Auth and environments
Source: https://docs.myfatoorah.com/docs/api-key.md **[V]**
- `Authorization: Bearer <API key>`
- Base URLs:

| Environment | API | Portal |
|---|---|---|
| Test | `https://apitest.myfatoorah.com/` | `https://demo.myfatoorah.com/` |
| Kuwait, Bahrain, Jordan, Oman | `https://api.myfatoorah.com/` | `https://portal.myfatoorah.com/` |
| UAE | `https://api-ae.myfatoorah.com/` | `https://ae.myfatoorah.com/` |
| Saudi Arabia | `https://api-sa.myfatoorah.com/` | `https://sa.myfatoorah.com/` |
| Qatar | `https://api-qa.myfatoorah.com/` | `https://qa.myfatoorah.com/` |
| Egypt | `https://api-eg.myfatoorah.com/` | `https://eg.myfatoorah.com/` |

- The docs page publishes a demo test token (starts `SK_KWT_vVZlnnAqu8jRB…`) **[V]**. Copy it from the docs page when needed. Don't commit it.

### createPaymentSession
**Recommended (v3):**
- `POST /v3/payments` **[V]** (https://docs.myfatoorah.com/reference/create-payment.md)
  - `Order.Amount` (number, required, >0), `Order.Currency` (optional), `Order.ExternalIdentifier` (our order id)
  - `IntegrationUrls.Redirection` (return URL), `IntegrationUrls.Webhook` (optional, per invoice)
  - `Customer.{Name, Mobile{CountryCode, Number}, Email, Reference, CivilId}` (optional)
  - Response `Data`: `InvoiceId`, `PaymentId`, `PaymentURL`, `PaymentCompleted`, `TransactionDetails`
- Hosted page for a single method: pass `PaymentMethod` (for example `"CARD"`, `"KNET"`) **[V]** (https://docs.myfatoorah.com/docs/v3-hosted-payment-page)
- Invoice or link (customer picks from enabled methods): omit `PaymentMethod` and set `NotificationOption` to `EMAIL | SMS | LINK | ALL`. `LINK` returns `PaymentURL` only **[V]** (https://docs.myfatoorah.com/docs/v3-invoicing). Whether that page lets the customer choose among all enabled methods is **[L]**; confirm in sandbox.

**Legacy (v2), still documented:**
- `POST /v2/SendPayment`. Required: `CustomerName`, `NotificationOption` (`LNK` | `EML` | `SMS` | `ALL`), `InvoiceValue`. Returns `InvoiceId` and `InvoiceURL` **[V]**
- `POST /v2/InitiatePayment` (`InvoiceAmount`, `CurrencyIso`) → method list with `PaymentMethodId`, `PaymentMethodCode` (for example `kn`, `ap`, `vm`), `ServiceCharge`, `TotalAmount`, `IsDirectPayment` **[V]**
- `POST /v2/ExecutePayment` (`InvoiceValue`, `PaymentMethodId` or `SessionId`, `CallBackUrl`, `ErrorUrl`, optional `DisplayCurrencyIso`, `Language` EN or AR) → `InvoiceId`, `PaymentURL` **[V]**

### verifyPayment
- MyFatoorah appends `?paymentId=…` to the redirection URL **[V]**
- v3: `GET /v3/payments/{paymentId}`. `Invoice.Status` is `PAID` or `PENDING`; `Transaction.Status` is `SUCCESS` or a failure status **[V]** (https://docs.myfatoorah.com/docs/get-payment-details)
- v2: `POST /v2/GetPaymentStatus` with `Key` and `KeyType` (`InvoiceId` | `PaymentId` | `CustomerReference`). `InvoiceStatus` is `Pending | Paid | Canceled`. `TransactionStatus` is `InProgress | Succss` (sic) `| Failed | Canceled | Authorize` **[V]**

### handleWebhook: Webhook v2
Sources: https://docs.myfatoorah.com/docs/webhook-v2.md, https://docs.myfatoorah.com/docs/webhook-signature.md, https://docs.myfatoorah.com/docs/webhook-v2-payment-status-data-model **[V]**
- The webhook secret is **mandatory** in v2. Configure it on the portal's webhook page.
- Header: `MyFatoorah-Signature`
- Algorithm: build `key=value` pairs **in the documented order for the event type**, join them with `,`, and replace null with `""`. Compute HMAC-SHA256 with the UTF-8 secret, then **base64**.
- PAYMENT_STATUS_CHANGED (`Event.Code = 1`) fields, in order:
  `Invoice.Id, Invoice.Status, Transaction.Status, Transaction.PaymentId, Invoice.ExternalIdentifier`
  Example: `Invoice.Id=6409988,Invoice.Status=PAID,Transaction.Status=SUCCESS,Transaction.PaymentId=07076409988323998875,Invoice.ExternalIdentifier=asdqwd-f13sdf-fasjkz`
- Payload shape: `{ Event:{Code,Name,CountryIsoCode,CreationDate,Reference}, Data:{Invoice{…}, Transaction{…}, Customer{…}, Amount{BaseCurrency, ValueInBaseCurrency, …}} }`
- Event codes 1–7: Payment Status Changed, Refund Status Changed, Balance Transferred, Supplier Status Changed, Recurring Updates, Dispute Status Changed, Supplier Update Request Changed.
- The field order for the refund event (code 2) is on https://docs.myfatoorah.com/docs/webhook-v2-refund-data-model.md, which I did **not** read **[U]**.

### refund
- `POST /v2/MakeRefund`. Required: `KeyType` (`InvoiceId` | `PaymentId`), `Key`, `Amount`. Optional: `Comment`, `ServiceChargeOnCustomer`, `ExternalIdentifier`, `AmountDeductedFromSupplier`. Response: `RefundId`, `RefundReference` **[V]**
- Partial refunds are allowed, repeatedly, up to the total **[V]**. **No currency param.** "the value passed for the refund would represent the account default currency" **[V]** (https://docs.myfatoorah.com/docs/refund). A refund "generate[s] a refund request at our finance operation team", so it is not instant **[V]**.
- A v3 refund endpoint: not found **[U]**. `PUT /v3/payments/{paymentId}` covers capture and release only **[L]**.

### Test data
Source: https://docs.myfatoorah.com/docs/test-cards.md **[V]**
- KNET `8888880000000001`, 09/30 → Captured (other expiry → Not Captured)
- Visa/MC: `4508750015741019`; `5123450000000008` (01/39, CVC 100); `2223000000000007` (01/39, 100); others listed
- BENEFIT `4600410123456789` → Captured; `4550120123456789` expired; `4845550123456789` incorrect PIN
- mada `4464040000000007` (02/29, 123) → Capture
- AMEX `345678901234564`, CVC 1000
- STC Pay test mobiles `0557877988`, `0548220713`, OTP `1234`
- Cardholder name: any two words, for example "test test".

### Merchant onboarding
- Official: "select your country … and call an account manager or sales representative" to activate the account and the API role **[V]** (live-account.md)
- Documents: CR, signatory ID, IBAN, product proof **[L]** (third-party: kuwaitdev.com)
- Kuwait context: in April 2026 CBK required an NOC for *limited-scope e-money* (stored-value wallets across multiple merchants), and MyFatoorah sent merchants a compliance notice **[L]** (https://blog.najaa.org/…/cbk-limited-scope-emoney-myfatoorah-kuwait.html). It is probably irrelevant to single-shop gift cards, but check before selling stored-value gift cards on a Kuwaiti site **[U]**.

### Proposed env keys [U]
`MYFATOORAH_API_KEY`, `MYFATOORAH_BASE_URL` (or `MYFATOORAH_REGION`: `test|kw|ae|sa|qa|eg`), `MYFATOORAH_WEBHOOK_SECRET`.

---

## 5. Moyasar

Docs index: https://docs.moyasar.com/llms.txt **[V]**

### Coverage
- **Saudi merchants only.** "Moyasar currently focuses on providing services within Saudi Arabia only" **[V]** (https://moyasar.com/en/resources/faqs/)
- Methods: mada, Visa, Mastercard, Amex, STC Pay, Apple Pay, Samsung Pay **[V]** (FAQ)
- Currencies: SAR (default), AED, BHD, KWD, QAR, USD. "Multi-currency is currently available for card payments (Mada, Visa, Mastercard) only" **[V]** (https://docs.moyasar.com/docs/guides/multi-currency/introduction.md)

### Auth and environments
Source: https://docs.moyasar.com/docs/getting-started/authentication.md **[V]**
- HTTP Basic: username = API key, password empty. Base `https://api.moyasar.com/v1/`, HTTPS only.
- `pk_test_` / `sk_test_` vs `pk_live_` / `sk_live_`, on the same host. The publishable key can only create payments.

### createPaymentSession: Invoice (hosted, redirect)
Source: https://docs.moyasar.com/api/invoices/01-create-invoice/ **[V]**
- `POST https://api.moyasar.com/v1/invoices`. Required: `amount` (**integer, smallest unit**), `currency`, `description`. Optional: `callback_url`, `success_url`, `back_url`, `expired_at`, `metadata`.
- Response: `id`, `status`, `url` (the checkout page to show the payer), `payments[]`
- Invoice statuses: `initiated, paid, failed, refunded, canceled, on_hold, expired, voided`
- Which methods the invoice page offers (Apple Pay, STC Pay): **[U]**
- Alternative: `POST /v1/payments` takes raw card data (`source.type` = `creditcard | token | applepay | samsungpay | stcpay`) and needs `callback_url` for card or token **[V]**. Sending raw card data server-side puts us in PCI scope, so **don't** use it. Moyasar's client-side form (publishable key) is the documented alternative **[L]**.

### verifyPayment
- `GET /v1/payments/{id}`. Payment statuses: `initiated, paid, authorized, failed, refunded, captured, voided, verified` **[V]** (https://docs.moyasar.com/api/payments/01-create-payment/, payment-operations guide)
- For the invoice flow: fetch the invoice and inspect `status` or `payments[]`. Exact invoice fetch path `GET /v1/invoices/{id}`: **[L]**
- Go-live checklist: "validate the payment response server-side … status, amount, and currency" **[V]**

### handleWebhook
Sources: https://docs.moyasar.com/docs/api/other/webhooks/webhook-reference.md, https://docs.moyasar.com/docs/guides/dashboard/setting-up-webhooks.md **[V]**
- Configure in Dashboard → Settings → Webhooks: HTTPS endpoint, a **Secret Token you choose**, HTTP method, events.
- Payload: `{ id, type, created_at, secret_token, account_name, live, data }`. **The secret is in the JSON body**, and there is **no HMAC signature header**.
- Events: `payment_paid, payment_faild` (sic, the typo is in the docs), `payment_refunded, payment_voided, payment_authorized, payment_captured, payment_verified`, `card_auth_authenticated, card_auth_failed`
- Retries: 5 more attempts, up to 2-hour gaps, then dropped. Non-2xx counts as a failure.
- Adapter rule: constant-time compare `secret_token` with the env secret, check `live` against mode, **then re-fetch** the payment.

### refund
- `POST /v1/payments/{id}/refund`. Empty body = full refund; `{"amount": 2000}` = partial (minor units). Requires the secret key. Voids are preferred when possible **[V]** (payment-operations guide)
- Refund timing to the customer: mada 24h to 3 business days; credit cards 7–14 business days **[V]** (FAQ)

### Test data
Source: https://docs.moyasar.com/docs/guides/card-payments/test-cards.md **[V]**
- Approved: mada `4201320111111010`; Visa `4111114005765430`, `4111111111111111`; MC `5421080101000000`; Amex `340000000900000`
- Declined examples: mada `4201320000311101` (51 insufficient funds); Visa `4123120001090000`; MC `5105105105105100`
- Any two-word name, future expiry, any 3-digit CVC (4 for Amex). "Using any card that is not listed … will result in a failed payment."
- STC Pay and Apple Pay sandbox test data: **not found [U]**

### Merchant onboarding
- "a valid Saudi commercial registration (CR) or freelance license, and a Saudi commercial bank account linked to it" **[V]** (FAQ)
- Freelancers: Freelance Certificate, National ID, IBAN certificate **[L]** (search snippet of moyasar.com)

### Proposed env keys [U]
`MOYASAR_SECRET_KEY`, `MOYASAR_PUBLISHABLE_KEY` (only if the client form is used), `MOYASAR_WEBHOOK_SECRET_TOKEN`.

---

## 6. PayTabs

Docs: https://docs.paytabs.com/ (PT2 API) and the support portal https://support.paytabs.com/ **[V]**

### Regional endpoints (must match the merchant profile's region, otherwise auth fails) [V]
Source: https://docs.paytabs.com/manuals/PT-API-Endpoints/Integration-Types-Manuals/Hosted-Payment-Page/HPP-Step-3-Initiating-Payment/HPP-Initiating-Payment

| Region | Base |
|---|---|
| KSA | `https://secure.paytabs.sa` |
| UAE | `https://secure.paytabs.com` |
| Egypt | `https://secure-egypt.paytabs.com` |
| Oman | `https://secure-oman.paytabs.com` |
| Jordan | `https://secure-jordan.paytabs.com` |
| Kuwait | `https://secure-kuwait.paytabs.com` |
| Iraq | `https://secure-iraq.paytabs.com` |
| Morocco | `https://secure-morocco.paytabs.com` |
| Qatar | `https://secure-doha.paytabs.com` |
| Global | `https://secure-global.paytabs.com` |

Rule of thumb: swap `merchant` for `secure` in your dashboard domain **[V]** (https://support.paytabs.com/en/support/solutions/articles/60000718070). **Bahrain has no listed region.** Whether Bahraini merchants are onboarded, and via which host, is **[U]**.

### Auth and environments
- Header `authorization: <server key>` (raw, no Bearer). `profile_id` goes in the body **[V]**
- Test vs live uses **separate test profiles** on the same host. "Test cards will ONLY work with Test profiles" **[V]** (https://support.paytabs.com/en/support/solutions/articles/60000712315)

### createPaymentSession: Hosted Payment Page
- `POST {region}/payment/request` **[V]**
- Required: `profile_id`, `tran_type` (`sale` | `auth` | …), `tran_class` (`ecom` | `recurring` | `moto`), `cart_id` (1–64), `cart_description` (1–128), `cart_currency`, `cart_amount` **[V]**
- Optional: `callback` (server-to-server POST), `return` (browser return URL), `customer_details`, `hide_shipping`, `paypage_lang` (`en` | `ar` | `fr`), `framed`, `payment_methods` **[V]**
- `payment_methods` values: `creditcard, amex, mada, urpay, unionpay, stcpay, stcpayqr, valu, aman, meezaqr, omannet, knet, knetdebit, knetcredit, applepay, samsungpay, installment, forsa, halan, tamara, amaninstallments, souhoola, tabby, touchpoints, paypal, sadad, tru`. `"all"` is the default; exclude with `["all","-applepay"]` **[V]** (https://docs.paytabs.com/manuals/PT-API-Endpoints/Integration-Types-Manuals/Request-Response-Parameters/Request-Parameter-Payment-Methods/). **No `benefit` value in this list.**
- Response: `tran_ref` (for example `TST…`), `redirect_url` **[V]**

### verifyPayment
- `POST {region}/payment/query` with `profile_id` and **either** `tran_ref` **or** `cart_id` (both → 400) **[V]**
- `payment_result.response_status`: `A` authorised/approved, `D` declined, `C` cancelled, `E` error, `H` hold, `P` pending, `V` voided, `X` expired **[V]**

### handleWebhook / return verification
Source: https://support.paytabs.com/en/support/solutions/articles/60000718961 **[V]**
- **Callback and IPN (server-to-server):** header `Signature` = `HMAC-SHA256(rawBody, serverKey)`, hex. Compare with `hash_equals`.
- **Return page (browser POST):** remove `signature` from the POST fields, drop empty values, sort by key, `http_build_query`, then `HMAC-SHA256(query, serverKey)` and compare with the posted `signature`. Note: PHP `http_build_query` encoding (spaces as `+`, RFC1738) must be replicated exactly in JS. **[L]** needs a test vector.

### refund
- `POST {region}/payment/request` with `tran_type: "refund"`, `tran_class`, `cart_id`, `cart_description`, `cart_currency`, `cart_amount`, `tran_ref` (original). Only for successful Sale or Capture **[V]**
- Partial refund (amount < original): **[U]**

### Amount
- `cart_amount` is int, float or string, 0.01–9999999999.99. Responses return a string such as `"12.30"` **[V]**. Per-currency decimals (KWD/BHD/OMR 3 dp, IQD): **[U]**

### Test data
- Visa `4000000000000002` (CVV 123, 3DS), `4111111111111111` (123, no 3DS), `4012001036983332` (530, 3DS); MC `5498383801606532` (977, 3DS), `5200000000000007` (977, 3DS), `5200000000000114` (977, no 3DS). Also in the dashboard under Developers → Testing → Test Cards **[V]**
- mada, KNET and STC Pay test data: **not found [U]**

### Merchant onboarding
Source: https://ai.paytabs.com/en/onboarding-documentation/ **[V]**
- KSA freelancer: ID or passport + bank statement or letter (holder name, account no., IBAN, currency)
- KSA single-owner company: CR, ID (plus residence permit for non-Saudis), National Address certificate or utility bill, bank statement with IBAN
- UAE: freelancer certificate or trade licence (+MoA, activity form), IDs, bank details. Egypt: national ID or CR, tax card.
- **All countries, website:** T&C; Shipping & Delivery, Refund, Cancellation and Privacy policies; contact info with the legal name and **CR or trade-licence number**; SSL; Visa and Mastercard logos.

### Proposed env keys [U]
`PAYTABS_PROFILE_ID`, `PAYTABS_SERVER_KEY` (also the HMAC key), `PAYTABS_REGION` (`sa|ae|eg|om|jo|kw|iq|ma|qa|global`), optional `PAYTABS_CLIENT_KEY` (only for managed or own forms).

---

## 7. Checkout.com

Docs: https://www.checkout.com/docs/llms.txt **[V]**

### Coverage
- Hosted Payments Page (HPP) methods include: cards, Apple Pay, Google Pay, **Benefit Payment Gateway, KNET, QPay, stc pay, Tamara**, and many non-GCC methods **[V]** (https://www.checkout.com/docs/payments/accept-payments/accept-a-payment-on-a-hosted-page). mada isn't a separate HPP method. It is processed as a card.
- mada: outside KSA it is processed as a standard debit card. **Inside KSA it needs a merchant ID from a Saudi acquirer**, must be captured in full, and has no partial capture or authorisation requests **[V]** (https://www.checkout.com/docs/payments/add-payment-methods/mada)
- Benefit PG: Bahrain, BHD, full and partial refunds **[V]**. KNET: redirect, auto-capture, partial refunds, no recurring **[V]**. Each local APM must be enabled by the account manager **[V]**.

### Auth and environments
- **Merchant-specific subdomain (MSSD) is mandatory:** `https://{prefix}.api.sandbox.checkout.com` and `https://{prefix}.api.checkout.com`. `{prefix}` = first 8 chars of `client_id` without `cli_`. The wrong host gives **403** **[V]** (https://www.checkout.com/docs/developer-resources/api/api-endpoints)
- `Authorization: Bearer sk_sbox_…` (sandbox) / `Bearer sk_…` (live), or OAuth client credentials **[L]** (search snippet of https://www.checkout.com/docs/developer-resources/api/manage-api-keys/api-keys)

### createPaymentSession: HPP
Source: https://www.checkout.com/docs/payments/accept-payments/accept-a-payment-on-a-hosted-page/manage-your-hosted-payments-page **[V]**
- `POST https://{prefix}.api.sandbox.checkout.com/hosted-payments`
- Body example: `amount` (minor), `currency`, `reference`, `billing.address.country`, `customer{name,email}`, `success_url`, `failure_url`, `cancel_url`. Also `processing_channel_id` (can be omitted if the account has only one channel **[L]**), `allow_payment_methods` **[V]**.
- Response: `id` (`hpp_…`), `_links.redirect.href`. Sessions expire after **24 h** **[V]**.
- Payment Links (`/payment-links`) are also available. They default to a 24 h expiry **[V]**.

### verifyPayment
- The return URL carries `cko-payment-id=pay_…` **[V]**
- `GET /hosted-payments/{id}` → "Payment Pending" / "Payment Received" / "Expired" **[V]**. Get payment details: `GET /payments/{id}` **[L]** (path pattern; see https://www.checkout.com/docs/payments/manage-payments/get-payment-details)
- The docs say to confirm via webhooks, not the front-end redirect alone **[V]**.

### handleWebhook
Source: https://www.checkout.com/docs/developer-resources/event-notifications/receive-webhooks **[V]**
- Configured as a **Workflow** with a webhook action. You supply the signing key there.
- Header `Cko-Signature` = HMAC of the raw payload with that key, **hex (Base16)**. Hash = SHA-256 **[L]** (third-party SDK docs).
- Retries up to 8 times: 5m, 10m, 15m, 30m, 1h, 4h, 12h, 12h.
- Event names (for example `payment_captured`, `payment_approved`, `payment_declined`, `payment_refunded`): **[L]**. Refund events confirmed for KNET: `payment_refund_pending`, `payment_refunded`, `payment_refund_declined` **[V]**.

### refund
- `POST /payments/{id}/refunds`, body `amount` (minor, partial OK), `reference`. Returns **202** + `action_id` **[V]** (https://www.checkout.com/docs/payments/manage-payments/refund-a-payment)

### Amount
- Minor units. **BHD, IQD, JOD, KWD, LYD, OMR, TND: amount/1000, and the last digit must be `0`** **[V]**. SAR, AED and QAR are not in the special tables, so /100 by default **[L]**.

### Test data
- Card `4242 4242 4242 4242`, any future expiry, CVV `100` **[V]** (HPP page). Test data for KNET, Benefit and STC Pay: **[U]**.

### Merchant onboarding
- Checkout.com holds a UAE Central Bank acquiring licence **[L]** (Checkout.com newsroom). A trade licence is required for UAE merchants **[L]** (third-party comparison). Small-merchant eligibility, minimum volumes and KYC list: **[U]**. It is realistic only for larger clients. This fits "regional fallback" in the brief.

### Proposed env keys [U]
`CHECKOUT_SECRET_KEY`, `CHECKOUT_API_BASE` (full MSSD URL), `CHECKOUT_PROCESSING_CHANNEL_ID`, `CHECKOUT_WEBHOOK_SIGNING_KEY`.

---

## 8. Credimax (Bahrain), Mastercard Gateway / MPGS Hosted Checkout

Docs are served on Credimax's own gateway host, `https://credimax.gateway.mastercard.com/api/documentation/…`, doc release 26.7.2.0 **[V]**.

### Coverage
- Credimax Payment Gateway: Visa, Mastercard, Discover, Amex, Diners, JCB, **Benefit**, **mada**. Wallets: Apple Pay, Google Pay, Samsung Pay, Click to Pay. Dynamic Currency Conversion. Integrations: Hosted Session and Hosted Checkout **[V]** (https://credimax.com.bh/payment-gateway/). **BenefitPay (wallet) isn't listed.**
- BENEFIT via MPGS: you need a separate merchant account with a BENEFIT member bank (BENEFIT MID + credentials, domain and CNAME registration), and the acquirer must enable it. **PAY only** (no auth/capture). Refund and partial refund are allowed, but **not after 90 days**. BHD only. Integrated as a browser payment (`INITIATE_BROWSER_PAYMENT`, `sourceOfFunds.browserPayment.type = BENEFIT`, `order.notificationUrl` mandatory), WS-API ≥ v100 **[V]** (…/browserPayments/BENEFITGateway.html)

### Auth and environments
- `https://credimax.gateway.mastercard.com/api/rest/version/100/merchant/{merchantId}/…`. **v100 is the latest** **[V]**
- Basic auth: user `merchant.<merchantId>`, password = API password generated in Merchant Administration. Certificate auth is the alternative **[V]**
- **Test = same host, merchant ID prefixed `TEST`** ("Remember you test account Merchant ID is prefixed with TEST<your_merchantid>") **[V]**. The test account is requested from the PSP (Credimax) **[V]**.

### createPaymentSession: INITIATE_CHECKOUT
Sources: …/operation/Hosted%20Checkout:%20Initiate%20Checkout.html, …/hostedCheckout/establishingAsession.html **[V]**
- `POST …/merchant/{merchantId}/session`, `apiOperation: "INITIATE_CHECKOUT"`
- Required: `interaction.operation` (`PURCHASE` | `AUTHORIZE` | `VERIFY` | `NONE`), `interaction.returnUrl`, `interaction.merchant.name` (1–40), `order.amount` (decimal string), `order.currency`. Also sent in the docs example: `order.id`, `order.description`.
- Response: `session.id`, **`successIndicator`**. Store `successIndicator` server-side against the order.
- **There is no redirect URL in the response.** The docs show launching the page client-side:
  ```html
  <script src="https://credimax.gateway.mastercard.com/static/checkout/checkout.min.js"
          data-error="errorCallback" data-cancel="cancelCallback"></script>
  <script>Checkout.configure({ session: { id: '<session.id>' } }); Checkout.showPaymentPage();</script>
  ```
  From API v67, only `session` may be passed to `configure()` **[V]**. For our `{ redirectUrl, sessionId }` interface, `redirectUrl` must therefore point to **our own interstitial page** that loads `checkout.min.js`. `interaction.displayControl`/`PAYMENT_LINK` mode is an alternative for link-style use **[V: PAYMENT_LINK exists; details U]**.
- CSP impact: the interstitial page must allow scripts, frames and connections to `https://credimax.gateway.mastercard.com` in `netlify.toml` **[U]**.

### verifyPayment
Source: …/hostedCheckout/interpretingTheResponse.html **[V]**
- `resultIndicator` is appended to `interaction.returnUrl`. **It must equal the stored `successIndicator`.** Don't use it as a receipt number.
- Then `GET …/merchant/{merchantId}/order/{orderId}` (Retrieve Order) and check the amount **[V]**
- `result` values: `SUCCESS, FAILURE, PENDING, UNKNOWN, ERROR`. Order `status` values include `CAPTURED, AUTHORIZED, FAILED, CANCELLED, INITIATED, REFUNDED, PARTIALLY_REFUNDED, …` **[V]** (Retrieve Order reference)

### handleWebhook
Source: …/pickAdditionalFunctionality/webhookNotifications.html **[V]**
- Configure in Merchant Administration → Admin → Webhook Notifications (global URL). Override per order with `order.notificationUrl`. HTTPS only.
- Auth: **static 32-char secret** in header `X-Notification-Secret`. There is no HMAC. Compare in constant time.
- Up to 20 attempts over 3 days (10s, 30s, 2m, 5m, 30m, 4h×4, 8h, 12h×4). Dedupe on `X-Notification-ID`; `X-Notification-Attempt` counts attempts. Respond 2xx fast (docs cite 2 s and a 30 s timeout).
- The docs themselves say webhooks are not for real-time flows, so re-verify with Retrieve Order **[V]**.

### refund
- `PUT …/merchant/{merchantId}/order/{orderId}/transaction/{newTransactionId}` with `apiOperation: "REFUND"`, `transaction.amount` (decimal, required), `transaction.currency` (required). Don't send `sourceOfFunds` **[V]** (…/operation/Transaction%3a%20%20Refund.html)

### Test data (MPGS standard, all regions)
Source: …/supportedFeatures/testAndGoLive.html **[V]**
- Mastercard `5123450000000008`, `2223000000000007`; Visa `4508750015741019`, `4012000033330026`; Amex `371881634498004`
- mada Mastercard `5297410588409146`; mada Visa `4228180191362993`; mada-only `9682090000000007`
- Expiry drives the result: `01/39` APPROVED, `05/39` DECLINED, `04/27` EXPIRED_CARD, `08/28` TIMED_OUT
- CVV `100` MATCH, `101` NOT_PROCESSED, `102` NO_MATCH (Amex `1000/1010/1020`)
- BENEFIT test flow: …/browserPayments/testDetails.html, not read **[U]**

### Merchant onboarding
Source: https://credimax.com.bh/payment-gateway/ **[V]**
- Signed Payment Gateway agreements; valid website domain; **CR copy**; CPR (Bahrainis) or CPR + passport + residence permit (expats); Articles of Association or partnership deed; Board resolution or MOIC registration form. Then: developer account → test → **certification** → go-live. Apply at https://credimax.com.bh/payment-gateway-application/.

### Proposed env keys [U]
`CREDIMAX_MERCHANT_ID` (with `TEST` prefix in test), `CREDIMAX_API_PASSWORD`, `CREDIMAX_API_VERSION=100`, `CREDIMAX_MERCHANT_NAME`, `CREDIMAX_NOTIFICATION_SECRET`, `CREDIMAX_GATEWAY_HOST=https://credimax.gateway.mastercard.com`.

---

## 9. ZainCash (Iraq)

**Status of sources.** The official docs at https://docs.zaincash.iq/ are titled "Payment Gateway API Documentation v2".
They are behind a Cloudflare JS challenge, so neither WebFetch nor curl could read them. The old docs (`/old/`) now return 404.
Everything below comes from **search-engine snippets of the official site [L]** or **third-party packages [L]**.
Build this adapter last, and only against UAT credentials from ZainCash.

### Coverage
- Iraq, IQD, ZainCash mobile wallet (customer pays with wallet + OTP) **[L]**.

### v2 (current), partially known [L]
- UAT base `https://pg-api-uat.zaincash.iq`
- Auth: OAuth2 client credentials, `POST /oauth2/token` (`grant_type`, `client_id`, `client_secret`, `scope`). "Scopes are … the permissions needed"
- Create: `POST /api/v2/payment-gateway/transaction/init` → response includes a `redirectUrl` to send the customer to
- Return: "ZainCash redirects the customer back to your successUrl or failureUrl with a JWT token". Verify the JWT and/or call the **Inquiry API**. "There is no time limit for checking transaction status"; rate limits apply; "On duplicate errors, perform an inquiry"
- Webhooks: "only works in production and doesn't work in this test environment", and they are optional
- Reversal API exists (refund equivalent)
- **Unknown [U]:** production base URL, exact request field names (amount, order reference, currency, language), JWT algorithm and key for the v2 redirect token, inquiry and reverse paths, webhook signature, v2 test wallets.

### Legacy v1 (JWT), well known from multiple packages [L]
Sources: npm `zaincash` README (https://www.npmjs.com/package/zaincash), `waad/zaincash` Laravel package (https://github.com/waadmawlood/zaincash, updated 2026-03)
- Hosts: test `https://test.zaincash.iq/`, live `https://api.zaincash.iq/`
- Init: `POST /transaction/init` with form fields `token`, `merchantId`, `lang` (`ar` | `en` | `ku`). `token` = JWT signed with the merchant **secret** (HS256) over `{ amount, serviceType, msisdn, orderId, redirectUrl, iat, exp }`. Response `id` = transaction id.
- Pay page: `GET /transaction/pay?id={id}`
- Return: `redirectUrl?token=<JWT>` signed with the same secret: `{ status: "success" | "failed", orderId|orderid, id, msg, iat, exp }`
- Check: `POST /transaction/get` with `token` = JWT `{ id, msisdn, iat, exp }` + `merchantId`
- Amount: integer IQD, **minimum 250 IQD**
- Published sandbox merchant credentials (legacy test env): msisdn `9647835077893`, merchantId `5ffacf6612b5777c6d44266f`, plus a published test secret (in the `waad/zaincash` config). Customer test wallet `9647802999569`, PIN `1234`, OTP `1111` **[L]**
- Refund API on legacy: none found **[U]**
- Whether v1 still accepts new merchants: **[U]**. Assume v2 for any real client.

### Merchant onboarding [L]
- A merchant wallet needs: Chamber of Commerce ID or professional-practice certificate, commercial lease or title deed, owner ID, merchant bank account, residence ID (Iraqis: Civil ID; non-Iraqis: residency card + passport + visa). A "Merchant of Small Projects" wallet tier exists. Live credentials come from the Business Development account manager after the contract (https://zaincash.iq/business-wallets, search snippets of zaincash.iq).

### Proposed env keys [U]
v2: `ZAINCASH_CLIENT_ID`, `ZAINCASH_CLIENT_SECRET`, `ZAINCASH_SCOPE`, `ZAINCASH_API_BASE`, `ZAINCASH_JWT_SECRET` (if the v2 redirect JWT is merchant-secret signed, **[U]**).
Legacy: `ZAINCASH_MSISDN`, `ZAINCASH_MERCHANT_ID`, `ZAINCASH_SECRET`, `ZAINCASH_API_BASE`.

---

## 10. FastPay (Iraq)

Sources: official developer portal https://developer.fast-pay.iq/ (SPA; I read the text from its JS bundle) and the official Postman
collection it links, https://documenter.getpostman.com/view/19338260/2s9YkkeNKN (published 2023-12-26) **[V]**.

### Coverage
- Iraq, **IQD only** ("This should be "IQD" always"), FastPay wallet **[V]**. Customer pays in the FastPay page or app with OTP **[V]**.

### Environments [V]
| | Base URL |
|---|---|
| Staging | `https://staging-apigw-merchant.fast-pay.iq` |
| Production | `https://apigw-merchant.fast-pay.iq` |
| Merchant panel | `https://merchant.fast-pay.iq` (staging: `https://staging-merchant.fast-pay.iq`) |
| Pay page example | `https://staging-pgw.fast-pay.iq/pay?token=…` |

### createPaymentSession: Payment Initiation [V]
- `POST {base}/api/v1/public/pgw/payment/initiation`
- Body: `store_id`, `store_password`, `order_id` (alphanumeric, **8–32 chars**, unique), `bill_amount` (**integer**), `currency` (`"IQD"`), `success_url`, `cancel_url`, `callback_url`, `cart` (items `name, qty, unit_price, sub_total`; the docs show it both as a JSON string and as an array)
- Response: `{ code: 200, messages: [...], data: { redirect_uri } }`. Errors come as `code: 422` with a message.
- Store config (success, cancel and IPN URLs, password) is also set in the merchant panel **[V]**.

### verifyPayment: Payment Validation [V]
- `POST {base}/api/v1/public/pgw/payment/validate` with `store_id`, `store_password`, `order_id`
- `data`: `gw_transaction_id, merchant_order_id, received_amount ("250.00"), currency, customer_name, customer_mobile_number, at, transaction_id, order_id, customer_account_no, status ("Success"), received_at`. Errors return `code` (for example 404) with `data: null`.
- Portal: "It is mandatory to validate a payment using Validation API"; "Must validate amount and incoming amount from your Database."

### handleWebhook: IPN [V]
- `POST` to the IPN URL set in the merchant panel (plus `callback_url` per request). **Sent only for successful payments.**
- Payload = the same fields as Validate. **No signature or secret.** The only defence is to call Validate with our credentials and compare `order_id`, amount and currency.

### refund [V]
- `POST {base}/api/v1/public/pgw/payment/refund` with `store_id`, `store_password`, `order_id`, `amount` (integer), **`refund_secret_key`** (from Store Details in the merchant panel), **`msisdn`** (the customer's FastPay number, `+964…`)
- Errors: amount > transaction, already refunded, invalid secret key. Success returns `data.summary.recipient` and `invoice_id`.
- `POST {base}/api/v1/public/pgw/payment/refund/validation` (`store_id`, `store_password`, `order_id`) → `refund_status` boolean.
- Consequence: we must **store `customer_mobile_number` from Validate** to be able to refund.

### Test data
- The portal publishes **test accounts under its QR-API section** **[V]**: merchant `+9640168881111` / `Password1@`, Store ID `1000007066_485` / Store Password `Password100@`; personal (payer) `+9641814214731` / `Password1@`. Whether these also work for the web PGW on staging is **[U]**.
- Minimum amount: the QR API documents "Minimum amount: 1000". For the web PGW, **[U]**.

### Merchant onboarding
- Contact the FastPay Merchant Acquisition Team. They email system-generated credentials and integration guidelines **[V]** (portal).
- An Iraqi-registered company and an Iraqi bank account; the contract can take a month or more **[L]** (third-party blogs, for example https://www.potan.co/en/blog/local-payment-gateways-in-iraq).

### Proposed env keys [U]
`FASTPAY_STORE_ID`, `FASTPAY_STORE_PASSWORD`, `FASTPAY_REFUND_SECRET_KEY`, `FASTPAY_API_BASE`.

---

## 11. What this means for the `packages/payments` interface

The brief's interface:

```ts
createPaymentSession(order): Promise<{ redirectUrl, sessionId }>
verifyPayment(sessionId): Promise<PaymentStatus>
handleWebhook(req): Promise<PaymentEvent>
refund(paymentId, amount): Promise<RefundResult>
```

The research surfaces several places where the four signatures need more information. These are proposals **[U]**; the architecture doc decides.

1. **`verifyPayment` needs more than `sessionId`.** The id you verify with is often not the session id, and some checks need return-URL params:
   - Tap `tap_id` (charge id)
   - MyFatoorah `paymentId`
   - Checkout.com `cko-payment-id` or `hpp_…`
   - Credimax `resultIndicator` (compared with the stored `successIndicator`), then `orderId`
   - PayTabs `tran_ref` and the signed return POST
   - ZainCash `token` JWT
   - FastPay `order_id`

   Proposal: `verifyPayment({ sessionId, providerRef?, returnParams? })`, plus a persisted `PaymentAttempt { orderId, provider, sessionId, providerRef, amountMinor, currency, successIndicator? }`. In the static `lite` tier there's no DB, so `full` sites need a store: Supabase, or signed state carried through the return URL.
2. **`handleWebhook(req)` must receive the raw body** as bytes or string. PayTabs, Checkout.com and Tap need exact bytes or fields, and Netlify Functions give `event.body` (base64 when `isBase64Encoded`). Every adapter should then **re-fetch status from the API** before marking an order paid. FastPay and Moyasar offer no cryptographic signature, and Credimax only a static secret.
3. **Hosted flow isn't always a URL.** Credimax needs an interstitial page running `checkout.min.js`. Tap BenefitPay needs the Tap web SDK. STC Pay direct APIs (Tap, Moyasar) use OTP, not redirects. Proposal: allow `{ kind: 'redirect', url } | { kind: 'client', script, config }`, or always redirect to our own `/pay/<provider>` interstitial.
4. **`refund` needs provider extras.** FastPay needs `msisdn` + `refund_secret_key`. MyFatoorah refunds in the account's default currency and goes through a manual finance step. Credimax needs a new transaction id. Checkout.com returns 202 (async). Proposal: `refund({ paymentId, amountMinor, currency, reason, idempotencyKey })` returns `{ status: 'succeeded' | 'pending' | 'failed', providerRef }`.
5. **Amount conversion lives in the adapter,** with one tested `toProviderAmount(minor, currency, provider)` per gateway (see §1.4). The Tap hashstring and Checkout.com "last digit 0" rules are special cases worth unit tests.
6. **Mode switch.** Test vs live comes from the key (Tap, Moyasar), a host (MyFatoorah, Checkout.com, FastPay, ZainCash), a test profile (PayTabs), or a `TEST` merchant-id prefix (Credimax). Expose a single `PAYMENTS_MODE=mock|test|live` and let each adapter map it. Refuse to start in `live` with test-looking keys (`sk_test_`, `TEST` prefix, `apitest.`, `staging-`).
7. **Method availability by country and currency** (brief: "currency and country determine which methods render"):
   - KNET needs KWD
   - BENEFIT needs BHD
   - mada and STC Pay need SAR
   - OmanNet needs OMR
   - QPay needs QAR
   - IQD rules out everything except ZainCash, FastPay, PayTabs-Iraq, Checkout.com and COD
   - Moyasar is SAR-merchant only

   Encode this as data in `packages/payments`, not per site.
8. **Webhook URL shape** for `docs/payments.md`: one function per site, for example `https://<site>/.netlify/functions/payment-webhook?provider=<name>`. Several gateways reject non-HTTPS or localhost targets (Tap, Moyasar, MPGS), so test webhooks on a Netlify deploy preview or through a tunnel.
9. **Idempotency and replay.** Tap retries 2×, Moyasar 5×, Checkout.com 8×, MPGS 20×. Key events on `(provider, eventId/notificationId/chargeId+status)`. MockProvider should simulate duplicate and out-of-order deliveries (the brief already asks for webhook replay).

---

## 12. Open items to verify with sandbox accounts

- [ ] Tap: required `customer` fields; whether STC Pay shows on `src_all`; BenefitPay beyond the SDK; IQD support.
- [ ] MyFatoorah: whether a v3 invoice (`NotificationOption: LINK`, no `PaymentMethod`) shows every enabled method (KNET, BENEFIT, mada, Apple Pay, STC Pay); refund-event signature field order; any v3 refund endpoint.
- [ ] Moyasar: methods on the hosted invoice page; `GET /v1/invoices/{id}` shape; STC Pay and Apple Pay sandbox data.
- [ ] PayTabs: Bahrain onboarding and host; Benefit support; partial refunds; decimals for KWD, BHD, OMR and IQD; a JS test vector for the return-signature `http_build_query` encoding.
- [ ] Checkout.com: exact HMAC algorithm in `Cko-Signature`; `processing_channel_id` requirement; SME eligibility in BH, KW and SA.
- [ ] Credimax: BHD decimal format in `order.amount`; BENEFIT test details page; whether a PAYMENT_LINK-style URL avoids the interstitial page.
- [ ] ZainCash v2: every field name, prod URL, redirect-JWT verification key, inquiry and reverse paths, test wallets. Needs direct access to docs.zaincash.iq in a browser or credentials from ZainCash.
- [ ] FastPay: web-PGW minimum amount; whether the staging test accounts work for PGW; whether Validate returns non-success statuses.

---

## 13. Source index

Official (read on 2026-09-23):
- ISO 4217 List One (SIX): https://www.six-group.com/dam/download/financial-information/data-center/iso-currrency/lists/list-one.xml
- Tap: https://developers.tap.company/llms.txt · /reference/create-a-charge · /reference/charges · /docs/redirect · /docs/webhook · /reference/create-a-refund.md · /reference/testing-cards · /docs/knet.md · /docs/benefit.md · /docs/benefitpay-web-sdk.md · /docs/stcpay.md · /docs/mada · /docs/apple-pay · /docs/omannet.md · /docs/qpay.md · /docs/creating-a-merchant-account.md · https://support.tap.company/en/support/solutions/articles/153000242639
- MyFatoorah: https://docs.myfatoorah.com/llms.txt · /docs/api-key.md · /docs/v3-hosted-payment-page · /docs/v3-invoicing · /reference/create-payment.md · /docs/get-payment-details · /reference/get-payment-methods.md · /reference/send-payment.md · /reference/initiate-payment.md · /reference/execute-payment.md · /reference/get-payment-status.md · /reference/make-refund.md · /docs/refund · /docs/webhook-v2.md · /docs/webhook-signature.md · /docs/webhook-v2-payment-status-data-model · /docs/test-cards.md · /docs/live-account.md · /docs/iso-lookups.md
- Moyasar: https://docs.moyasar.com/llms.txt · /docs/getting-started/authentication.md · /api/invoices/01-create-invoice/ · /api/payments/01-create-payment/ · /docs/guides/payment-operations/index.md · /docs/api/other/webhooks/webhook-reference.md · /docs/guides/dashboard/setting-up-webhooks.md · /docs/guides/card-payments/test-cards.md · /docs/guides/multi-currency/introduction.md · /docs/getting-started/go-live-checklist.md · https://moyasar.com/en/resources/faqs/
- PayTabs: https://docs.paytabs.com/manuals/PT-API-Endpoints/Integration-Types-Manuals/Hosted-Payment-Page/HPP-Step-3-Initiating-Payment/HPP-Initiating-Payment · …/HPP-Step-7-Query-Transaction · …/HPP-Step-7-Refund-Transaction · …/Request-Parameter-Payment-Methods/ · …/Request-Response-cart-amount/ · https://support.paytabs.com/en/support/solutions/articles/60000718070 · …/60000718961 · …/60000712315 · https://ai.paytabs.com/en/onboarding-documentation/
- Checkout.com: https://www.checkout.com/docs/llms.txt · /docs/payments/accept-payments/accept-a-payment-on-a-hosted-page · …/manage-your-hosted-payments-page · /docs/payments/accept-payments/create-a-payment-link · /docs/developer-resources/api/api-endpoints · /docs/developer-resources/event-notifications/receive-webhooks · /docs/payments/manage-payments/refund-a-payment · /docs/payments/accept-payments/format-the-amount-value · /docs/payments/add-payment-methods/{knet,benefit-payment-gateway,mada,stc-pay}
- Credimax / MPGS: https://credimax.gateway.mastercard.com/api/documentation/apiDocumentation/rest-json/version/latest/operation/Hosted%20Checkout:%20Initiate%20Checkout.html · …/integrationGuidelines/hostedCheckout/{establishingAsession,implementingTheHostedPaymentPage,interpretingTheResponse}.html · …/gettingStarted/obtainTestAccount.html · …/supportedFeatures/pickAdditionalFunctionality/webhookNotifications.html · …/supportedFeatures/testAndGoLive.html · …/browserPayments/BENEFITGateway.html · …/operation/Transaction%3a%20%20Refund.html · …/operation/Transaction%3a%20%20Retrieve%20Order.html · https://credimax.com.bh/payment-gateway/
- FastPay: https://developer.fast-pay.iq/ (bundle `static/js/main.29decdd3.js`) · https://documenter.getpostman.com/view/19338260/2s9YkkeNKN · https://www.fast-pay.iq/integrate-web

Third-party / snippets (**[L]**):
- ZainCash: https://docs.zaincash.iq/ (search snippets only; the page is behind a Cloudflare challenge) · https://www.npmjs.com/package/zaincash · https://github.com/waadmawlood/zaincash · https://zaincash.iq/business-wallets
- FastPay: https://pub.dev/documentation/fastpay_iraq/latest/ · https://www.potan.co/en/blog/local-payment-gateways-in-iraq
- Tap Kuwait KYC: https://kuwaitdev.com/en/insights/tap-payments-integration-guide-kuwait-2026/
- MyFatoorah/CBK notice: https://blog.najaa.org/fintech/payments/kuwait/regulation/cbk/ecommerce/2026/04/25/cbk-limited-scope-emoney-myfatoorah-kuwait.html
- Checkout.com webhook hash algorithm: https://pkg.go.dev/github.com/iamkanishka/checkout-go/webhook
- Checkout.com UAE licence: https://www.checkout.com/newsroom/checkout-com-becomes-the-first-global-payments-platform-to-secure-acquiring-license-from-the-uae-central-bank
