export default function Icon({ name, size = 24, className = "" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      className={`inline-block align-middle ${className}`}
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <use href={`/icons.svg#${name}`} />
    </svg>
  );
} 