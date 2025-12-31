"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { ErrorMessage } from "../ErrorMessage";
import { EmailField } from "../EmailField";
import { PasswordInput } from "../PasswordInput";
import { SubmitButton } from "../SubmitButton";
import { Divider } from "../Divider";
import { SocialLoginButtons } from "../SocialLoginButtons";
export function SignInForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const {
    signIn
  } = useAuth();
  const router = useRouter();

  // <-- unified event-based handler
  const handleChange = e => {
    const {
      name,
      value,
      type,
      checked
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };
  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Validation
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Please enter a valid email";
    if (!formData.password) newErrors.password = "Password is required";else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }
    try {
      await signIn(formData.email, formData.password);
      router.push("/dashboard");
    } catch {
      setErrors({
        general: "Invalid email or password"
      });
    } finally {
      setIsLoading(false);
    }
  };
  return <form onSubmit={handleSubmit} className="space-y-4">
      <ErrorMessage message={errors.general} />

      <EmailField value={formData.email} error={errors.email} onChange={handleChange} // pass event handler directly
    disabled={isLoading} />

      <PasswordInput id="password" name="password" // ensure name="password"
    value={formData.password} onChange={handleChange} // pass event handler directly
    error={errors.password} disabled={isLoading} />

      <SubmitButton isLoading={isLoading} defaultText="Sign In" loadingText="Signing In..." />

      <Divider />

      <SocialLoginButtons isLoading={isLoading} />
    </form>;
}