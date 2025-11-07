import type React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  className = '',
  children,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variants: Record<Variant, string> = {
    primary: 'bg-brand text-white hover:bg-brand-600 focus:ring-brand',
    secondary: 'bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 focus:ring-gray-300',
    ghost: 'bg-transparent text-gray-800 hover:bg-gray-100 focus:ring-gray-200',
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
