import { Button, Heading, Text } from "react-email";
import { buttonStyle, colors, EmailShell } from "./email-shell";

type ResetPasswordEmailProps = {
  username: string;
  url: string;
};

export function ResetPasswordEmail({ username, url }: ResetPasswordEmailProps) {
  return (
    <EmailShell
      preview="Elige una contraseña nueva para tu cuenta."
      footer="Si no has pedido cambiar la contraseña, ignora este mensaje: la actual sigue siendo válida."
    >
      <Heading as="h1" style={{ fontSize: 24, margin: "0 0 16px" }}>
        Cambia tu contraseña
      </Heading>
      <Text style={{ fontSize: 16, lineHeight: "24px" }}>
        Hola, {username}. Hemos recibido una solicitud para cambiar la contraseña de tu cuenta en el
        Simulador de Elecciones. El enlace caduca en una hora.
      </Text>
      <Button href={url} style={buttonStyle}>
        Elegir contraseña nueva
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
