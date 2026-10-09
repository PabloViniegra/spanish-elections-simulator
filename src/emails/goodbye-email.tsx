import { Button, Heading, Text } from "react-email";
import { CONTACT_EMAIL } from "@/lib/legal";
import { buttonStyle, colors, EmailShell } from "./email-shell";

type GoodbyeEmailProps = {
  username: string;
  url: string;
};

export function GoodbyeEmail({ username, url }: GoodbyeEmailProps) {
  return (
    <EmailShell
      preview="Hemos eliminado tu cuenta y todas tus simulaciones."
      footer="Recibes este correo porque se ha eliminado tu cuenta. Es el último que te enviaremos."
    >
      <Heading as="h1" style={{ fontSize: 24, margin: "0 0 16px" }}>
        Tu cuenta se ha eliminado
      </Heading>
      <Text style={{ fontSize: 16, lineHeight: "24px" }}>
        Hola, {username}. Hemos borrado tu cuenta del Simulador de Elecciones junto con tus datos y
        todas tus simulaciones guardadas. Gracias por haberlo usado.
      </Text>
      <Text style={{ fontSize: 16, lineHeight: "24px" }}>
        Si cambias de idea, puedes crear una cuenta nueva cuando quieras.
      </Text>
      <Button href={url} style={buttonStyle}>
        Volver al simulador
      </Button>
      <Text style={{ fontSize: 14, lineHeight: "20px", color: colors.muted }}>
        Si no has sido tú, escríbenos a{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: colors.primary }}>
          {CONTACT_EMAIL}
        </a>
        .
      </Text>
    </EmailShell>
  );
}
