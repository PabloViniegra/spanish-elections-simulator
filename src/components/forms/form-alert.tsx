import { Notice } from "@/components/feedback/notice";

export function FormAlert({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <Notice tone="error" role="alert" focusable>
      {message}
    </Notice>
  );
}
