import { cn } from '../lib/utils';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullPage?: boolean;
}

export default function LoadingSpinner({ size = 'md', className, fullPage }: Props) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };

  const spinner = (
    <div
      className={cn(
        'rounded-full border-2 border-gray-200 border-t-primary-500 animate-spin',
        sizes[size],
        className
      )}
    />
  );

  if (fullPage) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}
