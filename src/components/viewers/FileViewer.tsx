import { FileQuestionMark, SquareArrowOutUpRight } from "lucide-react";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import type { ViewerProps } from "@/components/viewers/types";
import { downloadBlob } from "@/lib/utils";

/** Fallback for file types without a viewer, the file is opened by the operating system. */
function FileViewer({ file, name }: ViewerProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <FileQuestionMark className="size-10 text-muted-foreground/50" />
      <p className="max-w-md text-sm text-muted-foreground">{t("viewer.unsupported")}</p>
      <Button variant="outline" onClick={() => downloadBlob(file.blob, name)}>
        <SquareArrowOutUpRight />
        {t("viewer.openFile")}
      </Button>
    </div>
  );
}

export default memo(FileViewer);
