import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  acceptTransfer,
  receiveTransfer,
  rejectTransfer,
  type TransferRequest,
} from "@/lib/transfer";
import { errorMessage } from "@/lib/utils";

/** Confirms imports sent by the window that opened RAGold with `#import`. */
export function TransferDialog() {
  const { t } = useTranslation();
  const [request, setRequest] = useState<TransferRequest | null>(null);

  useEffect(() => {
    let active = true;
    receiveTransfer()?.then(
      (received) => active && setRequest(received),
      (error: unknown) =>
        active && toast.error(t("header.importError", { message: errorMessage(error) })),
    );

    return () => {
      active = false;
    };
  }, [t]);

  const handleConfirm = async () => {
    if (!request) {
      return;
    }

    setRequest(null);

    try {
      const count = await acceptTransfer(request);
      toast.success(t("header.importSuccess", { count }));
    } catch (error) {
      toast.error(t("header.importError", { message: errorMessage(error) }));
    }
  };

  const handleCancel = () => {
    if (request) {
      rejectTransfer(request);
      setRequest(null);
      toast.info(t("transfer.cancelled"));
    }
  };

  return (
    <AlertDialog
      open={request !== null}
      onOpenChange={(open) => {
        if (!open) handleCancel();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("transfer.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {request &&
              t("transfer.description", {
                origin: request.origin,
                annotations: Object.keys(request.archive.data.annotations).length,
                documents: Object.keys(request.archive.data.documents).length,
              })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>{t("common.import")}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
