import Link from "next/link";

export default function Button({
  children,
  onClick,
  href,
  type = "button",
  variant = "primary",
  disabled = false,
}) {
  const base =
    "px-5 py-3 rounded-xl font-semibold transition duration-200 inline-flex items-center justify-center";

  const styles = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-800 hover:bg-gray-900 text-white",
    ghost: "bg-transparent hover:bg-gray-100 text-black",
  };

  const disabledStyle = disabled ? "opacity-50 cursor-not-allowed" : "";

  const className = `${base} ${styles[variant] || styles.primary} ${disabledStyle}`;

  // 🔥 INTERNAL NAVIGATION (Next.js optimized)
  if (href && href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  // 🔥 EXTERNAL LINK
  if (href) {
    return (
      <a
        href={href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  // 🔥 BUTTON
  return (
    <button
      type={type}
      onClick={onClick}
      className={className}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
