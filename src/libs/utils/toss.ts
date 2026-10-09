/**
 * Toss Payments server API (payment widget, V2).
 * https://docs.tosspayments.com/reference
 *
 * Only the server talks to these endpoints: they authenticate with the secret
 * key, which must never reach the browser.
 */

const TOSS_API = "https://api.tosspayments.com/v1/payments";

/** The parts of the Toss Payment object this app reads. */
export interface TossPayment {
  paymentKey: string;
  orderId: string;
  status: string; // DONE, WAITING_FOR_DEPOSIT, CANCELED, ...
  totalAmount: number;
  method?: string;
  approvedAt?: string;
}

/** Toss answered with an error body ({ code, message }). */
export class TossApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

// Read lazily: env is loaded by dotenv in server.ts.
export const isTossConfigured = () => Boolean(process.env.TOSS_SECRET_KEY);

// Basic auth with the secret key as the user name and an empty password. The
// trailing colon is required; leaving it out is the most common mistake.
const authHeader = () =>
  "Basic " + Buffer.from(`${process.env.TOSS_SECRET_KEY}:`).toString("base64");

const call = async (
  url: string,
  init: { method: string; body?: unknown; idempotencyKey?: string },
): Promise<TossPayment> => {
  const headers: Record<string, string> = {
    Authorization: authHeader(),
    "Content-Type": "application/json",
  };
  if (init.idempotencyKey) headers["Idempotency-Key"] = init.idempotencyKey;

  const response = await fetch(url, {
    method: init.method,
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    signal: AbortSignal.timeout(30_000),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new TossApiError(
      response.status,
      String(data?.code ?? "UNKNOWN"),
      String(data?.message ?? response.statusText),
    );
  return data as TossPayment;
};

/**
 * Approves a payment the buyer has authorised in the widget. Until this call
 * succeeds no money moves. The payment key doubles as the idempotency key, so
 * a retried request returns the first response instead of charging twice.
 */
export const confirmTossPayment = (input: {
  paymentKey: string;
  orderId: string;
  amount: number;
}) =>
  call(`${TOSS_API}/confirm`, {
    method: "POST",
    body: input,
    idempotencyKey: input.paymentKey,
  });

export const getTossPayment = (paymentKey: string) =>
  call(`${TOSS_API}/${encodeURIComponent(paymentKey)}`, { method: "GET" });
