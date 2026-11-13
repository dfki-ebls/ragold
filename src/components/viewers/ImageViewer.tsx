import { useTranslation } from "react-i18next";
import { type ViewerProps, viewerLoader } from "@/components/viewers/types";
import { ViewerLoading } from "@/components/viewers/ViewerLoading";
import { useResource } from "@/lib/useResource";

const loadUrl = viewerLoader(
  async (blob) => URL.createObjectURL(blob),
  (url) => URL.revokeObjectURL(url),
);

export default function ImageViewer({ file, name }: ViewerProps) {
  const { t } = useTranslation();
  const url = useResource(file, loadUrl);

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
