import { Button, Heading, Text } from "react-email";
import { buttonStyle, colors, EmailShell } from "./email-shell";

type VerifyEmailProps = {
  username: string;
  url: string;
};

export function VerifyEmail({ username, url }: VerifyEmailProps) {
  return (
    <EmailShell
      preview="Confirma tu correo para activar tu cuenta."
      footer="Si no has creado esta cuenta, ignora este mensaje."
    >
      <Heading as="h1" style={{ fontSize: 24, margin: "0 0 16px" }}>
        Confirma tu correo
      </Heading>
      <Text style={{ fontSize: 16, lineHeight: "24px" }}>
        Hola, {username}. Para activar tu cuenta en el Simulador de Elecciones, confirma que este
        correo es tuyo.
      </Text>
      <Button href={url} style={buttonStyle}>
        Confirmar correo
      </Button>
      <Text style={{ fontSize: 14, lineHeight: "20px", color: colors.muted }}>
        Si el botón no funciona, copia este enlace en tu navegador:
        <br />
        <a href={url} style={{ color: colors.primary, wordBreak: "break-all" }}>
          {url}
        </a>
      </Text>
    </EmailShell>
  );
}
