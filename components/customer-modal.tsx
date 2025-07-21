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
import type { Customer, DressType, Status, InvoiceStatus } from '@/types/customer';
import { uploadInvoice } from '@/lib/storage';
import { Upload, Loader2 } from 'lucide-react';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    customer: Omit<Customer, 'id' | 'createdBy' | 'createdAt' | 'updatedAt' | 'dateAdded'>
  ) => Promise<void>;
  customer?: Customer | null;
}

const dressOptions: DressType[] = ['A-line', 'Ball gown', 'Mermaid', 'Sheath', 'Tea-length'];
const statusOptions: Status[] = [
  'Awaiting',
  'Awaiting fitting',
  'In production',
  'Ready for pickup',
  'Finished',
];
const invoiceOptions: InvoiceStatus[] = ['To be sent', 'Sent', 'Partially paid', 'Paid'];

export function CustomerModal({ isOpen, onClose, onSave, customer }: CustomerModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    salesperson: '',
    status: 'Awaiting' as Status,
    dress: null as DressType,
    maker: '',
    size: {
      bryst: '',
      talje: '',
      hofte: '',
      arms: '',
      height: '',
    },
    invoiceStatus: 'To be sent' as InvoiceStatus,
    invoiceFileUrl: '',
    confirmationFileUrl: '',
    notes: '',
    weddingDate: '',
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        size: {
          bryst: customer.size.bryst?.toString() ?? '',
          talje: customer.size.talje?.toString() ?? '',
          hofte: customer.size.hofte?.toString() ?? '',
          arms: customer.size.arms?.toString() ?? '',
          height: customer.size.height?.toString() ?? '',
        },
        invoiceStatus: customer.invoiceStatus,
        invoiceFileUrl: customer.invoiceFileUrl ?? '',
        confirmationFileUrl: customer.confirmationFileUrl ?? '',
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
        status: 'Awaiting',
        dress: null,
        maker: '',
        size: {
          bryst: '',
          talje: '',
          hofte: '',
          arms: '',
          height: '',
        },
        invoiceStatus: 'To be sent',
        invoiceFileUrl: '',
        confirmationFileUrl: '',
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
      alert('Please select a PDF file');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    try {
      const url = await uploadInvoice(file, customer?.id);
      handleChange('invoiceFileUrl', url);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
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
        size: {
          bryst: toNum(formData.size.bryst),
          talje: toNum(formData.size.talje),
          hofte: toNum(formData.size.hofte),
          arms: toNum(formData.size.arms),
          height: toNum(formData.size.height),
        },
        invoiceFileUrl: formData.invoiceFileUrl || null,
        confirmationFileUrl: formData.confirmationFileUrl || null,
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
          <DialogTitle>{customer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
          <DialogDescription>
            {customer ? 'Update customer information below.' : 'Enter customer details below.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} required />
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
              <Label htmlFor="phoneNumber">Phone Number</Label>
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
              <Label htmlFor="salesperson">Salesperson</Label>
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
                  <SelectValue placeholder="Select status" />
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

          {/* dress + maker */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dress">Dress</Label>
              <Select value={formData.dress ?? ''} onValueChange={(v) => handleChange('dress', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {dressOptions.map((opt) => (
                    <SelectItem key={opt ?? 'none'} value={opt ?? ''}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maker">Maker</Label>
              <Input id="maker" value={formData.maker} onChange={(e) => handleChange('maker', e.target.value)} />
            </div>
          </div>

          {/* sizes */}
          <div className="space-y-2">
            <Label>Size Measurements (cm)</Label>
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

          {/* invoice status + wedding date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceStatus">Invoice Status</Label>
              <Select value={formData.invoiceStatus} onValueChange={(v) => handleChange('invoiceStatus', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select invoice status" />
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
            <div className="space-y-2">
              <Label htmlFor="weddingDate">Wedding Date</Label>
              <Input
                id="weddingDate"
                type="date"
                value={formData.weddingDate}
                onChange={(e) => handleChange('weddingDate', e.target.value)}
              />
            </div>
          </div>

          {/* file URLs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceFileUrl">Invoice File URL</Label>
              <div className="flex gap-2">
                <Input
                  id="invoiceFileUrl"
                  placeholder="invoices/{id}.pdf or upload file"
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
                <p className="text-xs text-blue-600">Uploading PDF...</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmationFileUrl">Confirmation File URL</Label>
              <Input
                id="confirmationFileUrl"
                placeholder="confirmations/{id}.pdf"
                value={formData.confirmationFileUrl}
                onChange={(e) => handleChange('confirmationFileUrl', e.target.value)}
              />
            </div>
          </div>

          {/* notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
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
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : customer ? 'Update Customer' : 'Add Customer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}