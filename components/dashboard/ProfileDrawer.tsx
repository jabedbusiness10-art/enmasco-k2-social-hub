"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Phone, Calendar, Briefcase } from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  status: "Active" | "Away" | "Offline";
};

type ProfileDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
};

export default function ProfileDrawer({ isOpen, onClose, user }: ProfileDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-700/50 shadow-2xl z-50 overflow-y-auto"
          >
            {user && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-semibold text-slate-100">Employee Profile</h2>
                  <button
                    onClick={onClose}
                    className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex flex-col items-center text-center mb-8">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center text-white text-3xl font-bold shadow-[0_0_30px_rgba(56,189,248,0.3)] mb-4">
                    {user.name.charAt(0)}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">{user.name}</h3>
                  <p className="text-sky-400 font-medium">{user.role}</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 flex items-center gap-4">
                    <Mail className="text-slate-400" size={20} />
                    <div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider">Email</div>
                      <div className="text-slate-200">{user.email}</div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 flex items-center gap-4">
                    <Briefcase className="text-slate-400" size={20} />
                    <div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider">Department</div>
                      <div className="text-slate-200">{user.department}</div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 flex items-center gap-4">
                    <Calendar className="text-slate-400" size={20} />
                    <div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider">Status</div>
                      <div className="text-slate-200">{user.status}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
