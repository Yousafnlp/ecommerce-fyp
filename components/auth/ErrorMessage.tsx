interface ErrorMessageProps {
  message?: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;
  return (
    <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
      {message}
    </div>
  );
}
