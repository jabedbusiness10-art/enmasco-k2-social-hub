"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import type { Duty } from "@/types/duty";
import DutyModal from "./CreateDutyModal";

type EditDrawerProps = {
  duty: Duty;
  onClose: () => void;
  onSave: (updated: Duty) => void;
};

export default function EditDutyModal({ duty, onClose, onSave }: EditDrawerProps) {
  return (
    <DutyModal
      isOpen
      onClose={onClose}
      duty={duty}
      onSave={async (payload) => {
        await onSave({ ...(payload as Duty), id: duty.id });
      }}
    />
  );
}
