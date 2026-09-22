import { DigitalProfile, Client } from '../types';

export function generateVCardFromClient(client: Client): string {
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${client.businessName}`,
    `ORG:${client.businessName}`,
    `TITLE:${client.category}`,
    `NOTE:${client.description} - Perfil digital TapRD (${client.city})`,
  ];

  if (client.phone) {
    lines.push(`TEL;TYPE=WORK,VOICE:${client.phone}`);
  }

  if (client.whatsapp) {
    lines.push(`TEL;TYPE=CELL,VOICE:+${client.whatsapp}`);
  }

  if (client.email) {
    lines.push(`EMAIL;TYPE=INTERNET:${client.email}`);
  }

  if (client.socialLinks?.website) {
    lines.push(`URL:${client.socialLinks.website}`);
  }

  if (client.address) {
    lines.push(`ADR;TYPE=WORK:;;${client.address};${client.city};;Dominican Republic`);
  }

  lines.push('END:VCARD');

  return lines.join('\r\n');
}

export function downloadClientVCard(client: Client) {
  const vcardContent = generateVCardFromClient(client);
  const blob = new Blob([vcardContent], { type: 'text/vcard;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${client.slug || 'contacto'}-taprd.vcf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateVCard(profile: DigitalProfile): string {
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${profile.name}`,
    `ORG:${profile.name}`,
    `TITLE:${profile.category}`,
    `NOTE:${profile.tagline} - Perfil digital TapRD (${profile.city})`,
  ];

  if (profile.phone) {
    lines.push(`TEL;TYPE=WORK,VOICE:${profile.phone}`);
  }

  if (profile.whatsapp) {
    lines.push(`TEL;TYPE=CELL,VOICE:+${profile.whatsapp}`);
  }

  if (profile.email) {
    lines.push(`EMAIL;TYPE=INTERNET:${profile.email}`);
  }

  if (profile.website) {
    lines.push(`URL:${profile.website}`);
  }

  if (profile.address) {
    lines.push(`ADR;TYPE=WORK:;;${profile.address};${profile.city};;Dominican Republic`);
  }

  lines.push('END:VCARD');

  return lines.join('\r\n');
}

export function downloadVCard(profile: DigitalProfile) {
  const vcardContent = generateVCard(profile);
  const blob = new Blob([vcardContent], { type: 'text/vcard;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${profile.slug || 'contacto'}-taprd.vcf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
