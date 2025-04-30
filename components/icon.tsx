import { FaInstagram, FaFacebook, FaPinterest } from "react-icons/fa";

export default function Icon({
  icon,
  size = 16,
}: {
  icon: string;
  size?: number;
}) {
  if (icon === "instagram") {
    return <FaInstagram size={size} />;
  }
  if (icon === "facebook") {
    return <FaFacebook size={size} />;
  }
  if (icon === "pinterest") {
    return <FaPinterest size={size} />;
  }
}
