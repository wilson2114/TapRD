/**
 * Listado oficial completo de ciudades, municipios, distritos municipales y pueblos
 * de la República Dominicana, organizados por el Distrito Nacional y las 31 provincias.
 */

export interface DominicanProvince {
  province: string;
  cities: string[];
}

/**
 * Normaliza texto eliminando tildes/diacríticos y pasando a minúsculas
 * para búsquedas rápidas e insensibles a acentos.
 */
export function normalizeLocationText(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Ciudades y polos comerciales más frecuentes en TapRD
 */
export const POPULAR_DOMINICAN_CITIES: string[] = [
  'Santo Domingo',
  'Santo Domingo Este',
  'Santo Domingo Norte (Villa Mella)',
  'Santo Domingo Oeste (Herrera)',
  'Santiago de los Caballeros',
  'Punta Cana / Bávaro',
  'La Romana',
  'Puerto Plata (San Felipe de Puerto Plata)',
  'San Cristóbal',
  'San Pedro de Macorís',
  'Higüey (Salvaleón de Higüey)',
  'La Vega (Concepción de La Vega)',
  'Bonao',
  'San Francisco de Macorís',
  'Las Terrenas',
  'Santa Bárbara de Samaná',
  'Baní',
  'Moca',
  'Jarabacoa',
  'Constanza',
  'Boca Chica',
  'Juan Dolio',
  'Bayahíbe',
  'Sosúa',
  'Cabarete',
  'Barahona (Santa Cruz de Barahona)',
  'Azua de Compostela',
  'Nagua',
  'Cotuí',
  'Mao'
];

/**
 * División completa por provincia (Distrito Nacional + 31 Provincias)
 * con todos sus municipios, distritos municipales, sectores principales y pueblos.
 */
export const DOMINICAN_PROVINCES: DominicanProvince[] = [
  {
    province: 'Distrito Nacional',
    cities: [
      'Santo Domingo (Distrito Nacional)',
      'Arroyo Hondo',
      'Bella Vista',
      'Ciudad Nueva',
      'Cristo Rey',
      'El Cacique',
      'El Millón',
      'Ensanche La Fe',
      'Ensanche Luperón',
      'Ensanche Paraíso',
      'Ensanche Quisqueya',
      'Evaristo Morales',
      'Gazcue',
      'Honduras',
      'Julieta Morales',
      'La Esperilla',
      'La Julia',
      'Los Cacicazgos',
      'Los Prados',
      'Los Ríos',
      'Mata Hambre',
      'Mejoramiento Social',
      'Mirador Norte',
      'Mirador Sur',
      'Naco',
      'Piantini',
      'Renacimiento',
      'San Carlos',
      'San Gerónimo',
      'Urbanización Real',
      'Villa Agrícolas',
      'Villa Consuelo',
      'Villa Francisca',
      'Villa Juana',
      'Zona Colonial'
    ]
  },
  {
    province: 'Santo Domingo (Provincia)',
    cities: [
      'Santo Domingo Este',
      'Santo Domingo Norte (Villa Mella)',
      'Santo Domingo Oeste (Herrera)',
      'Boca Chica',
      'Los Alcarrizos',
      'Pedro Brand',
      'San Antonio de Guerra',
      'Alma Rosa',
      'Andrés (Boca Chica)',
      'Bayona',
      'Buenos Aires de Herrera',
      'Cancino',
      'El Almirante',
      'El Café',
      'Engombe',
      'Ensanche Ozama',
      'Guaricano',
      'Hacienda Estrella',
      'Hato Viejo',
      'Invivienda',
      'La Caleta',
      'La Cuaba',
      'La Guáyiga',
      'La Victoria',
      'Las Caobas',
      'Los Frailes',
      'Los Mina',
      'Manoguayabo',
      'Mendoza',
      'Palmarejo-Villa Linda',
      'Pantoja',
      'Sabana Perdida',
      'San Isidro',
      'San Luis',
      'Sierra Prieta',
      'Villa Faro'
    ]
  },
  {
    province: 'Santiago',
    cities: [
      'Santiago de los Caballeros',
      'Baitoa',
      'Jánico',
      'Licey al Medio',
      'Puñal',
      'Sabana Iglesia',
      'San José de las Matas',
      'Tamboril',
      'Villa Bisonó (Navarrete)',
      'Villa González',
      'Canabacoa',
      'Canca la Piedra',
      'Cienfuegos (Santiago Oeste)',
      'El Caimito',
      'El Ingenio',
      'El Limón (Villa González)',
      'El Rubio',
      'Guayabal (Puñal)',
      'Gurabo',
      'Hato del Yaque',
      'Juncalito',
      'La Canela',
      'La Cuesta',
      'Las Palomas',
      'Las Placetas',
      'Palmar Arriba',
      'Pedro García',
      'San Francisco de Jacagua'
    ]
  },
  {
    province: 'Azua',
    cities: [
      'Azua de Compostela',
      'Estebanía',
      'Guayabal',
      'Las Charcas',
      'Las Yayas de Viajama',
      'Padre Las Casas',
      'Peralta',
      'Pueblo Viejo',
      'Sabana Yegua',
      'Tábara Arriba',
      'Amiama Gómez',
      'Barreras',
      'Barro Arriba',
      'Clavellina',
      'El Rosario (Azua)',
      'Emma Balaguer Viuda Vallejo',
      'Ganadero',
      'Hatillo (Azua)',
      'Hato Nuevo Cortés',
      'La Siembra',
      'Las Barías-La Estancia',
      'Las Lagunas (Azua)',
      'Las Lomas',
      'Los Fríos',
      'Los Jovillos',
      'Los Toros',
      'Monte Bonito',
      'Palmar de Ocoa',
      'Proyecto 2-C',
      'Proyecto 4',
      'Puerto Viejo',
      'Tábara Abajo',
      'Villarpando'
    ]
  },
  {
    province: 'Bahoruco',
    cities: [
      'Neiba',
      'Galván',
      'Los Ríos',
      'Tamayo',
      'Villa Jaragua',
      'Cabeza de Toro',
      'El Palmar',
      'El Salado',
      'Las Clavellinas',
      'Mena',
      'Monserrat',
      'Santa Bárbara-El 6',
      'Santana (Bahoruco)',
      'Uvilla'
    ]
  },
  {
    province: 'Barahona',
    cities: [
      'Barahona (Santa Cruz de Barahona)',
      'Cabral',
      'El Peñón',
      'Enriquillo',
      'Fundación',
      'Jaquimeyes',
      'La Ciénaga',
      'Las Salinas',
      'Paraíso',
      'Polo',
      'Vicente Noble',
      'Arroyo Dulce',
      'Bahoruco (Pueblo)',
      'Canoa',
      'El Cachón',
      'Fondo Negro',
      'La Guázara',
      'Los Patos',
      'Palo Alto',
      'Pescadería',
      'Quita Coraza',
      'Villa Central'
    ]
  },
  {
    province: 'Dajabón',
    cities: [
      'Dajabón',
      'El Pino',
      'Loma de Cabrera',
      'Partido',
      'Restauración',
      'Cañongo',
      'Capotillo',
      'Manuel Bueno',
      'Santiago de la Cruz'
    ]
  },
  {
    province: 'Duarte',
    cities: [
      'San Francisco de Macorís',
      'Arenoso',
      'Castillo',
      'Eugenio María de Hostos',
      'Las Guáranas',
      'Pimentel',
      'Villa Riva',
      'Agua Santa del Yuna',
      'Aguacate',
      'Barraquito',
      'Cenoví',
      'Cristo Rey de Guaraguao',
      'Jaya',
      'La Peña',
      'Las Coles',
      'Presidente Don Antonio Guzmán Fernández',
      'Sabana Grande (Hostos)'
    ]
  },
  {
    province: 'El Seibo',
    cities: [
      'Santa Cruz de El Seibo',
      'Miches',
      'El Cedro',
      'La Gina',
      'Pedro Sánchez',
      'San Francisco-Vicentillo',
      'Santa Lucía'
    ]
  },
  {
    province: 'Elías Piña',
    cities: [
      'Comendador',
      'Bánica',
      'El Llano',
      'Hondo Valle',
      'Juan Santiago',
      'Pedro Santana',
      'Guanito (El Llano)',
      'Guayabo',
      'Rancho de la Guardia',
      'Río Limpio',
      'Sabana Cruz',
      'Sabana Higüero',
      'Sabana Larga (Elías Piña)'
    ]
  },
  {
    province: 'Espaillat',
    cities: [
      'Moca',
      'Cayetano Germosén',
      'Gaspar Hernández',
      'Jamao al Norte',
      'San Víctor',
      'Canca la Reina',
      'El Higüerito',
      'Joba Arriba',
      'José Contreras (Villa Trina)',
      'Juan López',
      'La Ortega',
      'Las Lagunas (Moca)',
      'Monte de la Jagua',
      'Veragua',
      'Villa Magante'
    ]
  },
  {
    province: 'Hato Mayor',
    cities: [
      'Hato Mayor del Rey',
      'El Valle',
      'Sabana de la Mar',
      'Elupina Cordero (Las Cañitas)',
      'Guayabo Dulce',
      'Mata Palacio',
      'Yerba Buena'
    ]
  },
  {
    province: 'Hermanas Mirabal',
    cities: [
      'Salcedo',
      'Tenares',
      'Villa Tapia',
      'Blanco Arriba',
      'Jamao Afuera'
    ]
  },
  {
    province: 'Independencia',
    cities: [
      'Jimaní',
      'Cristóbal',
      'Duvergé',
      'La Descubierta',
      'Mella',
      'Postrer Río',
      'Batey 8',
      'Boca de Cachón',
      'El Limón (Jimaní)',
      'Guayabal (Independencia)',
      'La Colonia',
      'Vengan a Ver'
    ]
  },
  {
    province: 'La Altagracia',
    cities: [
      'Higüey (Salvaleón de Higüey)',
      'San Rafael del Yuma',
      'Bávaro',
      'Bayahíbe',
      'Boca de Yuma',
      'Cap Cana',
      'La Otra Banda',
      'Las Lagunas de Nisibón',
      'Macao',
      'Punta Cana',
      'Uvero Alto',
      'Verón'
    ]
  },
  {
    province: 'La Romana',
    cities: [
      'La Romana',
      'Guaymate',
      'Villa Hermosa',
      'Caleta',
      'Casa de Campo',
      'Cumayasa'
    ]
  },
  {
    province: 'La Vega',
    cities: [
      'La Vega (Concepción de La Vega)',
      'Constanza',
      'Jarabacoa',
      'Jima Abajo',
      'Buena Vista',
      'Don Juan Rodríguez (Barranca)',
      'El Ranchito',
      'La Sabina',
      'Manabao',
      'Rincón',
      'Río Verde Arriba',
      'Tavera',
      'Tireo'
    ]
  },
  {
    province: 'María Trinidad Sánchez',
    cities: [
      'Nagua',
      'Cabrera',
      'El Factor',
      'Río San Juan',
      'Arroyo al Medio',
      'Arroyo Salado',
      'El Pozo',
      'La Entrada',
      'Las Gordas',
      'San José de Matanzas'
    ]
  },
  {
    province: 'Monseñor Nouel',
    cities: [
      'Bonao',
      'Maimón',
      'Piedra Blanca',
      'Arroyo Toro-Masipedro',
      'Jayaco',
      'Juan Adrián',
      'Juma Bejucal',
      'La Salvia-Los Quemados',
      'Sabana del Puerto',
      'Sonador (Villa Sonador)'
    ]
  },
  {
    province: 'Montecristi',
    cities: [
      'San Fernando de Montecristi',
      'Castañuelas',
      'Guayubín',
      'Las Matas de Santa Cruz',
      'Pepillo Salcedo (Manzanillo)',
      'Villa Vásquez',
      'Cana Chapetón',
      'Hatillo Palma',
      'Palo Verde',
      'Santa María',
      'Villa Elisa'
    ]
  },
  {
    province: 'Monte Plata',
    cities: [
      'Monte Plata',
      'Bayaguana',
      'Peralvillo',
      'Sabana Grande de Boyá',
      'Yamasá',
      'Boyá',
      'Chirino',
      'Don Juan',
      'Gonzalo',
      'Los Botados',
      'Majagual',
      'Mamá Tingó'
    ]
  },
  {
    province: 'Pedernales',
    cities: [
      'Pedernales',
      'Oviedo',
      'Bahía de las Águilas',
      'Cabo Rojo',
      'José Francisco Peña Gómez',
      'Juancho'
    ]
  },
  {
    province: 'Peravia',
    cities: [
      'Baní',
      'Matanzas',
      'Nizao',
      'Catalina',
      'El Carretón',
      'El Limonar',
      'Las Barías',
      'Paya',
      'Pizarrete',
      'Sabana Buey',
      'Salinas de Puerto Hermoso',
      'Santana (Baní)',
      'Villa Fundación',
      'Villa Sombrero'
    ]
  },
  {
    province: 'Puerto Plata',
    cities: [
      'Puerto Plata (San Felipe de Puerto Plata)',
      'Altamira',
      'Guananico',
      'Imbert',
      'Los Hidalgos (El Mamey)',
      'Luperón',
      'Sosúa',
      'Villa Isabela',
      'Villa Montellano',
      'Belloso',
      'Cabarete',
      'Cofresí',
      'Costambar',
      'El Estrecho de Luperón',
      'Estero Hondo',
      'Gualete',
      'La Isabela Histórica',
      'La Jaiba',
      'Maimón (Puerto Plata)',
      'Navas',
      'Río Grande',
      'Sabaneta de Yásica',
      'Yásica Arriba'
    ]
  },
  {
    province: 'Samaná',
    cities: [
      'Santa Bárbara de Samaná',
      'Las Terrenas',
      'Sánchez',
      'Arroyo Barril',
      'El Limón (Samaná)',
      'Las Galeras'
    ]
  },
  {
    province: 'San Cristóbal',
    cities: [
      'San Cristóbal',
      'Bajos de Haina',
      'Cambita Garabitos',
      'Los Cacaos',
      'Sabana Grande de Palenque',
      'San Gregorio de Nigua',
      'Villa Altagracia',
      'Yaguate',
      'Cambita El Pueblecito',
      'El Carril',
      'Hatillo (San Cristóbal)',
      'Hato Damas',
      'La Cuchilla',
      'Medina',
      'San José del Puerto'
    ]
  },
  {
    province: 'San José de Ocoa',
    cities: [
      'San José de Ocoa',
      'Rancho Arriba',
      'Sabana Larga',
      'El Naranjal',
      'El Pinar',
      'La Ciénaga (Ocoa)',
      'Nizao-Las Auyamas'
    ]
  },
  {
    province: 'San Juan',
    cities: [
      'San Juan de la Maguana',
      'Bohechío',
      'El Cercado',
      'Juan de Herrera',
      'Las Matas de Farfán',
      'Vallejuelo',
      'Arroyo Cano',
      'Batista',
      'Carrera de Yeguas',
      'Derrumbadero (Derrumbato)',
      'El Rosario (San Juan)',
      'Guanito',
      'Hato del Padre',
      'Hato Nuevo',
      'Jínova',
      'Jorjillo',
      'La Jagua',
      'Las Charcas de María Nova',
      'Las Maguanas-Hato Nuevo',
      'Las Zanjas',
      'Matayaya',
      'Pedro Corto',
      'Sabana Alta',
      'Sabaneta (San Juan)',
      'Yaque'
    ]
  },
  {
    province: 'San Pedro de Macorís',
    cities: [
      'San Pedro de Macorís',
      'Consuelo',
      'Guayacanes',
      'Quisqueya',
      'Ramón Santana',
      'San José de los Llanos',
      'El Puerto',
      'Gautier',
      'Juan Dolio'
    ]
  },
  {
    province: 'Sánchez Ramírez',
    cities: [
      'Cotuí',
      'Cevicos',
      'Fantino',
      'La Mata',
      'Angelina',
      'Caballero',
      'Comedero Arriba',
      'Hernando Alonzo',
      'La Bija',
      'La Cueva',
      'Platanal',
      'Quita Sueño (Cotuí)',
      'Zambrana Abajo'
    ]
  },
  {
    province: 'Santiago Rodríguez',
    cities: [
      'San Ignacio de Sabaneta',
      'Monción',
      'Villa Los Almácigos'
    ]
  },
  {
    province: 'Valverde',
    cities: [
      'Mao',
      'Esperanza',
      'Laguna Salada',
      'Ámina',
      'Boca de Mao',
      'Cruce de Guayacanes',
      'Guatapanal',
      'Jaibón (Laguna Salada)',
      'Jaibón (Pueblo Nuevo)',
      'Jicomé',
      'La Caya',
      'Maizal',
      'Paradero'
    ]
  }
];

/**
 * Devuelve el nombre de la provincia a la que pertenece una ciudad o pueblo dado.
 */
export function getProvinceByCity(cityName: string): string | null {
  if (!cityName) return null;
  const target = normalizeLocationText(cityName);

  // Coincidencia exacta primero
  for (const prov of DOMINICAN_PROVINCES) {
    if (prov.cities.some(c => normalizeLocationText(c) === target)) {
      return prov.province;
    }
  }

  // Coincidencias heredadas comunes
  if (target === 'santo domingo') return 'Distrito Nacional';
  if (target === 'punta cana / bavaro') return 'La Altagracia';
  if (target === 'las terrenas / samana') return 'Samaná';
  if (target === 'sosua / cabarete') return 'Puerto Plata';
  if (target === 'puerto plata') return 'Puerto Plata';
  if (target === 'higuey') return 'La Altagracia';
  if (target === 'la vega') return 'La Vega';
  if (target === 'barahona') return 'Barahona';

  // Coincidencia parcial segura
  for (const prov of DOMINICAN_PROVINCES) {
    if (
      prov.cities.some(c => {
        const normC = normalizeLocationText(c);
        return normC.startsWith(target) || target.startsWith(normC);
      })
    ) {
      return prov.province;
    }
  }

  return null;
}

/**
 * Lista plana consolidada con compatibilidad total hacia atrás con los valores existentes:
 * 'Santo Domingo', 'Santiago de los Caballeros', 'La Romana', 'Punta Cana / Bávaro', etc.
 */
function buildAllDominicanCities(): string[] {
  const result: string[] = [];
  const set = new Set<string>();

  // 1. Agregar primero las principales / más comunes y valores heredados
  const legacyAndPopular = [
    'Santo Domingo',
    'Santiago de los Caballeros',
    'La Romana',
    'Punta Cana / Bávaro',
    'Puerto Plata',
    'San Cristóbal',
    'San Pedro de Macorís',
    'Higüey',
    'La Vega',
    'Bonao',
    'San Francisco de Macorís',
    'Las Terrenas / Samaná',
    'Baní',
    'Moca',
    'Jarabacoa',
    'Constanza',
    'Boca Chica',
    'Juan Dolio',
    'Bayahíbe',
    'Sosúa / Cabarete',
    'Sosúa',
    'Cabarete',
    'Barahona',
    'Azua de Compostela',
    'Nagua',
    'Cotuí',
    'Mao',
    'Hato Mayor del Rey',
    'Santa Cruz de El Seibo',
    'Monte Plata',
    'San Fernando de Montecristi',
    'Dajabón',
    'Salcedo',
    'San Juan de la Maguana',
    'San José de Ocoa',
    'Neiba',
    'Pedernales',
    'Jimaní',
    'Comendador'
  ];

  for (const city of legacyAndPopular) {
    const key = city.toLowerCase();
    if (!set.has(key)) {
      set.add(key);
      result.push(city);
    }
  }

  // 2. Extraer todas las demás ciudades y pueblos por orden alfabético
  const allOtherCities: string[] = [];
  for (const prov of DOMINICAN_PROVINCES) {
    for (const c of prov.cities) {
      const key = c.toLowerCase();
      if (!set.has(key)) {
        set.add(key);
        allOtherCities.push(c);
      }
    }
  }

  allOtherCities.sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));

  return [...result, ...allOtherCities];
}

export const ALL_DOMINICAN_CITIES: string[] = buildAllDominicanCities();

/**
 * Exportación para reemplazo directo y compatibilidad 100% de CITIES
 */
export const CITIES = ALL_DOMINICAN_CITIES;
