import { LeafIcon, PackageIcon, SparkleIcon } from "@/components/storefront/icons";

const benefits = [
  { label: "Materiales nobles y duraderos", Icon: LeafIcon },
  { label: "Envíos cuidados a todo el país", Icon: PackageIcon },
  { label: "Diseño pensado para durar", Icon: SparkleIcon },
];

export function Benefits() {
  return (
    <div className="benefits" aria-label="Beneficios de comprar en Lúmina">
      {benefits.map(({ label, Icon }) => (
        <div className="benefit" key={label}>
          <Icon width={19} height={19} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
