/**
 * Contact channels shown on the home page.
 * Set a value to switch a channel on; leave it as null to show "Coming soon".
 * TODO (Block 3): move these into the shop settings table so Abigail can edit them herself.
 */
type ContactChannels = {
  /** Without the @, e.g. "abigailscheesecakes". */
  instagramHandle: string | null;
  /** Without the @. */
  tiktokHandle: string | null;
  email: string | null;
};

export const CONTACT_CHANNELS: ContactChannels = {
  instagramHandle: null,
  tiktokHandle: null,
  email: null,
};

/** The shop's WhatsApp number from settings (international format, digits only), or null. */
export function getWhatsappNumber(): string | null {
  return process.env.WHATSAPP_NUMBER || null;
}

/** "447498184294" → "+44 7498 184294". Other numbers are shown with a leading +. */
export function formatWhatsappNumber(number: string): string {
  if (number.startsWith("44") && number.length === 12) {
    return `+44 ${number.slice(2, 6)} ${number.slice(6)}`;
  }
  return `+${number}`;
}
