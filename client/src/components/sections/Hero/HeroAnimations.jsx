import { motion } from "framer-motion";

import {
  fadeUp,
} from "./heroAnimations";

export function FadeUp({
  children,
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  );
}

export default FadeUp;