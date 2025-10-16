import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";

interface LiveCounterProps {
  baseCount?: number;
  incrementInterval?: number;
  className?: string;
}

export const LiveCounter = ({ 
  baseCount = 125430, 
  incrementInterval = 5000,
  className = "" 
}: LiveCounterProps) => {
  const [count, setCount] = useState(baseCount);
  const [isIncrementing, setIsIncrementing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsIncrementing(true);
      setCount(prev => prev + Math.floor(Math.random() * 3) + 1);
      
      setTimeout(() => {
        setIsIncrementing(false);
      }, 500);
    }, incrementInterval);

    return () => clearInterval(interval);
  }, [incrementInterval]);

  return (
    <motion.div 
      className={`inline-flex items-center gap-2 ${className}`}
      animate={isIncrementing ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <Users className="w-5 h-5 text-green-600" />
        {isIncrementing && (
          <motion.div
            className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.5, 0] }}
            transition={{ duration: 0.6 }}
          />
        )}
      </div>
      <span className="font-semibold text-gray-700">
        {count.toLocaleString('fr-FR')}
      </span>
      <span className="text-sm text-gray-500">membres actifs</span>
    </motion.div>
  );
};

