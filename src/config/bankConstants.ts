export interface DominicanBankOption {
  name: string;
  shortName: string;
  popular?: boolean;
}

export const DOMINICAN_BANKS: DominicanBankOption[] = [
  { name: 'Banco Popular Dominicano', shortName: 'Popular', popular: true },
  { name: 'Banreservas (Banco de Reservas)', shortName: 'Banreservas', popular: true },
  { name: 'Banco BHD', shortName: 'BHD', popular: true },
  { name: 'Banco Santa Cruz', shortName: 'Santa Cruz', popular: true },
  { name: 'Scotiabank República Dominicana', shortName: 'Scotiabank' },
  { name: 'Banco Promerica', shortName: 'Promerica' },
  { name: 'Banco Caribe', shortName: 'Caribe' },
  { name: 'Banco BDI', shortName: 'BDI' },
  { name: 'Banco Vimenca', shortName: 'Vimenca' },
  { name: 'Banco Ademi', shortName: 'Ademi' },
  { name: 'Qik Banco Digital Dominicano', shortName: 'Qik' },
  { name: 'Asociación Popular de Ahorros y Préstamos (APAP)', shortName: 'APAP' },
  { name: 'Asociación La Nacional (ALNAP)', shortName: 'La Nacional' },
  { name: 'Asociación Cibao (ACAP)', shortName: 'ACAP' },
  { name: 'Otro banco o cooperativa', shortName: 'Otro' }
];

export const ACCOUNT_TYPES = [
  'Cuenta de Ahorros',
  'Cuenta Corriente'
];

export const CURRENCIES = [
  { code: 'DOP', symbol: 'RD$', label: 'Pesos Dominicanos (RD$)' },
  { code: 'USD', symbol: 'US$', label: 'Dólares Americanos (US$)' }
];
