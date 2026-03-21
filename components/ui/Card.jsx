// components/ui/Card.jsx
export default function Card({ children, hover = false, className = '', onClick }) {
  return (
    <div
      className={`${hover ? 'card-hover' : 'card'} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
