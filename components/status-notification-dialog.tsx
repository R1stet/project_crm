'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Status } from '@/types/customer';
import type { EmailPayload } from '@/lib/notifications';

interface StatusNotificationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onSkip: () => void;
  onCancel: () => void;
  customerName: string;
  newStatus: Status;
  emailPreview: EmailPayload;
}

export function StatusNotificationDialog({
  isOpen,
  onConfirm,
  onSkip,
  onCancel,
  customerName,
  newStatus,
  emailPreview,
}: StatusNotificationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="w-[95vw] max-w-[550px] max-h-[85vh] overflow-y-auto mx-auto">
        <DialogHeader>
          <DialogTitle>Status opdateret til &quot;{newStatus}&quot;</DialogTitle>
          <DialogDescription>
            Vil du sende en statusopdatering til {customerName}?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-md border p-4 bg-gray-50 space-y-2">
            <div>
              <span className="text-xs font-medium text-gray-500">Til:</span>
              <p className="text-sm">{emailPreview.to}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-500">Emne:</span>
              <p className="text-sm font-medium">{emailPreview.subject}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-500">Besked:</span>
              <p className="text-sm whitespace-pre-wrap mt-1">{emailPreview.body}</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Annuller
          </Button>
          <Button type="button" variant="outline" onClick={onSkip}>
            Gem uden email
          </Button>
          <Button type="button" onClick={onConfirm}>
            Send Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
