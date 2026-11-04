import { WhatsAppIcon } from "@/components/storefront/icons";

const message = encodeURIComponent(
  "Hola, quiero recibir información sobre los productos de Lúmina.",
);

export function WhatsAppButton() {
  return (
    <a
      className="whatsapp-float"
      href={`https://api.whatsapp.com/send?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Compartir por WhatsApp"
      title="Compartir por WhatsApp"
    >
      <WhatsAppIcon width={27} height={27} />
    </a>
  );
}
