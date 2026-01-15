import Markdown from "react-markdown";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import faqEn from "@/content/en/faq.md?raw";
import faqDe from "@/content/de/faq.md?raw";

const faqContent: Record<string, string> = {
  en: faqEn,
  de: faqDe,
};

export function FaqPage() {
  const { i18n } = useTranslation();
  const content = faqContent[i18n.language] ?? faqContent.en;

  return (
    <Card>
      <CardContent className="pt-6 prose prose-invert max-w-none">
        <Markdown>{content}</Markdown>
      </CardContent>
    </Card>
  );
}
