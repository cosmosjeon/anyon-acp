import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SelectionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
  className?: string;
}

/**
 * SelectionCard - A large clickable card for selecting options
 *
 * Used for workspace type selection (MVP vs Maintenance)
 */
export const SelectionCard: React.FC<SelectionCardProps> = ({
  icon: Icon,
  title,
  description,
  onClick,
  className,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
    >
      <Card
        onClick={onClick}
        className={cn(
          "cursor-pointer",
          "p-8 min-h-[220px]",
          "flex flex-col items-center justify-center text-center",
          "transition-all duration-200",
          "hover:shadow-lg hover:border-primary/50",
          "group",
          className
        )}
      >
        {/* Icon */}
        <div className={cn(
          "w-16 h-16 rounded-xl",
          "bg-primary/10 group-hover:bg-primary/20",
          "flex items-center justify-center",
          "mb-4 transition-colors duration-200"
        )}>
          <Icon className="w-8 h-8 text-primary" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold mb-2">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">
          {description}
        </p>
      </Card>
    </motion.div>
  );
};

export default SelectionCard;
