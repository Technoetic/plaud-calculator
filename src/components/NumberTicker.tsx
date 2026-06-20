import { useEffect } from "react";
import { useMotionValue, useTransform, animate, motion } from "framer-motion";

export function NumberTicker({ value, suffix = "" }: { value: number; suffix?: string }) {
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => Math.round(v).toLocaleString("en-US") + suffix);
  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.9, ease: "easeOut" });
    return controls.stop;
  }, [value, mv]);
  return <motion.span>{text}</motion.span>;
}
