import { useState, useMemo } from 'react';
import { Download, AlertTriangle, Search, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useTaxSummary, useTaxCreators, useRemindCreator } from '@/hooks/useTax';
import { api } from '@/lib/api';

const EXPORT_FORMATS = [
  { id: 'standard', label: 'Standard (.xlsx, 4 tabs)', desc: 'Workbook with 1099-Ready, Exempt, Payment detail, Summary' },
  { id: 'csv', label: 'Generic CSV', desc: 'Just the 1099-NEC ready sheet, one row per creator' },
  { id: 'track1099', label: 'Track1099 format', desc: 'CSV matching Track1099 import schema' },
  { id: 'tax1099', label: 'Tax1099 format', desc: 'CSV matching Tax1099 import schema' },
  { id: 'quickbooks', label: 'QuickBooks (.iif)', desc: 'Vendors + 1099 totals, importable into QB' },
];

export default function TaxCenterPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  
  const { data: summary, isLoading: isSummaryLoading } = useTaxSummary(year);
  const { data: creators = [], isLoading: isCreatorsLoading } = useTaxCreators(year);
  const remind = useRemindCreator(year);

  // Export Modal State
  const [showExport, setShowExport] = useState(false);
  const [exportFormat, setExportFormat] = useState('standard');
  const [exportAck, setExportAck] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const filteredCreators = useMemo(() => {
    return creators.filter((c: any) => {
      if (filter === '1099-NEC') {
        if (c.formType !== '1099-NEC') return false;
      } else if (filter === 'needs-attention') {
        if (c.tinStatus !== 'missing' && c.tinStatus !== 'mismatch') return false;
      } else if (filter === 'below-threshold') {
        if (c.formType !== 'Below threshold') return false;
      } else if (filter === 's-corp') {
        if (c.formType !== 'S-Corp (exempt)') return false;
      } else if (filter === 'w8ben') {
        if (c.formType !== 'W-8BEN (exempt)') return false;
      }

      if (search) {
        const q = search.toLowerCase();
        if (!(c.name || '').toLowerCase().includes(q) && !(c.handle || '').toLowerCase().includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [creators, filter, search]);

  const handleRemind = async (creatorId: string) => {
    try {
      await remind.mutateAsync(creatorId);
      toast.success('Reminder sent to creator to complete tax forms.');
    } catch (e) {
      toast.error('Failed to send reminder.');
    }
  };

  const handleExport = async () => {
    if (!exportAck) return;
    setIsExporting(true);
    try {
      // Direct fetch to handle file download
      const token = localStorage.getItem('gc_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://caztiq-api-production.up.railway.app'}/api/tax/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ year, format: exportFormat })
      });

      if (!response.ok) throw new Error('Failed to download export');

      // Create blob and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const ext = exportFormat === 'standard' ? 'xlsx' : exportFormat === 'quickbooks' ? 'iif' : 'csv';
      a.download = `Rollio_1099_Export_${year}.${ext}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success(`Export downloaded (${exportFormat})`);
      setShowExport(false);
      setExportAck(false);
    } catch (e: any) {
      toast.error('Failed to generate export');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Persistent Compliance Banner */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <h3 className="font-semibold text-amber-900 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" /> Rollio prepares your data — you (or your CPA) file with the IRS.
        </h3>
        <p className="text-sm text-amber-800 mt-1 ml-7">
          We collect W-9s, validate TINs, track payouts, and package data in formats accountants or e-file services accept. 
          Rollio does not e-file on your behalf. The recipient deadline is January 31.
        </p>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tax Center</h1>
          <p className="text-sm text-muted-foreground mt-1">Everything you (or your accountant) need to file 1099-NECs at year-end.</p>
        </div>
        <div className="flex gap-3">
          <Select value={year.toString()} onValueChange={v => setYear(parseInt(v))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[currentYear, currentYear - 1, currentYear - 2].map(y => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setShowExport(true)} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Download className="h-4 w-4" /> Download {year} Package
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground font-medium">1099-NEC required</p>
          <p className="text-2xl font-bold text-foreground mt-1">{isSummaryLoading ? '-' : summary?.necRequired}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-medium text-emerald-600">Ready to file</p>
          <p className="text-2xl font-bold text-foreground mt-1">{isSummaryLoading ? '-' : summary?.readyToFile}</p>
        </div>
        <div className={cn("rounded-xl border p-4", summary?.needsAttention ? "border-amber-200 bg-amber-50/30" : "border-border bg-card")}>
          <p className={cn("text-sm font-medium", summary?.needsAttention ? "text-amber-700" : "text-muted-foreground")}>Needs attention</p>
          <p className="text-2xl font-bold text-foreground mt-1">{isSummaryLoading ? '-' : summary?.needsAttention}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground font-medium">Total reportable <span className="text-[10px] uppercase font-bold ml-1 text-muted-foreground/50">Box 1</span></p>
          <p className="text-2xl font-bold text-foreground mt-1">
            ${isSummaryLoading ? '-' : ((summary?.totalReportable || 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Conditional Alert */}
      {(summary?.totalFlagged || 0) > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start justify-between">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900">{summary?.totalFlagged} creators are missing tax info.</h3>
              <p className="text-sm text-red-800 mt-1">
                Rollio is auto-emailing them weekly through December. Without a valid W-9 you'll need to file with last-known info or apply 24% backup withholding.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setFilter('needs-attention')} className="shrink-0 border-red-200 text-red-700 hover:bg-red-100 bg-white">
            Review flagged
          </Button>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search creators..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All creators" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All creators</SelectItem>
            <SelectItem value="1099-NEC">1099-NEC required</SelectItem>
            <SelectItem value="needs-attention">Needs attention</SelectItem>
            <SelectItem value="below-threshold">Below $600 threshold</SelectItem>
            <SelectItem value="s-corp">S-Corp (exempt)</SelectItem>
            <SelectItem value="w8ben">International (W-8BEN)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {['Creator', 'Country', 'W-9/W-8 Status', 'YTD Earned', 'TIN Status', 'Year-End Form', 'Action'].map((h, i) => (
                <th key={h} className={cn('px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground', i === 3 ? 'text-right' : 'text-left')}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isCreatorsLoading ? (
              <tr><td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">Loading creators…</td></tr>
            ) : filteredCreators.length === 0 ? (
              <tr><td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">No creators found.</td></tr>
            ) : (
              filteredCreators.map((c: any) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                        {(c.name || c.email).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.taxForm?.tax_classification || c.handle || c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm">{c.country_code === 'US' ? '🇺🇸 US' : `🌍 ${c.country_code}`}</td>
                  <td className="px-5 py-3">
                    {c.taxForm ? (
                      <span className="text-sm font-medium text-emerald-600">✓ On file</span>
                    ) : (
                      <span className="text-sm text-amber-600">⚠️ Missing</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right text-sm font-medium">
                    ${(c.ytdEarned / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-3">
                    {c.tinStatus === 'validated' && <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">✓ Validated</span>}
                    {c.tinStatus === 'mismatch' && <span className="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">TIN mismatch</span>}
                    {c.tinStatus === 'missing' && <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">Missing TIN</span>}
                    {c.tinStatus === 'na' && <span className="text-xs text-muted-foreground">N/A</span>}
                  </td>
                  <td className="px-5 py-3">
                    {c.formType === '1099-NEC' && <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">1099-NEC</span>}
                    {c.formType !== '1099-NEC' && <span className="text-xs text-muted-foreground">{c.formType}</span>}
                  </td>
                  <td className="px-5 py-3">
                    {(c.tinStatus === 'missing' || c.tinStatus === 'mismatch') ? (
                      <Button variant="outline" size="sm" onClick={() => handleRemind(c.id)}>Remind</Button>
                    ) : c.formType === '1099-NEC' ? (
                      <Button variant="ghost" size="sm" className="text-muted-foreground">View row</Button>
                    ) : (
                      <span className="text-muted-foreground px-4">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info Box */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><FileText className="h-4 w-4" /> Reporting Rules Reference</h4>
        <div className="text-xs text-muted-foreground space-y-1.5 leading-relaxed">
          <p>• <strong>$600 threshold:</strong> 1099-NEC forms are only required if a US individual or partnership is paid $600 or more in the tax year.</p>
          <p>• <strong>Exemptions:</strong> S-Corps, C-Corps, and non-US creators (with W-8BEN) are exempt from 1099-NEC reporting.</p>
          <p>• <strong>Package Contents:</strong> The downloaded package includes verified Legal Name, TIN (SSN/EIN), Address, and total Box 1 compensation.</p>
        </div>
      </div>

      {/* Export Modal */}
      <Dialog open={showExport} onOpenChange={setShowExport}>
        <DialogContent className="sm:max-w-xl">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">Download {year} 1099 Package</h2>
              <p className="text-sm text-muted-foreground">Select a format to export your year-end tax data.</p>
            </div>

            {/* Summary Block */}
            <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">1099-NEC forms required</span>
                <span className="font-medium">{summary?.necRequired || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ready to file</span>
                <span className="font-medium text-emerald-600">{summary?.readyToFile || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Needs attention</span>
                <span className={summary?.needsAttention ? "font-medium text-amber-600" : "font-medium"}>{summary?.needsAttention || 0}</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-border/50 pt-2 mt-2">
                <span>Total reportable (Box 1)</span>
                <span>${((summary?.totalReportable || 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Format Picker */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Select Format</Label>
              <RadioGroup value={exportFormat} onValueChange={setExportFormat} className="gap-3">
                {EXPORT_FORMATS.map(f => (
                  <label key={f.id} className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <RadioGroupItem value={f.id} className="mt-1" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{f.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </div>

            {/* Acknowledgment */}
            <label className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 cursor-pointer">
              <Checkbox checked={exportAck} onCheckedChange={(v) => setExportAck(!!v)} className="mt-0.5 border-amber-500 data-[state=checked]:bg-amber-600 data-[state=checked]:text-white" />
              <p className="text-xs text-amber-900 leading-relaxed">
                I understand that Rollio prepares this data but does not file 1099s with the IRS. My finance team or CPA is responsible for the actual submission and any state filings. This export contains sensitive TIN data.
              </p>
            </label>

            <Button 
              className="w-full h-11" 
              disabled={!exportAck || isExporting} 
              onClick={handleExport}
            >
              {isExporting ? 'Generating Package...' : 'Download Package'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
