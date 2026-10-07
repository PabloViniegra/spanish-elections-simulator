type ProfileDetailsProps = {
  username: string;
  email: string;
  province?: string;
  usageProfile: string;
  memberSince: string;
};

export function ProfileDetails({ username, email, province, usageProfile, memberSince }: ProfileDetailsProps) {
  const rows = [
    ["Usuario", username],
    ["Correo electrónico", email],
    ["Provincia", province ?? "Sin indicar"],
    ["Perfil de uso", usageProfile],
    ["En el simulador desde", memberSince],
  ];
  return (
    <section aria-labelledby="datos" className="flex flex-col gap-4 lg:sticky lg:top-8">
      <h2 id="datos" className="text-tagline">
        Tus datos
      </h2>
      <dl className="flex flex-col divide-y divide-hairline border-y border-hairline">
        {rows.map(([term, value]) => (
          <div key={term} className="flex flex-col gap-0.5 py-3">
            <dt className="text-caption text-ink-muted-80">{term}</dt>
            <dd className="text-body break-words">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
