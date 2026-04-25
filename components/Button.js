export default function Button({ children, onClick, href, type = "button", variant = "primary" }) {
  const base =
    "px-5 py-3 rounded-xl font-semibold transition duration-200 inline-flex items-center justify-center";

  const styles = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-800 hover:bg-gray-900 text-white",
    ghost: "bg-transparent hover:bg-gray-100 text-black",
  };

  const className = `${base} ${styles[variant] || styles.primary}`;

  if (href) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={className}>
      {children}
    </button>
  );
}
