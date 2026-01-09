"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/redux";
import { signUp } from "@/store/slices/authSlice";
import { ErrorMessage } from "../ErrorMessage";
import { NameField } from "./NameField";
import { EmailField } from "../EmailField";
import { PasswordInput } from "../PasswordInput";
import { TermsCheckbox } from "./TermsCheckbox";
import { SubmitButton } from "../SubmitButton";
import { Divider } from "../Divider";
import { SocialLoginButtons } from "../SocialLoginButtons";
export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState({});
  const dispatch = useAppDispatch();
  const router = useRouter();
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    try {
      const newErrors = {};
      if (!formData.name.trim()) newErrors.name = "Name is required";
      if (!formData.email) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.email))
        newErrors.email = "Please enter a valid email";
      if (!formData.password) newErrors.password = "Password is required";
      else if (formData.password.length < 6)
        newErrors.password = "Password must be at least 6 characters";
      if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = "Passwords do not match";
      if (!formData.agreeToTerms)
        newErrors.agreeToTerms = "You must agree to the terms and conditions";
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      await dispatch(
        signUp({ password: formData.password, email: formData.email })
      ).unwrap();
      router.push("/dashboard");
    } catch {
      setErrors({
        general: "Failed to create account. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ErrorMessage message={errors.general} />

      <NameField
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        disabled={isLoading}
      />

      <EmailField
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        disabled={isLoading}
      />

      <PasswordInput
        id="password"
        name="password"
        label="Password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        disabled={isLoading}
      />

      <PasswordInput
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm Password"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
        disabled={isLoading}
      />

      <TermsCheckbox
        checked={formData.agreeToTerms}
        onChange={(val) =>
          setFormData((p) => ({
            ...p,
            agreeToTerms: val,
          }))
        }
        error={errors.agreeToTerms}
        disabled={isLoading}
      />
      <SubmitButton
        isLoading={isLoading}
        defaultText="Create Account"
        loadingText="Creating Account..."
      />

      <Divider />

      <SocialLoginButtons isLoading={isLoading} />
    </form>
  );
}
