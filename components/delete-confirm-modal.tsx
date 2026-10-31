"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  itemTitle?: string;
  itemType: string;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemTitle,
  itemType,
}: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await onConfirm();
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-lg bg-rose-50 p-3 text-rose-800 border border-rose-200">
          <AlertTriangle className="h-6 w-6 flex-shrink-0 text-rose-600" />
          <div className="text-xs leading-relaxed">
            This action cannot be undone. This will permanently delete this {itemType}
            {itemTitle ? ` ("${itemTitle}")` : ""} from the database.
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleConfirm}
            isLoading={isDeleting}
          >
            Confirm Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}
