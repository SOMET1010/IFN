import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronRight, Star, TrendingUp, Clock, AlertCircle } from 'lucide-react'

export interface ActionItem {
  to?: string
  onClick?: () => void
  icon: React.ReactNode
  label: string
  description?: string
  badge?: string
  badgeColor?: 'default' | 'secondary' | 'destructive' | 'outline'
  trending?: boolean
  newFeature?: boolean
  disabled?: boolean
  className?: string
  ariaLabel?: string
}

interface ActionGridProps {
  items: ActionItem[]
  className?: string
  showLabels?: boolean
  variant?: 'default' | 'compact' | 'detailed'
}

// Modern mobile-first grid of action tiles with enhanced styling
export function ActionGrid({
  items,
  className,
  showLabels = false,
  variant = 'default'
}: ActionGridProps) {
  const gridClasses = {
    default: 'grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
    compact: 'grid grid-cols-3 gap-2 sm:gap-3 sm:grid-cols-4 lg:grid-cols-6',
    detailed: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
  }

  const cardClasses = {
    default: 'h-36 sm:h-40',
    compact: 'h-28 sm:h-32',
    detailed: 'h-auto p-4'
  }

  return (
    <div className={cn(gridClasses[variant], className)}>
      {items.map((item, idx) => {
        const content = (
          <Card
            className={cn(
              'group relative overflow-hidden transition-all duration-300 ease-out',
              'border border-border/60 hover:border-primary/30',
              'bg-gradient-to-br from-card to-card/80 hover:from-primary/5 hover:to-primary/10',
              'shadow-soft hover:shadow-medium hover:-translate-y-1',
              'focus-within:ring-2 focus-within:ring-primary/50',
              'hover:before:absolute hover:before:inset-0 hover:before:bg-gradient-primary/5',
              item.disabled && 'opacity-50 cursor-not-allowed',
              cardClasses[variant],
              item.className,
            )}
          >
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300">
              <div className="absolute top-2 right-2 w-16 h-16 bg-gradient-primary rounded-full blur-xl"></div>
            </div>

            <div className={cn(
              'relative h-full flex flex-col items-center justify-center',
              variant === 'detailed' ? 'items-start text-left' : ''
            )}>
              {/* Icon container */}
              <div className={cn(
                'flex items-center justify-center transition-all duration-300 w-full h-full',
                'group-hover:scale-105'
              )}>
                <div className={cn(
                  'transition-transform duration-300 w-full h-full flex items-center justify-center',
                  variant === 'default' ? 'text-3xl sm:text-4xl' :
                  variant === 'compact' ? 'text-2xl sm:text-3xl' :
                  'text-2xl'
                )}>
                  {item.icon}
                </div>
              </div>

              {/* Content */}
              <div className={cn(
                'text-center transition-all duration-300',
                variant === 'detailed' ? 'w-full' : ''
              )}>
                {/* Badge */}
                {item.badge && (
                  <Badge
                    variant={item.badgeColor || 'secondary'}
                    className={cn(
                      'absolute top-1 right-1 text-xs',
                      variant === 'compact' ? 'text-xs' : ''
                    )}
                  >
                    {item.badge}
                  </Badge>
                )}

                {/* Indicators */}
                <div className={cn(
                  'flex items-center justify-center gap-1 absolute bottom-1 left-1 right-1',
                  variant === 'detailed' ? 'justify-start' : ''
                )}>
                  {item.trending && (
                    <div className="flex items-center gap-1 text-xs text-primary">
                      <TrendingUp className="h-3 w-3" />
                    </div>
                  )}
                  {item.newFeature && (
                    <Badge variant="outline" className="text-xs border-green-500 text-green-700 p-0 w-2 h-2">
                      <Star className="h-2 w-2" />
                    </Badge>
                  )}
                  {item.disabled && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                    </div>
                  )}
                </div>

                {/* Hover arrow (detailed variant) */}
                {variant === 'detailed' && !item.disabled && (
                  <ChevronRight className="absolute top-4 right-4 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                )}
              </div>
            </div>

            {/* Disabled overlay */}
            {item.disabled && (
              <div className="absolute inset-0 bg-muted/50 backdrop-blur-sm flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </Card>
        )

        if (item.to && !item.disabled) {
          return (
            <Link
              key={idx}
              to={item.to}
              aria-label={item.ariaLabel || item.label}
              className="block transform transition-transform duration-300 hover:scale-[1.02] focus:outline-none"
            >
              {content}
            </Link>
          )
        }

        return (
          <button
            key={idx}
            type="button"
            onClick={item.onClick}
            aria-label={item.ariaLabel || item.label}
            disabled={item.disabled}
            className={cn(
              'block transform transition-transform duration-300 hover:scale-[1.02] focus:outline-none',
              item.disabled ? 'cursor-not-allowed' : ''
            )}
          >
            {content}
          </button>
        )
      })}
    </div>
  )
}
