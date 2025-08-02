import { useState, useCallback } from 'react';

export interface ValidationRule<T> {
  validate: (value: T) => string | null;
  message?: string;
}

export interface ValidationErrors {
  [key: string]: string | undefined;
}

interface UseFormValidationReturn<T> {
  values: T;
  errors: ValidationErrors;
  isValid: boolean;
  setValue: <K extends keyof T>(key: K, value: T[K]) => void;
  setError: (key: string, error: string | null) => void;
  validateField: (key: string) => boolean;
  validateAll: () => boolean;
  reset: () => void;
  clearErrors: () => void;
}

export const useFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  validationRules: Partial<Record<keyof T, ValidationRule<T[keyof T]>>>
): UseFormValidationReturn<T> => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors>({});

  // フィールドの値を設定
  const setValue = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValues(prev => ({ ...prev, [key]: value }));
    
    // リアルタイム検証
    const rule = validationRules[key];
    if (rule) {
      const error = rule.validate(value);
      setErrors(prev => ({
        ...prev,
        [key as string]: error || undefined
      }));
    }
  }, [validationRules]);

  // エラーを設定
  const setError = useCallback((key: string, error: string | null) => {
    setErrors(prev => ({
      ...prev,
      [key]: error || undefined
    }));
  }, []);

  // 特定のフィールドを検証
  const validateField = useCallback((key: string): boolean => {
    const rule = validationRules[key as keyof T];
    if (!rule) return true;

    const value = values[key as keyof T];
    const error = rule.validate(value);
    
    setErrors(prev => ({
      ...prev,
      [key]: error || undefined
    }));

    return !error;
  }, [values, validationRules]);

  // すべてのフィールドを検証
  const validateAll = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(key => {
      const rule = validationRules[key as keyof T];
      if (rule) {
        const value = values[key as keyof T];
        const error = rule.validate(value);
        if (error) {
          newErrors[key] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validationRules]);

  // フォームをリセット
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  // エラーをクリア
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // 有効性を計算
  const isValid = Object.values(errors).every(error => !error);

  return {
    values,
    errors,
    isValid,
    setValue,
    setError,
    validateField,
    validateAll,
    reset,
    clearErrors
  };
};

// 金額の検証ルール
export const createAmountValidationRule = (): ValidationRule<string> => ({
  validate: (value: string) => {
    if (!value.trim()) {
      return '金額を入力してください';
    }
    
    // 全角数字を検出
    if (/[０-９]/.test(value)) {
      return '数字は半角で入力してください（例: 1000）';
    }
    
    // 不正な文字を検出
    if (!/^-?[0-9]*\.?[0-9]*$/.test(value)) {
      return '数字のみ入力してください（例: 1000 または 1000.50）';
    }
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return '有効な数字を入力してください';
    }
    
    if (numValue <= 0) {
      return '金額は0より大きい値を入力してください';
    }
    
    if (numValue > 10000000) {
      return '金額は1,000万円以下で入力してください';
    }
    
    // 小数点以下2桁まで
    if (value.includes('.') && value.split('.')[1]?.length > 2) {
      return '小数点以下は2桁まで入力してください';
    }
    
    return null;
  }
});

// 日付の検証ルール
export const createDateValidationRule = (): ValidationRule<string> => ({
  validate: (value: string) => {
    if (!value) {
      return '日付を選択してください';
    }
    
    const selectedDate = new Date(value);
    const today = new Date();
    const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    const oneYearLater = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
    
    if (selectedDate > oneYearLater) {
      return '1年以上先の日付は選択できません';
    }
    
    if (selectedDate < oneYearAgo) {
      return '1年以上前の日付は選択できません';
    }
    
    return null;
  }
});