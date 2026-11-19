import { NonRetriableError } from "inngest";

/** Hard cap for a single AI provider request, so a node can't hang forever. */
export const AI_REQUEST_TIMEOUT_MS = 120_000;

type ErrorLike = Error & {
  statusCode?: unknown;
  isRetryable?: unknown;
  cause?: unknown;
  response?: { status?: unknown };
};

const PERMANENT_AI_ERROR_NAMES = new Set([
  "AI_NoSuchModelError",
  "AI_LoadAPIKeyError",
  "AI_InvalidPromptError",
  "AI_InvalidArgumentError",
  "AI_UnsupportedFunctionalityError",
]);

function asErrorLike(error: unknown): ErrorLike | undefined {
  return error instanceof Error ? (error as ErrorLike) : undefined;
}

function isAbortLike(error: unknown): boolean {
  const err = asErrorLike(error);

  if (!err) {
    return false;
  }

  if (err.name === "TimeoutError" || err.name === "AbortError") {
    return true;
  }

  const cause = asErrorLike(err.cause);
  return cause?.name === "TimeoutError" || cause?.name === "AbortError";
}

function timeoutError(error: unknown): NonRetriableError {
  return new NonRetriableError(
    `AI request timed out after ${Math.round(AI_REQUEST_TIMEOUT_MS / 1000)}s`,
    { cause: error },
  );
}

function isNonRetriableStatus(status: number | undefined): boolean {
  if (status === undefined) {
    return false;
  }

  // These can be transient, even though they are 4xx.
  if (status === 408 || status === 409 || status === 429) {
    return false;
  }

  return status >= 400 && status < 500;
}

/**
 * Converts permanent errors (bad model, bad key, bad request, 4xx HTTP
 * responses) into `NonRetriableError` so Inngest stops retrying them.
 *
 * Retryable failures (408, 409, 429, 5xx, network) are returned untouched.
 *
 * Classification is done by error `name`/shape instead of `instanceof`,
 * because the AI SDK providers can bundle their own copy of
 * `@ai-sdk/provider`, which makes cross-package `instanceof` checks fail.
 */
export function toNonRetriableError(error: unknown): unknown {
  if (error instanceof NonRetriableError) {
    return error;
  }

  const err = asErrorLike(error);

  if (!err) {
    return error;
  }

  if (isAbortLike(err)) {
    return timeoutError(err);
  }

  if (err.name === "AI_APICallError") {
    const status =
      typeof err.statusCode === "number" ? err.statusCode : undefined;
    const retryable = err.isRetryable !== false;

    if (!retryable || isNonRetriableStatus(status)) {
      return new NonRetriableError(
        `AI API error${status ? ` (${status})` : ""}: ${err.message}`,
        { cause: err },
      );
    }

    return err;
  }

  // ky (used by the HTTP Request node) throws HTTPError for non-2xx responses.
  if (err.name === "HTTPError") {
    const status =
      typeof err.response?.status === "number" ? err.response.status : undefined;

    if (isNonRetriableStatus(status)) {
      return new NonRetriableError(
        `HTTP request failed${status ? ` (${status})` : ""}: ${err.message}`,
        { cause: err },
      );
    }

    return err;
  }

  // ky (v2) throws a plain TypeError when the URL is malformed, which is a
  // permanent config error. A real network failure surfaces as a
  // `NetworkError` instead and should still be retried, so only the URL-parse
  // message is matched here.
  if (err.name === "TypeError" && /failed to parse url/i.test(err.message)) {
    return new NonRetriableError(`Invalid URL: ${err.message}`, { cause: err });
  }

  if (PERMANENT_AI_ERROR_NAMES.has(err.name)) {
    return new NonRetriableError(err.message, { cause: err });
  }

  // Inngest wraps step failures (e.g. in a `StepError`) with the original
  // error in `cause`. If the wrapper itself isn't recognizable, classify its
  // cause instead so the real failure (bad URL, bad key, etc.) still stops
  // retries.
  if (err.cause !== undefined && err.cause !== err) {
    const causeResult = toNonRetriableError(err.cause);
    if (causeResult instanceof NonRetriableError) {
      return causeResult;
    }
  }

  return error;
}
