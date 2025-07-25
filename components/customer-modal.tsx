// /components/customer-modal.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Customer, DressType, Status, InvoiceStatus, AccessoryType, Accessory } from '@/types/customer';
import { uploadInvoice, uploadSupplierPDF } from '@/lib/storage';
import { Upload, Loader2 } from 'lucide-react';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    customer: Omit<Customer, 'id' | 'createdBy' | 'createdAt' | 'updatedAt' | 'dateAdded'>
  ) => Promise<void>;
  customer?: Customer | null;
}

const statusOptions: Status[] = [
  'Afventer',
  'I produktion',
  'Kjole ankommet',
  'Kjole afhentet',
];
const invoiceOptions: InvoiceStatus[] = ['Skal sendes', 'Sendt', 'Delvist betalt', 'Betalt'];
const accessoryOptions: AccessoryType[] = ['Slør', 'Sko', 'Hårpynt', 'Lingeri', 'Diverse'];

export function CustomerModal({ isOpen, onClose, onSave, customer }: CustomerModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    salesperson: '',
    status: 'Afventer' as Status,
    dress: null as DressType,
    maker: '',
    skrædder: '',
    size: {
      bryst: '',
      talje: '',
      hofte: '',
      arms: '',
      height: '',
    },
    accessories: [] as Accessory[],
    invoiceStatus: 'Skal sendes' as InvoiceStatus,
    invoiceFileUrl: '',
    supplierFileUrl: '',
    notes: '',
    weddingDate: '',
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingSupplier, setUploadingSupplier] = useState(false);
  const [newAccessory, setNewAccessory] = useState({
    type: null as AccessoryType | null,
    note: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supplierFileInputRef = useRef<HTMLInputElement>(null);

  /* ---------- sync incoming customer ---------- */
  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        email: customer.email,
        phoneNumber: customer.phoneNumber ?? '',
        salesperson: customer.salesperson ?? '',
        status: customer.status,
        dress: customer.dress,
        maker: customer.maker ?? '',
        skrædder: customer.skrædder ?? '',
        size: {
          bryst: customer.size.bryst?.toString() ?? '',
          talje: customer.size.talje?.toString() ?? '',
          hofte: customer.size.hofte?.toString() ?? '',
          arms: customer.size.arms?.toString() ?? '',
          height: customer.size.height?.toString() ?? '',
        },
        accessories: customer.accessories || [],
        invoiceStatus: customer.invoiceStatus,
        invoiceFileUrl: customer.invoiceFileUrl ?? '',
        supplierFileUrl: customer.supplierFileUrl ?? '',
        notes: customer.notes ?? '',
        weddingDate: customer.weddingDate ?? '',
      });
    } else {
      /* reset to blank */
      setFormData({
        name: '',
        email: '',
        phoneNumber: '',
        salesperson: '',
        status: 'Afventer',
        dress: null,
        maker: '',
        skrædder: '',
        size: {
          bryst: '',
          talje: '',
          hofte: '',
          arms: '',
          height: '',
        },
        accessories: [],
        invoiceStatus: 'Skal sendes',
        invoiceFileUrl: '',
        supplierFileUrl: '',
        notes: '',
        weddingDate: '',
      });
    }
  }, [customer, isOpen]);

  /* ---------- helpers ---------- */
  const handleChange = (field: string, value: string) => {
    if (field.startsWith('size.')) {
      const sizeField = field.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        size: { ...prev.size, [sizeField]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Vælg venligst en PDF fil');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('Filstørrelse skal være mindre end 10MB');
      return;
    }

    setUploading(true);
    try {
      const url = await uploadInvoice(file, customer?.id);
      handleChange('invoiceFileUrl', url);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload fejlede. Prøv igen.');
    } finally {
      setUploading(false);
    }
  };

  const handleSupplierFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Vælg venligst en PDF fil');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('Filstørrelse skal være mindre end 10MB');
      return;
    }

    setUploadingSupplier(true);
    try {
      const url = await uploadSupplierPDF(file, customer?.id);
      handleChange('supplierFileUrl', url);
    } catch (error) {
      console.error('Supplier upload failed:', error);
      alert('Upload fejlede. Prøv igen.');
    } finally {
      setUploadingSupplier(false);
    }
  };

  const addAccessory = () => {
    if (newAccessory.type && newAccessory.note.trim()) {
      const accessory: Accessory = {
        id: Date.now().toString(),
        type: newAccessory.type,
        note: newAccessory.note.trim(),
      };
      setFormData((prev) => ({
        ...prev,
        accessories: [...prev.accessories, accessory],
      }));
      setNewAccessory({ type: null, note: '' });
    }
  };

  const removeAccessory = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      accessories: prev.accessories.filter((acc) => acc.id !== id),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      /* convert strings → numbers where needed */
      const toNum = (v: string) => (v === '' ? null : parseFloat(v));

      await onSave({
        ...formData,
        phoneNumber: formData.phoneNumber || null,
        salesperson: formData.salesperson || null,
        dress: formData.dress,
        maker: formData.maker || null,
        skrædder: formData.skrædder || null,
        size: {
          bryst: toNum(formData.size.bryst),
          talje: toNum(formData.size.talje),
          hofte: toNum(formData.size.hofte),
          arms: toNum(formData.size.arms),
          height: toNum(formData.size.height),
        },
        accessories: formData.accessories,
        invoiceFileUrl: formData.invoiceFileUrl || null,
        supplierFileUrl: formData.supplierFileUrl || null,
        notes: formData.notes || null,
        weddingDate: formData.weddingDate || null,
      });
    } catch (error) {
      console.error('Error saving customer:', error);
    } finally {
      setSaving(false);
    }
  };

  /* ---------- render ---------- */
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{customer ? 'Rediger Kunde' : 'Tilføj Ny Kunde'}</DialogTitle>
          <DialogDescription>
            {customer ? 'Opdater kundeinformation nedenfor.' : 'Indtast kundeoplysninger nedenfor.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* name */}
          <div className="space-y-2">
            <Label htmlFor="name">Navn *</Label>
            <Input id="name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} required />
          </div>

          {/* wedding date */}
          <div className="space-y-2">
            <Label htmlFor="weddingDate">Bryllupsdato</Label>
            <Input
              id="weddingDate"
              type="date"
              value={formData.weddingDate}
              onChange={(e) => handleChange('weddingDate', e.target.value)}
            />
          </div>

          {/* email + phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Telefonnummer</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
              />
            </div>
          </div>

          {/* salesperson + status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salesperson">Sælger</Label>
              <Input
                id="salesperson"
                value={formData.salesperson}
                onChange={(e) => handleChange('salesperson', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Vælg status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* dress + maker + skrædder */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dress">Brudekjoler</Label>
              <Input id="dress" value={formData.dress || ''} onChange={(e) => handleChange('dress', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maker">Leverandør</Label>
              <Input id="maker" value={formData.maker} onChange={(e) => handleChange('maker', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skraedder">Skrædder</Label>
              <Input id="skraedder" value={formData.skrædder} onChange={(e) => handleChange('skrædder', e.target.value)} />
            </div>
          </div>

          {/* sizes */}
          <div className="space-y-2">
            <Label>Størrelsesmål (cm)</Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {(['bryst', 'talje', 'hofte', 'arms', 'height'] as const).map((field) => (
                <div key={field}>
                  <Label htmlFor={field} className="text-xs capitalize">
                    {field}
                  </Label>
                  <Input
                    id={field}
                    type="number"
                    step="0.01"
                    placeholder="cm"
                    value={formData.size[field]}
                    onChange={(e) => handleChange(`size.${field}`, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* accessories */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Accessories</Label>
            
            {/* existing accessories */}
            {formData.accessories.length > 0 && (
              <div className="space-y-2">
                {formData.accessories.map((accessory) => (
                  <div key={accessory.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <span className="font-medium">{accessory.type}</span>
                      {accessory.note && <p className="text-sm text-gray-600">{accessory.note}</p>}
                    </div>
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="sm"
                      onClick={() => removeAccessory(accessory.id)}
                    >
                      Fjern
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* add new accessory */}
            <div className="border rounded-md p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tilbehør type</Label>
                  <Select 
                    value={newAccessory.type || ''} 
                    onValueChange={(v) => setNewAccessory(prev => ({ ...prev, type: v as AccessoryType }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Vælg tilbehør" />
                    </SelectTrigger>
                    <SelectContent>
                      {accessoryOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Note</Label>
                  <Input
                    value={newAccessory.note}
                    onChange={(e) => setNewAccessory(prev => ({ ...prev, note: e.target.value }))}
                    placeholder="Tilføj note..."
                  />
                </div>
              </div>
              <Button 
                type="button" 
                onClick={addAccessory}
                disabled={!newAccessory.type || !newAccessory.note.trim()}
                className="w-full"
              >
                Tilføj tilbehør
              </Button>
            </div>
          </div>

          {/* invoice status */}
          <div className="space-y-2">
            <Label htmlFor="invoiceStatus">Fakturastatus</Label>
            <Select value={formData.invoiceStatus} onValueChange={(v) => handleChange('invoiceStatus', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Vælg fakturastatus" />
              </SelectTrigger>
              <SelectContent>
                {invoiceOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* file URLs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceFileUrl">Faktura Fil URL</Label>
              <div className="flex gap-2">
                <Input
                  id="invoiceFileUrl"
                  placeholder="fakturaer/{id}.pdf eller upload fil"
                  value={formData.invoiceFileUrl}
                  onChange={(e) => handleChange('invoiceFileUrl', e.target.value)}
                  disabled={uploading}
                />
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading || saving}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || saving}
                    className="h-9"
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              {uploading && (
                <p className="text-xs text-blue-600">Uploader PDF...</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplierFileUrl">Leverandør Fil URL</Label>
              <div className="flex gap-2">
                <Input
                  id="supplierFileUrl"
                  placeholder="leverandør/{id}.pdf eller upload fil"
                  value={formData.supplierFileUrl}
                  onChange={(e) => handleChange('supplierFileUrl', e.target.value)}
                  disabled={uploadingSupplier}
                />
                <div className="relative">
                  <input
                    ref={supplierFileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleSupplierFileUpload}
                    className="hidden"
                    disabled={uploadingSupplier || saving}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => supplierFileInputRef.current?.click()}
                    disabled={uploadingSupplier || saving}
                    className="h-9"
                  >
                    {uploadingSupplier ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              {uploadingSupplier && (
                <p className="text-xs text-blue-600">Uploader Leverandør PDF...</p>
              )}
            </div>
          </div>

          {/* notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Noter</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
            />
          </div>

          {/* footer */}
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Annuller
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Gemmer...' : customer ? 'Opdater Kunde' : 'Tilføj Kunde'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}