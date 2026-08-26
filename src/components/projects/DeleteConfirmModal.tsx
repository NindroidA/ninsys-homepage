import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useModalA11y } from "../../hooks/useModalA11y";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  deleting?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  deleting,
}: DeleteConfirmModalProps) {
  const panelRef = useModalA11y(isOpen, onClose);

  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-51 flex items-center justify-center p-4"
          >
            <div
              ref={panelRef}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="delete-confirm-title"
              aria-describedby="delete-confirm-description"
              tabIndex={-1}
              className="w-full max-w-md bg-[#0d0a16]/95 backdrop-blur-xl rounded-2xl border border-purple-300/12 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_30px_80px_-40px_rgba(0,0,0,0.9)] p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-rose-500/15 border border-rose-500/25 flex items-center justify-center mb-3 sm:mb-4">
                  <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-rose-300" />
                </div>

                <h2
                  id="delete-confirm-title"
                  className="font-display text-xl font-bold text-white mb-2"
                >
                  Delete Project?
                </h2>

                <p id="delete-confirm-description" className="text-white/60 mb-6">
                  Are you sure you want to delete{" "}
                  <span className="text-white font-medium">&quot;{title}&quot;</span>? This action
                  cannot be undone.
                </p>

                <div className="flex gap-4 w-full">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={deleting}
                    className="flex-1 px-6 py-3 bg-white/4 hover:bg-white/8 border border-purple-300/12 disabled:opacity-50 text-white/70 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={deleting}
                    className="flex-1 px-6 py-3 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-500/50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
