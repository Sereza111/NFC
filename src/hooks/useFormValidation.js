import { useState, useCallback } from 'react'

export const useFormValidation = (initialValues = {}) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  // Валидаторы
  const validators = {
    required: (value, fieldName) => {
      if (!value || value.trim() === '') {
        return 'Это поле обязательно для заполнения'
      }
      return null
    },
    
    email: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        return 'Введите корректный email'
      }
      return null
    },
    
    phone: (value) => {
      const phoneDigits = value.replace(/\D/g, '')
      if (phoneDigits.length !== 11) {
        return 'Введите корректный номер телефона'
      }
      return null
    },
    
    fullname: (value) => {
      const parts = value.trim().split(/\s+/)
      if (parts.length < 2) {
        return 'Введите фамилию и имя'
      }
      if (parts.some(part => part.length < 2)) {
        return 'Слишком короткое имя или фамилия'
      }
      return null
    }
  }

  // Валидация одного поля
  const validateField = useCallback((name, value, rules = []) => {
    for (const rule of rules) {
      const error = validators[rule]?.(value, name)
      if (error) {
        return error
      }
    }
    return null
  }, [])

  // Валидация всех полей
  const validateAll = useCallback((fieldRules) => {
    const newErrors = {}
    
    Object.keys(fieldRules).forEach(fieldName => {
      const value = values[fieldName] || ''
      const rules = fieldRules[fieldName]
      const error = validateField(fieldName, value, rules)
      
      if (error) {
        newErrors[fieldName] = error
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [values, validateField])

  // Обработчик изменения поля
  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setValues(prev => ({ ...prev, [name]: value }))
    
    // Очистить ошибку при начале ввода
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }, [errors])

  // Обработчик потери фокуса
  const handleBlur = useCallback((e, rules = []) => {
    const { name, value } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    
    const error = validateField(name, value, rules)
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }))
    }
  }, [validateField])

  // Установить значение поля
  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }))
  }, [])

  // Сброс формы
  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setValue,
    validateAll,
    validateField,
    reset,
    setValues
  }
}

