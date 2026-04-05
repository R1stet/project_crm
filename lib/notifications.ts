import type { Customer, Status } from '@/types/customer';

export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
}

export const AFVENTER_STALE_DAYS = 14;

/** Statuses that trigger a notification email to the customer. */
export const NOTIFIABLE_STATUSES: Partial<Record<Status, (c: Customer) => EmailPayload>> = {
  'I produktion': buildDressOrderedEmail,
  'Kjole ankommet': buildDressArrivedEmail,
};

/**
 * Send a notification email. Currently opens the user's default email client
 * via mailto:. Replace this single function with an API call when a real
 * email service is set up.
 */
export function sendNotification(email: EmailPayload): void {
  const mailto = `mailto:${email.to}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`;
  window.location.href = mailto;
}

function buildDressOrderedEmail(customer: Customer): EmailPayload {
  const deliveryDate = customer.expectedDeliveryDate
    ? new Date(customer.expectedDeliveryDate).toLocaleDateString('da-DK')
    : 'Dato endnu ikke fastlagt';

  return {
    to: customer.email,
    subject: `Din brudekjole er bestilt - ${customer.name}`,
    body: `Kære ${customer.name},

Vi har den glæde at kunne fortælle dig, at din brudekjole nu er bestilt hos vores leverandør!

📦 Forventet leveringsdato: ${deliveryDate}

Vi kontakter dig, så snart kjolen er ankommet til vores butik.

Har du spørgsmål i mellemtiden, er du altid velkommen til at kontakte os.

Med venlig hilsen,
Team Fuhrmanns`,
  };
}

function buildDressArrivedEmail(customer: Customer): EmailPayload {
  return {
    to: customer.email,
    subject: `Din brudekjole fra Fuhrmanns er klar til afhentning - ${customer.name}`,
    body: `Kære ${customer.name},

Vi har den store glæde at kunne meddele dig, at din smukke brudekjole nu er ankommet til vores butik og er klar til afhentning!

📍 Afhentningsoplysninger:
- Dato: Efter aftale
- Sted: Vores butik
- Kontakt: Ring til os for at aftale tidspunkt

Vi ser frem til at se dig snart!

Med venlig hilsen,
Team Fuhrmanns`,
  };
}
