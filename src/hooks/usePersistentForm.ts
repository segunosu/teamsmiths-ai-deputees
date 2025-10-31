import { useEffect, useState } from "react";

const STORAGE_KEY = "userFormData";

// GDPR Note: This data is stored only in the user's browser (localStorage).
// It never leaves the device until the user submits a form explicitly.

export function usePersistentForm<T extends Record<string, any>>(initialValues: T) {
  const [formData, setFormData] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...initialValues, ...JSON.parse(stored) } : initialValues;
    } catch {
      return initialValues;
    }
  });

  // Save data automatically to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const updateField = (key: keyof T, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const clearData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setFormData(initialValues);
  };

  return { formData, updateField, clearData };
}
