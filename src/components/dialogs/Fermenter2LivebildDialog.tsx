import { useState, useEffect } from 'react';
import type { Fermenter2Livebild } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId, createRecordUrl, cleanFieldsForApi } from '@/services/livingAppsService';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Fermenter2LivebildDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (fields: Fermenter2Livebild['fields']) => Promise<void>;
  defaultValues?: Fermenter2Livebild['fields'];
  enablePhotoScan?: boolean;
  enablePhotoLocation?: boolean;
}

export function Fermenter2LivebildDialog({ open, onClose, onSubmit, defaultValues, enablePhotoScan = true, enablePhotoLocation = true }: Fermenter2LivebildDialogProps) {
  const [fields, setFields] = useState<Partial<Fermenter2Livebild['fields']>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setFields(defaultValues ?? {});
  }, [open, defaultValues]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const clean = cleanFieldsForApi({ ...fields }, 'fermenter_2_livebild');
      await onSubmit(clean as Fermenter2Livebild['fields']);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const DIALOG_INTENT = defaultValues ? 'Edit Fermenter 2 Livebild' : 'New Fermenter 2 Livebild';

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{DIALOG_INTENT}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : defaultValues ? 'Save' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}