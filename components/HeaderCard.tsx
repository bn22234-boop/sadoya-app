type HeaderCardProps = {
  label: string;
  title: string;
  description: string;
};

export default function HeaderCard({
  label,
  title,
  description,
}: HeaderCardProps) {
  return (
    <section className="rounded-3xl bg-red-900 p-5 text-white">
      <p className="text-sm opacity-80">{label}</p>
      <h1 className="mt-1 text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-sm opacity-90">{description}</p>
    </section>
  );
}