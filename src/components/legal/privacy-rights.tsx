import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/legal";
import { LegalSection } from "./legal-section";

// How long data is kept, the cookie in use and how to exercise each right.
export function PrivacyRights() {
  return (
    <>
      <LegalSection id="conservacion" title="5. Cuánto tiempo los guardamos">
        <ul>
          <li>
            <strong>Cuenta y simulaciones:</strong> hasta que las borres. Puedes eliminar tu cuenta cuando quieras desde{" "}
            <Link href="/profile">tu perfil</Link>, y con ella se eliminan al momento tus simulaciones y sesiones.
          </li>
          <li>
            <strong>Sesiones:</strong> caducan a los 7 días sin actividad o al cerrar sesión.
          </li>
          <li>
            <strong>Contadores de intentos:</strong> se borran en menos de 24 horas.
          </li>
          <li>
            <strong>Enlaces de verificación del correo:</strong> caducan a la hora.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="cookies" title="6. Cookies">
        <p>
          Solo usamos una cookie, y únicamente si inicias sesión. Es técnica e imprescindible para mantenerte identificado,
          por lo que la ley no exige pedir tu consentimiento (art. 22.2 de la LSSI). No usamos cookies de análisis, de
          publicidad ni de terceros.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-caption">
            <thead className="text-ink">
              <tr className="border-b border-hairline">
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Nombre
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Finalidad
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Duración
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2 pr-4 font-mono break-all">better-auth.session_token</td>
                <td className="py-2 pr-4">Mantener la sesión iniciada</td>
                <td className="py-2">7 días</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>Puedes borrarla desde tu navegador cuando quieras; solo tendrás que volver a iniciar sesión.</p>
      </LegalSection>

      <LegalSection id="derechos" title="7. Tus derechos">
        <p>
          Puedes acceder a tus datos, rectificarlos, pedir que los borremos, oponerte a su tratamiento o limitarlo y
          solicitar su portabilidad. Tus datos están en tu perfil y desde allí puedes borrar la cuenta. Para lo demás,
          escribe a <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> desde el correo de tu cuenta indicando qué
          derecho quieres ejercer. Te responderemos en el plazo máximo de un mes.
        </p>
        <p>
          Si crees que no hemos atendido bien tu solicitud, puedes reclamar ante la{" "}
          <a href="https://www.aepd.es/">Agencia Española de Protección de Datos</a>.
        </p>
      </LegalSection>

      <LegalSection id="menores" title="8. Menores">
        <p>Para crear una cuenta debes tener al menos 14 años.</p>
      </LegalSection>

      <LegalSection id="cambios" title="9. Cambios en esta política">
        <p>
          Si cambiamos algo importante, lo publicaremos aquí con la nueva fecha y, si afecta a tu cuenta, te avisaremos por
          correo.
        </p>
      </LegalSection>
    </>
  );
}
