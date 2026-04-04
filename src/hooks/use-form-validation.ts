'use client';

import { useState, useCallback } from 'react';
import { ZodSchema, ZodError } from 'zod';

export type FieldErrors = Record<string, string>;

export function useFormValidation<T>(schema: ZodSchema<T>) {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback(
    (fieldName: string, value: unknown, allValues: Record<string, unknown>) => {
      const data = { ...allValues, [fieldName]: value };
      const result = schema.safeParse(data);
      if (result.success) {
        setFieldErrors(prev => {
          const next = { ...prev };
          delete next[fieldName];
          return next;
        });
        return '';
      }
      const fieldIssue = result.error.issues.find(
        issue => issue.path[0] === fieldName
      );
      const message = fieldIssue?.message || '';
      setFieldErrors(prev => {
        if (message) {
          return { ...prev, [fieldName]: message };
        }
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
      return message;
    },
    [schema]
  );

  const markTouched = useCallback((fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  }, []);

  const validateAll = useCallback(
    (values: Record<string, unknown>): { success: boolean; data?: T; errors: FieldErrors } => {
      const result = schema.safeParse(values);
      if (result.success) {
        setFieldErrors({});
        return { success: true, data: result.data, errors: {} };
      }
      const errors: FieldErrors = {};
      result.error.issues.forEach(issue => {
        const key = issue.path.join('.');
        if (!errors[key]) {
          errors[key] = issue.message;
        }
      });
      setFieldErrors(errors);
      const allTouched: Record<string, boolean> = {};
      Object.keys(errors).forEach(k => { allTouched[k] = true; });
      setTouched(prev => ({ ...prev, ...allTouched }));
      return { success: false, errors };
    },
    [schema]
  );

  const clearErrors = useCallback(() => {
    setFieldErrors({});
    setTouched({});
  }, []);

  const getFieldError = useCallback(
    (fieldName: string): string | undefined => {
      if (!touched[fieldName]) return undefined;
      return fieldErrors[fieldName];
    },
    [fieldErrors, touched]
  );

  return {
    fieldErrors,
    touched,
    validateField,
    markTouched,
    validateAll,
    clearErrors,
    getFieldError,
  };
}
