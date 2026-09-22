import fs from 'fs';
import path from 'path';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

console.log('--- Iniciando pruebas de verificación de Modo Oscuro y Modo Claro ---');

// 1. Verificar configuración de Tailwind v4 en src/index.css
const cssContent = fs.readFileSync(path.resolve('./src/index.css'), 'utf8');
assert(
  cssContent.includes('@custom-variant dark (&:is(.dark, .dark *));'),
  'src/index.css contiene la regla @custom-variant dark (&:is(.dark, .dark *)) para Tailwind v4'
);

// 2. Verificar script anti-parpadeo (FOUC) en index.html
const htmlContent = fs.readFileSync(path.resolve('./index.html'), 'utf8');
assert(
  htmlContent.includes('taprd_theme'),
  'index.html verifica la clave taprd_theme en localStorage antes del renderizado'
);
assert(
  htmlContent.includes("root.classList.add('dark')"),
  'index.html aplica la clase "dark" al elemento root (<html>) inmediatamente si corresponde'
);
assert(
  htmlContent.includes('dark:bg-slate-950') && htmlContent.includes('dark:text-slate-100'),
  'index.html tiene clases globales dark:bg-slate-950 y dark:text-slate-100 en <body>'
);

// 3. Verificar ThemeContext
const themeContextContent = fs.readFileSync(path.resolve('./src/contexts/ThemeContext.tsx'), 'utf8');
assert(
  themeContextContent.includes("const STORAGE_KEY = 'taprd_theme';"),
  'ThemeContext utiliza la clave consistente "taprd_theme"'
);
assert(
  themeContextContent.includes("root.classList.add('dark')") && themeContextContent.includes("root.classList.remove('dark')"),
  'ThemeContext añade y remueve dinámicamente la clase "dark" al documento'
);
assert(
  themeContextContent.includes("toggleTheme"),
  'ThemeContext provee toggleTheme para alternar entre modo claro y oscuro'
);

// 4. Verificar componentes públicos clave y de paneles
const componentsToCheck = [
  'src/components/Navbar.tsx',
  'src/components/Footer.tsx',
  'src/components/ThemeToggle.tsx',
  'src/components/ProductCard.tsx',
  'src/components/ProductGrid.tsx',
  'src/components/Advantages.tsx',
  'src/components/HowItWorks.tsx',
  'src/components/BusinessCategoryCard.tsx',
  'src/components/DigitalProfilePreviewCard.tsx',
  'src/components/FAQSection.tsx',
  'src/components/ProductRequestModal.tsx',
  'src/components/AuthModal.tsx',
  'src/components/SaaSDemoModal.tsx',
  'src/pages/HomePage.tsx',
  'src/pages/ProductsPage.tsx',
  'src/pages/ProductDetailPage.tsx',
  'src/components/admin/AdminLayout.tsx',
  'src/components/client/ClientLayout.tsx',
  'src/pages/client/ClientHoursPage.tsx',
  'src/pages/client/ClientProfilePage.tsx',
  'src/pages/client/ClientSocialsPage.tsx',
  'src/pages/client/ClientSupportPage.tsx',
  'src/pages/admin/AdminDashboardPage.tsx',
  'src/pages/admin/AdminClientsPage.tsx',
  'src/pages/admin/AdminClientFormPage.tsx'
];

for (const compPath of componentsToCheck) {
  const fileContent = fs.readFileSync(path.resolve(compPath), 'utf8');
  assert(
    fileContent.includes('dark:'),
    `${compPath} contiene estilos adaptativos dark:`
  );

  // Prohibir clases no estándar de Tailwind que causan fallas visuales
  assert(
    !fileContent.includes('slate-850') && !fileContent.includes('slate-750'),
    `${compPath} no utiliza clases inexistentes como slate-850 o slate-750`
  );
}

// 5. Verificar Navbar ThemeToggle
const navbarContent = fs.readFileSync(path.resolve('./src/components/Navbar.tsx'), 'utf8');
assert(
  navbarContent.includes('ThemeToggle'),
  'Navbar incluye el componente ThemeToggle tanto para escritorio como para móvil'
);

console.log('--- ¡Todas las pruebas de Modo Oscuro y Modo Claro pasaron satisfactoriamente! ---');
