import { useDashboardData } from '@/hooks/useDashboardData';
import type { Fermenter2Livebild } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';
import { AI_PHOTO_SCAN, AI_PHOTO_LOCATION } from '@/config/ai-features';
import { Fermenter2LivebildDialog } from '@/components/dialogs/Fermenter2LivebildDialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  IconAlertCircle, IconTool, IconRefresh, IconCheck,
  IconPlus, IconCamera, IconTrash, IconClock, IconDatabase,
  IconCalendarStats, IconRefreshAlert,
} from '@tabler/icons-react';
import { format, parseISO, isToday, isYesterday, differenceInMinutes } from 'date-fns';
import { de } from 'date-fns/locale';

const APPGROUP_ID = '69e7d3c2c4946c3f24c1139b';
const REPAIR_ENDPOINT = '/claude/build/repair';

function formatTimestamp(iso: string): string {
  try {
    const d = parseISO(iso);
    if (isToday(d)) return `Heute, ${format(d, 'HH:mm', { locale: de })} Uhr`;
    if (isYesterday(d)) return `Gestern, ${format(d, 'HH:mm', { locale: de })} Uhr`;
    return format(d, 'dd. MMM yyyy, HH:mm', { locale: de }) + ' Uhr';
  } catch {
    return iso;
  }
}

function getAgeLabel(iso: string): { label: string; fresh: boolean } {
  try {
    const mins = differenceInMinutes(new Date(), parseISO(iso));
    if (mins < 2) return { label: 'Gerade eben', fresh: true };
    if (mins < 60) return { label: `vor ${mins} Min.`, fresh: true };
    const hours = Math.floor(mins / 60);
    if (hours < 24) return { label: `vor ${hours} Std.`, fresh: false };
    return { label: `vor ${Math.floor(hours / 24)} Tagen`, fresh: false };
  } catch {
    return { label: '', fresh: false };
  }
}

