import type { ReactNode } from "react";
import { Body, Container, Head, Html, Preview, Text } from "react-email";

export const colors = {
  canvas: "#ffffff",
  parchment: "#f5f5f7",
  primary: "#0066cc",
  ink: "#1d1d1f",
  muted: "#7a7a7a",
  hairline: "#e0e0e0",
};

export const buttonStyle = {
  backgroundColor: colors.primary,
  borderRadius: 8,
  color: colors.canvas,
  display: "inline-block",
  fontSize: 16,
  padding: "12px 24px",
  textDecoration: "none",
};

type EmailShellProps = {
  preview: string;
  footer: string;
  children: ReactNode;
};

// Parchment page, white card and a hairline-separated footnote shared by every email.
export function EmailShell({ preview, footer, children }: EmailShellProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: colors.parchment, margin: 0, padding: "32px 16px" }}>
        <Container
          style={{
            backgroundColor: colors.canvas,
            borderRadius: 12,
            maxWidth: 480,
            padding: 32,
            fontFamily: "Hanken Grotesk, Helvetica, Arial, sans-serif",
            color: colors.ink,
          }}
        >
          {children}
          <Text
            style={{
              borderTop: `1px solid ${colors.hairline}`,
              color: colors.muted,
              fontSize: 12,
              marginTop: 24,
              paddingTop: 16,
            }}
          >
            {footer}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
