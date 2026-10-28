import { useTranslation } from "react-i18next";
import { Spinner } from "@/components/ui/spinner";

export function ViewerLoading() {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
      <Spinner />
      {t("viewer.loading")}
    </div>
  );
}
