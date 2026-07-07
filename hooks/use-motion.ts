"use client";
import { motion, useReducedMotion } from "framer-motion";

export function useMotion() {
  const reduceMotion = useReducedMotion();
  return { motion: motion as typeof motion, reduceMotion };
}
