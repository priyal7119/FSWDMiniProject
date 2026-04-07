// Form Validation Utility
// Provides comprehensive validation functions for various form fields

export class FormValidator {
  // Email validation
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Password validation (min 8 chars, 1 uppercase, 1 number, 1 special char)
  static isStrongPassword(password) {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  // Phone number validation
  static isValidPhone(phone) {
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  }

  // URL validation
  static isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Username validation (3-20 chars, alphanumeric + underscore)
  static isValidUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  }

  // Name validation
  static isValidName(name) {
    return name.trim().length >= 2 && name.trim().length <= 100;
  }

  // Required field check
  static isRequired(value) {
    return value !== null && value !== undefined && value.toString().trim() !== "";
  }

  // File size validation (in MB)
  static isValidFileSize(file, maxSizeMB) {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  // File type validation
  static isValidFileType(file, allowedTypes) {
    return allowedTypes.includes(file.type);
  }

  // Validate entire form object
  static validateForm(formData, rules) {
    const errors = {};

    for (const field in rules) {
      const rule = rules[field];
      const value = formData[field];

      if (rule.required && !this.isRequired(value)) {
        errors[field] = `${field} is required`;
        continue;
      }

      if (rule.type === "email" && value && !this.isValidEmail(value)) {
        errors[field] = "Please enter a valid email address";
      } else if (rule.type === "password" && value && !this.isStrongPassword(value)) {
        errors[field] = "Password must contain at least 8 characters, 1 uppercase letter, 1 number, and 1 special character";
      } else if (rule.type === "phone" && value && !this.isValidPhone(value)) {
        errors[field] = "Please enter a valid phone number";
      } else if (rule.type === "url" && value && !this.isValidUrl(value)) {
        errors[field] = "Please enter a valid URL";
      } else if (rule.type === "username" && value && !this.isValidUsername(value)) {
        errors[field] = "Username must be 3-20 characters and contain only letters, numbers, and underscores";
      } else if (rule.type === "name" && value && !this.isValidName(value)) {
        errors[field] = "Please enter a valid name (2-100 characters)";
      } else if (rule.minLength && value && value.length < rule.minLength) {
        errors[field] = `${field} must be at least ${rule.minLength} characters`;
      } else if (rule.maxLength && value && value.length > rule.maxLength) {
        errors[field] = `${field} must not exceed ${rule.maxLength} characters`;
      } else if (rule.pattern && value && !rule.pattern.test(value)) {
        errors[field] = rule.errorMessage || "Invalid format";
      }
    }

    return errors;
  }

  // Get error message
  static getErrorMessage(fieldName, validationType) {
    const messages = {
      required: `${fieldName} is required`,
      email: "Please enter a valid email address",
      password: "Password must be at least 8 characters with uppercase, number, and special character",
      phone: "Please enter a valid phone number",
      url: "Please enter a valid URL",
      username: "Username must be 3-20 characters (letters, numbers, underscores only)",
      name: "Please enter a valid name",
    };
    return messages[validationType] || "Invalid input";
  }
}

// Custom validation hook for React components
export function useFormValidation(initialState, onSubmit) {
  const [values, setValues] = React.useState(initialState);
  const [errors, setErrors] = React.useState({});
  const [touched, setTouched] = React.useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = FormValidator.validateForm(values, {
      email: { required: true, type: "email" },
      password: { required: true, type: "password" },
    });
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit(values);
    }
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
  };
}

export default FormValidator;
