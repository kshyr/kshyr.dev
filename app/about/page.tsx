"use client";

import Pic from "@/components/Pic";
import { motion } from "framer-motion";

export default function Page() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-row justify-between py-4"
    ></motion.div>
  );
}

function ItchIoIframe() {
  return (
    <iframe
      src="https://itch.io/embed/2020893?bg_color=141423&amp;fg_color=eeeeee&amp;link_color=4c4c6a&amp;border_color=363636"
      width="552"
      height="167"
      className="outline-none"
    ></iframe>
  );
}
