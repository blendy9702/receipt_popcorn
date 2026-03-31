"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { PlaceBulkUploadContent } from "@/components/place-bulk-upload-content";

export function PlaceBulkUploadModal() {
  const router = useRouter();

  const handleClose = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/");
  };

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(30,24,20,0.28)] p-4 backdrop-blur-[2px] lg:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      onClick={handleClose}
    >
      <motion.div
        className="relative w-full max-w-[1020px]"
        initial={{ opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="닫기"
          onClick={handleClose}
          className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full text-[#4e342e]/80 transition-colors hover:bg-[#4e342e]/8"
        >
          <X size={24} />
        </button>
        <PlaceBulkUploadContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-h-[calc(100vh-4rem)]" />
      </motion.div>
    </motion.div>
  );
}
