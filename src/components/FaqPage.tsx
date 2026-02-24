import Markdown from "react-markdown";
import { Card, CardContent } from "@/components/ui/card";
import faqDe from "@/content/de/faq.md?raw";
import faqEn from "@/content/en/faq.md?raw";
import { useTranslation } from "react-i18next";

const contactInfo = import.meta.env.VITE_CONTACT_INFO;

const faqContent: Record<string, string> = {
  en: faqEn,
  de: faqDe,
};

export function FaqPage() {
  const { t, i18n } = useTranslation();
  const raw = faqContent[i18n.language] ?? faqContent.en;
  const content = contactInfo
    ? raw.replace("{{CONTACT_NOTE}}", `${t("faq.contact")} ${contactInfo}.`)
    : raw.replace("\n{{CONTACT_NOTE}}", "");

  return (
    <Card>
      <CardContent className="pt-6 prose dark:prose-invert max-w-none">
        <Markdown>{content}</Markdown>
      </CardContent>
    </Card>
  );
}
