export interface Customer {
    id: string
    name: string
    email: string
    phoneNumber: string | null
    salesperson: string | null
    status: string
    dress: string | null
    maker: string | null
    size: {
      bryst: string | null
      talje: string | null
      hofte: string | null
      arms: string | null
      height: string | null
    }
    invoiceStatus: string
    invoicePdf?: string | null
    confirmationPdf?: string | null
    notes: string | null
    weddingDate: string | null
    dateAdded: string
    createdBy: string
    createdAt: string
    updatedAt: string
  }
  
  // Helper function to convert database row to Customer type
  export function dbRowToCustomer(row: any): Customer {
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
        bryst: row.size_bryst,
        talje: row.size_talje,
        hofte: row.size_hofte,
        arms: row.size_arms,
        height: row.size_height,
      },
      invoiceStatus: row.invoice_status,
      invoicePdf: row.invoice_pdf,
      confirmationPdf: row.confirmation_pdf,
      notes: row.notes,
      weddingDate: row.wedding_date,
      dateAdded: row.date_added,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }
  
  // Helper function to convert Customer type to database insert/update format
  export function customerToDbRow(customer: Omit<Customer, "id" | "createdAt" | "updatedAt" | "dateAdded">) {
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
      invoice_pdf: customer.invoicePdf,
      confirmation_pdf: customer.confirmationPdf,
      notes: customer.notes,
      wedding_date: customer.weddingDate,
      created_by: customer.createdBy,
    }
  }  