/**
 * TapRD - Configuración de la Empresa y Cumplimiento Legal
 * 
 * IMPORTANTE:
 * Esta información técnica prepara la plataforma para operar formalmente.
 * Los campos con placeholders o valores en trámite deberán ser completados
 * una vez concluido el proceso formal de registro societario y mercantil
 * ante las autoridades competentes de República Dominicana (ONAPI, DGII, Cámara de Comercio).
 * 
 * NO inventar RNC, registro mercantil ni declarar certificaciones no emitidas.
 */

export interface CompanySocialLinks {
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  twitter?: string;
  youtube?: string;
}

export interface CompanyConfig {
  /** Nombre comercial en uso en la plataforma */
  commercialName: string;
  /** Nombre o razón social registrada (vacío o en proceso si no está formalizada) */
  registeredCompanyName: string;
  /** Marca comercial (en proceso o registrada) */
  trademarkName: string;
  /** Registro Nacional de Contribuyentes (RNC) */
  rnc: string;
  /** Registro Mercantil */
  mercantileRegistration: string;
  /** Domicilio comercial / operativo */
  address: string;
  /** Ciudad y país de jurisdicción principal */
  jurisdiction: string;
  /** Correo general de contacto */
  email: string;
  /** Correo dedicado para asuntos legales, privacidad y derechos ARCO */
  legalEmail: string;
  /** Correo dedicado para soporte a usuarios y clientes */
  supportEmail: string;
  /** Teléfono de contacto / WhatsApp comercial */
  phone: string;
  /** Representante legal autorizado (placeholder hasta formalización definitiva) */
  legalRepresentative: string;
  /** Sitio web oficial */
  website: string;
  /** Enlaces a redes sociales oficiales */
  socialLinks: CompanySocialLinks;
  /** Estado de formalización societaria */
  legalStatus: string;
  /** Versión vigente de Términos y Condiciones */
  termsVersion: string;
  /** Versión vigente de Política de Privacidad */
  privacyVersion: string;
  /** Versión vigente de Política de Cookies */
  cookiesVersion: string;
  /** Fecha de última actualización de documentos legales */
  lastUpdatedDate: string;
}

export const COMPANY_CONFIG: CompanyConfig = {
  commercialName: "TapRD",
  registeredCompanyName: "", // En proceso de formalización societaria
  trademarkName: "TapRD",
  rnc: "", // Pendiente de asignación por DGII
  mercantileRegistration: "", // Pendiente de registro ante Cámara de Comercio
  address: "Santo Domingo, Distrito Nacional, República Dominicana",
  jurisdiction: "República Dominicana",
  email: "contacto@taprd.com",
  legalEmail: "legal@taprd.com",
  supportEmail: "soporte@taprd.com",
  phone: "+1 (829) 000-0000",
  legalRepresentative: "", // Pendiente de formalización
  website: "https://taprd.com",
  socialLinks: {
    instagram: "https://instagram.com/taprd",
    facebook: "https://facebook.com/taprd",
    linkedin: "https://linkedin.com/company/taprd"
  },
  legalStatus: "En proceso de estructuración y formalización societaria en República Dominicana",
  termsVersion: "1.0",
  privacyVersion: "1.0",
  cookiesVersion: "1.0",
  lastUpdatedDate: "27 de septiembre de 2026"
};

/**
 * Helper para verificar si los datos fiscales definitivos ya fueron configurados
 */
export function isCompanyFormalized(): boolean {
  return Boolean(COMPANY_CONFIG.rnc && COMPANY_CONFIG.registeredCompanyName);
}
