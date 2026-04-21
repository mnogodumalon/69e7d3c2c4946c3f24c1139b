import type { Fermenter2Livebild } from '@/types/app';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { IconPencil } from '@tabler/icons-react';

interface Fermenter2LivebildViewDialogProps {
  open: boolean;
  onClose: () => void;
  record: Fermenter2Livebild | null;
  onEdit: (record: Fermenter2Livebild) => void;
}

export function Fermenter2LivebildViewDialog({ open, onClose, record, onEdit }: Fermenter2LivebildViewDialogProps) {
  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>View Fermenter 2 Livebild</DialogTitle>
        </DialogHeader>
        <div className="flex justify-end">
          <Button size="sm" onClick={() => { onClose(); onEdit(record); }}>
            <IconPencil className="h-3.5 w-3.5 mr-1.5" />
            Edit
          </Button>
        </div>

        <div className="space-y-4">
        </div>
      </DialogContent>
    </Dialog>
  );
}