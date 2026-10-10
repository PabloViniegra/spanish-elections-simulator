import { CONTACT_EMAIL, CONTROLLER_NAME } from "@/lib/legal";
import { LegalSection } from "./legal-section";

const processors = [
  { name: "Vercel Inc.", role: "Alojamiento de la web y estadísticas de visitas", country: "EE. UU." },
  { name: "Neon Inc.", role: "Base de datos de cuentas y simulaciones", country: "servidores en Fráncfort, UE" },
  { name: "Resend (Plus Five Five Inc.)", role: "Envío de correos electrónicos", country: "EE. UU." },
];

// Who is responsible, what is collected, why and who else processes it.
export function PrivacyData() {
  return (
    <>
      <LegalSection id="responsable" title="1. Responsable">
        <p>
          El responsable del tratamiento es <strong>{CONTROLLER_NAME}</strong>, autor de este proyecto sin ánimo de lucro.
          Para cualquier cuestión sobre tus datos escribe a <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </LegalSection>

      <LegalSection id="datos" title="2. Qué datos tratamos">
        <p>Puedes simular, compartir y descargar sin cuenta. Para guardar escenarios en tu perfil necesitas registrarte. Tratamos datos personales en estos casos:</p>
        <ul>
          <li>
            <strong>Si creas una cuenta:</strong> nombre de usuario, correo electrónico y contraseña (almacenada mediante un
            hash seguro con sal usando scrypt, nunca en claro ni con cifrado reversible). Si quieres, también tu provincia y tu perfil de uso.
          </li>
          <li>
            <strong>Si guardas simulaciones:</strong> el nombre que les pones, el escenario y la fecha.
          </li>
          <li>
            <strong>Mientras tienes la sesión iniciada:</strong> la dirección IP y el navegador desde los que entraste, para
            proteger tu cuenta.
          </li>
          <li>
            <strong>Al iniciar sesión o registrarte:</strong> la dirección IP y el correo o usuario con el que lo intentas,
            para limitar los intentos y frenar ataques.
          </li>
          <li>
            <strong>En cualquier visita:</strong> estadísticas anónimas de Vercel Analytics (página visitada sin sus
            parámetros, página de procedencia, país, navegador y tipo de dispositivo). No usan cookies ni permiten saber
            quién eres.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="finalidades" title="3. Para qué y con qué base legal">
        <ul>
          <li>
            <strong>Darte la cuenta y guardar tus simulaciones</strong>, incluidos el correo para verificar tu dirección y el
            que confirma que has borrado la cuenta. Base: la ejecución del servicio que solicitas (art. 6.1.b del RGPD).
          </li>
          <li>
            <strong>Mantener la web segura</strong> frente a abusos y accesos indebidos. Base: interés legítimo (art. 6.1.f
            del RGPD).
          </li>
          <li>
            <strong>Saber qué páginas se usan</strong> para mejorar la web, con datos agregados. Base: interés legítimo
            (art. 6.1.f del RGPD).
          </li>
          <li>
            <strong>Avisarte por correo de cambios importantes del servicio.</strong> Base: interés legítimo. No enviamos
            publicidad.
          </li>
        </ul>
        <p>No vendemos tus datos ni los usamos para perfiles, publicidad o decisiones automatizadas.</p>
      </LegalSection>

      <LegalSection id="destinatarios" title="4. Quién más los trata">
        <p>
          No cedemos datos a terceros. Estos proveedores los tratan por nuestra cuenta, solo para prestar su servicio:
        </p>
        <ul>
          {processors.map(({ name, role, country }) => (
            <li key={name}>
              <strong>{name}</strong>: {role} ({country}).
            </li>
          ))}
        </ul>
        <p>
          Tus datos de cuenta y simulaciones se guardan en la Unión Europea. Como los proveedores son empresas
          estadounidenses, puede haber transferencias internacionales, amparadas por el Marco de Privacidad de Datos
          UE-EE. UU. o por las cláusulas contractuales tipo de la Comisión Europea.
        </p>
      </LegalSection>
    </>
  );
}
