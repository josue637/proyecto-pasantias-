import { ChipIcon, PackageIcon, SparkleIcon } from "@/components/storefront/icons";

const benefits = [
  { label: "Tecnología seleccionada", Icon: ChipIcon },
  { label: "Envíos a todo Chile", Icon: PackageIcon },
  { label: "Compra simple y segura", Icon: SparkleIcon },
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
