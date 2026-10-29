import { useTranslation } from "react-i18next";
import type { SelectionOption } from "@/components/SelectionPopover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { TranslationKeys } from "@/i18n/locales/en";
import { PASSAGE_GRADES, type PassageGrade } from "@/lib/types";
import { cn } from "cn";

type ChoiceGroups = Pick<
  TranslationKeys,
  "questionTypes" | "answerabilities" | "passageGrades" | "keyFactImportances"
>;

/** Translated labels and descriptions of `values` from the i18n group `prefix`. */
export function useChoiceOptions<
  P extends keyof ChoiceGroups,
  T extends keyof ChoiceGroups[P] & string,
>(values: readonly T[], prefix: P): SelectionOption<T>[] {
  const { t } = useTranslation();
  const group: keyof ChoiceGroups = prefix;
  const texts: Record<string, { label: string; description: string }> = t(group, {
    returnObjects: true,
  });

  return values.map((value) => ({ value, ...texts[value] }));
}

function optionOf<T extends string>(options: readonly SelectionOption<T>[], value: unknown) {
  return options.find((option) => option.value === value);
}

interface ChoiceProps<T extends string> {
  options: readonly SelectionOption<T>[];
  /** Nothing is selected until the user picks an option. */
  value: T | null;
  onChange: (value: T) => void;
}

/** Single choice as cards that show the full option descriptions. */
export function ChoiceCards<T extends string>({
  id,
  options,
  value,
  onChange,
  className,
  italic,
}: ChoiceProps<T> & {
  id: string;
  className?: string;
  /** Show the descriptions in italics, such as example questions. */
  italic?: boolean;
}) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(next) => {
        const option = optionOf(options, next);
        if (option) onChange(option.value);
      }}
      className={cn("grid-cols-1 gap-2", className)}
    >
      {options.map((option) => (
        <label
          key={option.value}
          htmlFor={`${id}-${option.value}`}
          className="flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition-colors hover:border-primary/50 has-data-checked:border-primary has-data-checked:bg-primary/5"
        >
          <RadioGroupItem id={`${id}-${option.value}`} value={option.value} className="mt-0.5" />
          <span className="space-y-0.5">
            <span className="block text-sm font-medium">{option.label}</span>
            <span className={cn("block text-xs text-muted-foreground", italic && "italic")}>
              {option.description}
            </span>
          </span>
        </label>
      ))}
    </RadioGroup>
  );
}

/** Compact single choice with the option descriptions as tooltips. */
export function ChoiceToggle<T extends string>({ options, value, onChange }: ChoiceProps<T>) {
  return (
    <ToggleGroup
      variant="outline"
      size="sm"
      spacing={0}
      value={value ? [value] : []}
      onValueChange={(values) => {
        const option = optionOf(options, values[0]);
        if (option) onChange(option.value);
      }}
    >
      {options.map((option) => (
        <ToggleGroupItem key={option.value} value={option.value} title={option.description}>
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

export function GradePicker({
  value,
  onChange,
}: {
  value: PassageGrade | null;
  onChange: (grade: PassageGrade) => void;
}) {
  const options = useChoiceOptions(PASSAGE_GRADES, "passageGrades");

  return <ChoiceToggle options={options} value={value} onChange={onChange} />;
}
