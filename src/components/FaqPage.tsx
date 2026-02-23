import { useTranslation } from "react-i18next";
import Markdown from "react-markdown";
import { Card, CardContent } from "@/components/ui/card";
import faqDe from "@/content/de/faq.md?raw";
import faqEn from "@/content/en/faq.md?raw";

const faqContent: Record<string, string> = {
  en: faqEn,
  de: faqDe,
};

const contactInfo = import.meta.env.VITE_CONTACT_INFO;

export function FaqPage() {
  const { t, i18n } = useTranslation();
  const content = faqContent[i18n.language] ?? faqContent.en;

  return (
    <Card>
      <CardContent className="pt-6 prose dark:prose-invert max-w-none">
        <Markdown>{content}</Markdown>
        {contactInfo && (
          <div className="mt-8 pt-6 border-t">
            <h2>{t("faq.contact")}</h2>
            <p>{contactInfo}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
