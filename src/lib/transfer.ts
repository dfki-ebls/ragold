import { z } from "zod";
import { type Archive, mergeImport, readArchive } from "@/lib/archive";
import { errorMessage } from "@/lib/utils";

/**
 * Receiver side of the transfer from an opener such as hivegent:
 * the opener calls `window.open("<ragold>/#import")`, waits for `ragold:ready`,
 * sends `{ type: "ragold:import", zip }`, and receives `ragold:result`.
 */
const TRANSFER_HASH = "#import";

export interface TransferRequest {
  origin: string;
  archive: Archive;
}

type TransferResult = { ok: true; count: number } | { ok: false; error: string };

const importMessageSchema = z.object({
  type: z.literal("ragold:import"),
  zip: z.instanceof(Blob),
});

// Only one import is accepted per page load.
let received = false;
// Shared across calls until the import is answered, then released with its files.
let pending: Promise<TransferRequest> | undefined;

function opener(): Window | null {
  return window.opener as Window | null;
}

function respond(origin: string, result: TransferResult): void {
  pending = undefined;
  opener()?.postMessage({ type: "ragold:result", ...result }, origin);
  history.replaceState(null, "", location.pathname + location.search);
}

/**
 * Announce readiness to the opener and resolve with the first import message.
 * Returns undefined if the page was not opened for a transfer.
 * If the archive is invalid, the opener is notified and the promise rejects.
 */
export function receiveTransfer(): Promise<TransferRequest> | undefined {
  const source = opener();

  if (received || location.hash !== TRANSFER_HASH || !source) {
    return pending;
  }

  received = true;
  pending = new Promise((resolve, reject) => {
    const onMessage = (event: MessageEvent) => {
      const message = importMessageSchema.safeParse(event.data);

      if (event.source !== source || !message.success) {
        return;
      }

      window.removeEventListener("message", onMessage);
      readArchive(message.data.zip).then(
        (archive) => resolve({ origin: event.origin, archive }),
        (error: unknown) => {
          respond(event.origin, { ok: false, error: errorMessage(error) });
          reject(error);
        },
      );
    };

    window.addEventListener("message", onMessage);
    // The ready message carries no data, so any origin may receive it.
    source.postMessage({ type: "ragold:ready" }, "*");
  });

  return pending;
}

/** Merge the received archive, report the result to the opener, and return the new annotation ids. */
export async function acceptTransfer({ origin, archive }: TransferRequest): Promise<string[]> {
  try {
    const ids = await mergeImport(archive);
    respond(origin, { ok: true, count: ids.length });

    return ids;
  } catch (error) {
    respond(origin, { ok: false, error: errorMessage(error) });
    throw error;
  }
}

export function rejectTransfer({ origin }: TransferRequest): void {
  respond(origin, { ok: false, error: "Import cancelled by the user" });
}
