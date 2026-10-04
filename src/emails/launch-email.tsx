import { Button, Heading, Text } from "react-email";
import { buttonStyle, EmailShell } from "./email-shell";

type LaunchEmailProps = {
  username: string;
  url: string;
};

export function LaunchEmail({ username, url }: LaunchEmailProps) {
  return (
    <EmailShell
      preview="El simulador ya está abierto: pon tus porcentajes y mira el reparto."
      footer="Recibes este correo porque creaste una cuenta y te prometimos avisarte de la apertura. Es una simulación, no una previsión."
    >
      <Heading as="h1" style={{ fontSize: 24, margin: "0 0 16px" }}>
        El simulador ya está abierto
      </Heading>
      <Text style={{ fontSize: 16, lineHeight: "24px" }}>
        Hola, {username}. Te dijimos que te avisaríamos: ya puedes poner una estimación de voto y
        ver cómo se reparten los 350 escaños, provincia a provincia.
      </Text>
      <Button href={url} style={buttonStyle}>
        Probar el simulador
      </Button>
    </EmailShell>
  );
}
