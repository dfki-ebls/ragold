import { useCallback, useState } from "react";

export function useFormErrors<T extends string>() {
  const [errors, setErrors] = useState<Partial<Record<T, string>>>({});

  const validate = useCallback(
    (checks: Partial<Record<T, string | undefined | false>>): boolean => {
      const newErrors = Object.fromEntries(
        Object.entries(checks).filter(
          (entry): entry is [string, string] => typeof entry[1] === "string" && entry[1].length > 0,
        ),
      ) as Partial<Record<T, string>>;
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [],
  );

  const clearErrors = useCallback(() => setErrors({}), []);

  return { errors, validate, clearErrors } as const;
}
