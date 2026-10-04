import { Body, Button, Container, Head, Heading, Html, Preview, Text } from "react-email";

type VerifyEmailProps = {
  username: string;
  url: string;
};

const colors = {
  canvas: "#ffffff",
  parchment: "#f5f5f7",
  primary: "#0066cc",
  ink: "#1d1d1f",
  muted: "#7a7a7a",
  hairline: "#e0e0e0",
};

export function VerifyEmail({ username, url }: VerifyEmailProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>Confirma tu correo para activar tu cuenta.</Preview>
      <Body style={{ backgroundColor: colors.parchment, margin: 0, padding: "32px 16px" }}>
        <Container
          style={{
            backgroundColor: colors.canvas,
            borderRadius: 12,
            maxWidth: 480,
            padding: 32,
            fontFamily: "Inter, Helvetica, Arial, sans-serif",
            color: colors.ink,
          }}
        >
          <Heading as="h1" style={{ fontSize: 24, margin: "0 0 16px" }}>
            Confirma tu correo
          </Heading>
          <Text style={{ fontSize: 16, lineHeight: "24px" }}>
            Hola, {username}. Para activar tu cuenta en el Simulador de Elecciones, confirma que
            este correo es tuyo.
          </Text>
          <Button
            href={url}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 8,
              color: colors.canvas,
              display: "inline-block",
              fontSize: 16,
              padding: "12px 24px",
              textDecoration: "none",
            }}
          >
            Confirmar correo
          </Button>
          <Text style={{ fontSize: 14, lineHeight: "20px", color: colors.muted }}>
            Si el botón no funciona, copia este enlace en tu navegador:
            <br />
            <a href={url} style={{ color: colors.primary, wordBreak: "break-all" }}>
              {url}
            </a>
          </Text>
          <Text
            style={{
              borderTop: `1px solid ${colors.hairline}`,
              color: colors.muted,
              fontSize: 12,
              marginTop: 24,
              paddingTop: 16,
            }}
          >
            Si no has creado esta cuenta, ignora este mensaje.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
