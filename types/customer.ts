// /types/customer.ts
export type Status =
  | 'Venter'
  | 'Venter på prøvning'
  | 'I produktion'
  | 'Klar til afhentning'
  | 'Færdig';

export type DressType =
  | 'A-line'
  | 'Ball gown'
  | 'Mermaid'
  | 'Sheath'
  | 'Tea-length'
  | null;

export type InvoiceStatus = 'Skal sendes' | 'Sendt' | 'Delvist betalt' | 'Betalt';

export interface Size {
  bryst: number | null;
  talje: number | null;
  hofte: number | null;
  arms: number | null;
  height: number | null;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  salesperson: string | null;
  status: Status;
  dress: DressType;
  maker: string | null;
  size: Size;
  invoiceStatus: InvoiceStatus;
  invoiceFileUrl: string | null;
  supplierFileUrl: string | null;
  notes: string | null;
  weddingDate: string | null;
  dateAdded: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/* ---------- helpers ---------- */

export function dbRowToCustomer(row: any): Customer {
  const toNum = (val: string | null) => (val === null ? null : parseFloat(val));

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phoneNumber: row.phone_number,
    salesperson: row.salesperson,
    status: row.status,
    dress: row.dress,
    maker: row.maker,
    size: {
      bryst: toNum(row.size_bryst),
      talje: toNum(row.size_talje),
      hofte: toNum(row.size_hofte),
      arms: toNum(row.size_arms),
      height: toNum(row.size_height),
    },
    invoiceStatus: row.invoice_status,
    invoiceFileUrl: row.invoice_file_url,
    supplierFileUrl: row.supplier_file_url,
    notes: row.notes,
    weddingDate: row.wedding_date,
    dateAdded: row.date_added,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function customerToDbRow(
  customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'dateAdded'>
) {
  return {
    name: customer.name,
    email: customer.email,
    phone_number: customer.phoneNumber,
    salesperson: customer.salesperson,
    status: customer.status,
    dress: customer.dress,
    maker: customer.maker,
    size_bryst: customer.size.bryst,
    size_talje: customer.size.talje,
    size_hofte: customer.size.hofte,
    size_arms: customer.size.arms,
    size_height: customer.size.height,
    invoice_status: customer.invoiceStatus,
    invoice_file_url: customer.invoiceFileUrl,
    supplier_file_url: customer.supplierFileUrl,
    notes: customer.notes,
    wedding_date: customer.weddingDate,
    created_by: customer.createdBy,
  };
}