import Markdown from "react-markdown";
import { Card, CardContent } from "@/components/ui/card";
import faqDe from "@/content/de/faq.md?raw";
import faqEn from "@/content/en/faq.md?raw";
import { useTranslation } from "react-i18next";

const faqContent: Record<string, string> = {
  en: faqEn,
  de: faqDe,
};

export function FaqPage() {
  const { i18n } = useTranslation();
  const content = faqContent[i18n.language] ?? faqContent.en;

  return (
    <Card>
      <CardContent className="pt-6 prose dark:prose-invert max-w-none">
        <Markdown>{content}</Markdown>
      </CardContent>
    </Card>
  );
}
