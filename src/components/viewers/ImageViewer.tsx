import { memo } from "react";
import { useTranslation } from "react-i18next";
import type { ViewerProps } from "@/components/viewers/types";
import { ViewerLoading } from "@/components/viewers/ViewerLoading";
import { useResource } from "@/lib/useResource";

async function createUrl(blob: Blob): Promise<string> {
  return URL.createObjectURL(blob);
}

function revokeUrl(url: string): void {
  URL.revokeObjectURL(url);
}

function ImageViewer({ blob, name }: ViewerProps) {
  const { t } = useTranslation();
  const url = useResource(blob, createUrl, revokeUrl);

  if (url === undefined) {
    return <ViewerLoading />;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{t("viewer.image")}</p>
      <img src={url} alt={name} className="mx-auto max-w-full" />
    </div>
  );
}

export default memo(ImageViewer);
