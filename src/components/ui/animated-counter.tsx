import { useEffect, useState, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  suffix?: string;
  className?: string;
}

export const AnimatedCounter = ({ 
  value, 
  duration = 2, 
  suffix = "", 
  className = "" 
}: AnimatedCounterProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: "0px" });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [motionValue, isInView, value]);

  useEffect(() => {
    springValue.on("change", (latest) => {
      setDisplayValue(Math.round(latest));
    });
  }, [springValue]);

  return (
    <span ref={ref} className={className}>
      {displayValue}{suffix}
    </span>
  );
};

interface AnimatedPercentageProps {
  value: number;
  duration?: number;
  className?: string;
}

export const AnimatedPercentage = ({ 
  value, 
  duration = 2, 
  className = "" 
}: AnimatedPercentageProps) => {
  return <AnimatedCounter value={value} suffix="%" duration={duration} className={className} />;
};

interface AnimatedMillionProps {
  value: number;
  duration?: number;
  className?: string;
}

export const AnimatedMillion = ({ 
  value, 
  duration = 2, 
  className = "" 
}: AnimatedMillionProps) => {
  return <AnimatedCounter value={value} suffix="M" duration={duration} className={className} />;
};