export default function DashboardOverview() {
  const { fermenter2Livebild, loading, error, fetchAll } = useDashboardData();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Fermenter2Livebild | null>(null);

  const sorted = useMemo(
    () => [...fermenter2Livebild].sort((a, b) => b.createdat.localeCompare(a.createdat)),
    [fermenter2Livebild]
  );

  const latest = sorted[0] ?? null;

  const todayCount = useMemo(
    () => fermenter2Livebild.filter(r => { try { return isToday(parseISO(r.createdat)); } catch { return false; } }).length,
    [fermenter2Livebild]
  );

  const handleCreate = async (fields: Fermenter2Livebild['fields']) => {
    await LivingAppsService.createFermenter2LivebildEntry(fields);
    fetchAll();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await LivingAppsService.deleteFermenter2LivebildEntry(deleteTarget.record_id);
    fetchAll();
    setDeleteTarget(null);
  };

  if (loading) return <DashboardSkeleton />;
  if (error) return <DashboardError error={error} onRetry={fetchAll} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fermenter 2 – Livebild</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Kameraaufnahmen erfassen und verwalten</p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="shrink-0 gap-2 rounded-full shadow-sm self-start sm:self-auto"
          size="lg"
        >
          <IconCamera size={18} className="shrink-0" />
          Aufnahme erfassen
        </Button>
      </div>

      {/* KPI-Streifen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-card border border-border p-5 flex items-center gap-4 shadow-sm overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <IconDatabase size={18} className="text-primary" />
          </div>
          <div className="min-w-0">
            <div className="text-2xl font-bold text-foreground leading-none">{fermenter2Livebild.length}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Aufnahmen gesamt</div>
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border p-5 flex items-center gap-4 shadow-sm overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
            <IconCalendarStats size={18} className="text-blue-600" />
          </div>
          <div className="min-w-0">
            <div className="text-2xl font-bold text-foreground leading-none">{todayCount}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Heute erfasst</div>
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border p-5 flex items-center gap-4 shadow-sm overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
            <IconClock size={18} className="text-emerald-600" />
          </div>
          <div className="min-w-0 overflow-hidden">
            <div className="text-sm font-bold text-foreground leading-none truncate">
              {latest ? formatTimestamp(latest.createdat) : '—'}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">Letzte Aufnahme</div>
          </div>
        </div>
      </div>

      {/* Neuester Eintrag – Hero */}
      {latest && (
        <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-semibold text-foreground">Aktuellste Aufnahme</span>
            </div>
            <span className="text-xs text-muted-foreground">{getAgeLabel(latest.createdat).label}</span>
          </div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <IconCamera size={28} className="text-primary" stroke={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground text-lg">{formatTimestamp(latest.createdat)}</div>
                <div className="text-sm text-muted-foreground">ID: {latest.record_id.slice(-8)}</div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setDeleteTarget(latest)}
                title="Löschen"
              >
                <IconTrash size={16} />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Aufnahmeverlauf */}
      <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <span className="text-sm font-semibold text-foreground">Aufnahmeverlauf</span>
          <Button variant="ghost" size="sm" onClick={fetchAll} className="gap-1.5 text-muted-foreground hover:text-foreground">
            <IconRefreshAlert size={14} className="shrink-0" />
            <span className="hidden sm:inline text-xs">Aktualisieren</span>
          </Button>
        </div>

        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 px-6">
            <IconCamera size={48} className="text-muted-foreground" stroke={1.5} />
            <div className="text-center">
              <p className="font-medium text-foreground">Noch keine Aufnahmen</p>
              <p className="text-sm text-muted-foreground mt-1">Erstelle die erste Aufnahme mit dem Button oben.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {sorted.map((record) => {
              const age = getAgeLabel(record.createdat);
              return (
                <div
                  key={record.record_id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-muted/40 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    age.fresh ? 'bg-emerald-500/10' : 'bg-muted'
                  }`}>
                    <IconCamera size={16} className={age.fresh ? 'text-emerald-600' : 'text-muted-foreground'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{formatTimestamp(record.createdat)}</div>
                    <div className="text-xs text-muted-foreground">ID: {record.record_id.slice(-8)}</div>
                  </div>
                  <div className="shrink-0 text-xs text-muted-foreground hidden sm:block">{age.label}</div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteTarget(record)}
                    title="Löschen"
                  >
                    <IconTrash size={14} />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dialoge */}
      <Fermenter2LivebildDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleCreate}
        enablePhotoScan={AI_PHOTO_SCAN['Fermenter2Livebild']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Fermenter2Livebild']}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Aufnahme löschen"
        description="Diese Aufnahme wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
      />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-44 rounded-full" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
      </div>
      <Skeleton className="h-28 rounded-2xl" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}

function DashboardError({ error, onRetry }: { error: Error; onRetry: () => void }) {
  const [repairing, setRepairing] = useState(false);
  const [repairStatus, setRepairStatus] = useState('');
  const [repairDone, setRepairDone] = useState(false);
  const [repairFailed, setRepairFailed] = useState(false);

  const handleRepair = async () => {
    setRepairing(true);
    setRepairStatus('Reparatur wird gestartet...');
    setRepairFailed(false);

    const errorContext = JSON.stringify({
      type: 'data_loading',
      message: error.message,
      stack: (error.stack ?? '').split('\n').slice(0, 10).join('\n'),
      url: window.location.href,
    });

    try {
      const resp = await fetch(REPAIR_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ appgroup_id: APPGROUP_ID, error_context: errorContext }),
      });

      if (!resp.ok || !resp.body) {
        setRepairing(false);
        setRepairFailed(true);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const raw of lines) {
          const line = raw.trim();
          if (!line.startsWith('data: ')) continue;
          const content = line.slice(6);
          if (content.startsWith('[STATUS]')) {
            setRepairStatus(content.replace(/^\[STATUS]\s*/, ''));
          }
          if (content.startsWith('[DONE]')) {
            setRepairDone(true);
            setRepairing(false);
          }
          if (content.startsWith('[ERROR]') && !content.includes('Dashboard-Links')) {
            setRepairFailed(true);
          }
        }
      }
    } catch {
      setRepairing(false);
      setRepairFailed(true);
    }
  };

  if (repairDone) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
          <IconCheck size={22} className="text-green-500" />
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-foreground mb-1">Dashboard repariert</h3>
          <p className="text-sm text-muted-foreground max-w-xs">Das Problem wurde behoben. Bitte Seite neu laden.</p>
        </div>
        <Button size="sm" onClick={() => window.location.reload()}>
          <IconRefresh size={14} className="mr-1" />Neu laden
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
        <IconAlertCircle size={22} className="text-destructive" />
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-foreground mb-1">Fehler beim Laden</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          {repairing ? repairStatus : error.message}
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onRetry} disabled={repairing}>Erneut versuchen</Button>
        <Button size="sm" onClick={handleRepair} disabled={repairing}>
          {repairing
            ? <span className="inline-block w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-1" />
            : <IconTool size={14} className="mr-1" />}
          {repairing ? 'Repariere...' : 'Dashboard reparieren'}
        </Button>
      </div>
      {repairFailed && <p className="text-sm text-destructive">Automatische Reparatur fehlgeschlagen. Bitte Support kontaktieren.</p>}
    </div>
  );
}
