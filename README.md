# 🚀 MyFinance - Aplicación Personal de Finanzas

Una aplicación web progresiva (PWA) moderna para gestionar tus finanzas personales de forma sencilla y eficiente.

## ✨ Características Principales

- **📊 Dashboard Inteligente**: Resumen mensual de ingresos, gastos y balance
- **💰 Gestión de Transacciones**: Captura rápida de ingresos y gastos con categorías
- **📈 Portfolio de Activos**: Seguimiento de inversiones, ETFs, criptomonedas y más
- **📅 Facturas Recurrentes**: Control de pagos domiciliados con alertas de vencimiento
- **💾 Sincronización en la Nube**: Opcional con Firebase (gratis)
- **🤖 IA Integrada**: Captura de transacciones en lenguaje natural con OpenAI
- **📱 PWA**: Instalable en móvil y desktop, funciona offline
- **🌍 Multi-moneda**: Soporte para EUR, USD, GBP con conversiones
- **📤 Exportación/Importación**: Backup completo de datos en formato JSON

## 🎯 Casos de Uso

- **Gestión diaria de gastos** con captura rápida
- **Seguimiento de ingresos** y presupuestos mensuales
- **Control de portfolio** de inversiones y activos
- **Planificación financiera** con alertas de facturas recurrentes
- **Backup y portabilidad** de datos financieros

## 🛠️ Tecnologías

- **Frontend**: React 18 + TypeScript + Vite
- **Estilos**: Tailwind CSS
- **PWA**: Vite PWA Plugin
- **Base de Datos**: LocalStorage + Firebase (opcional)
- **Iconos**: Lucide React
- **Rutas**: React Router DOM

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+ 
- npm o yarn
- Navegador moderno (Chrome, Safari, Firefox)

### 1. Clonar e Instalar Dependencias

```bash
# Clonar el repositorio
git clone <tu-repositorio>
cd finanzas-app

# Instalar dependencias
npm install
```

### 2. Configurar Firebase (Opcional)

Si quieres sincronización en la nube:

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto
3. Habilita Firestore Database
4. Copia la configuración a `src/config/firebase.ts`

### 3. Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### 4. Construir para Producción

```bash
npm run build
npm run preview
```

## 📱 Uso de la Aplicación

### Dashboard Principal
- **Resumen mensual**: Ingresos, gastos y balance del mes actual
- **Portfolio**: Valor total de activos y próximas facturas
- **Acciones rápidas**: Botones para añadir transacciones, activos o facturas
- **Transacciones recientes**: Últimas 5 transacciones

### Gestión de Transacciones
1. Navega a "Transacciones"
2. **Opción IA**: Haz clic en "IA" y describe tu transacción en lenguaje natural
   - Ejemplo: "hoy he ido a comer con mis amigos y he gastado 25 euros"
3. **Opción Manual**: Haz clic en "Nueva" y completa el formulario
4. Marca si es recurrente
5. Guarda la transacción

### Portfolio de Activos
1. Ve a "Portfolio"
2. Haz clic en "Nuevo Activo"
3. Selecciona tipo (acciones, ETF, fondos, crypto, etc.)
4. Define valor actual y % objetivo
5. Visualiza distribución por tipo de activo

### Facturas Recurrentes
1. Navega a "Facturas"
2. Añade nueva factura con frecuencia y fecha de vencimiento
3. Visualiza "efectivo a mantener" para 30/60/90 días
4. Recibe alertas visuales para facturas próximas a vencer

### Configuración y Datos
- **Exportar**: Descarga backup completo en JSON
- **Importar**: Restaura datos desde archivo JSON
- **Configuración**: Moneda, semana, tema
- **Instalación PWA**: Instala en dispositivo para acceso rápido

## 🔧 Configuración Avanzada

### Variables de Entorno

Crea un archivo `.env.local`:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto
```

### Personalización de Estilos

Modifica `tailwind.config.js` para cambiar colores y tema:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Tus colores personalizados
      }
    }
  }
}
```

## 📊 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
├── contexts/           # Contextos de React (datos, Firebase)
├── pages/              # Páginas principales
├── types/              # Definiciones TypeScript
├── utils/              # Utilidades y formateadores
├── config/             # Configuración (Firebase)
└── App.tsx             # Componente principal
```

## 🚀 Despliegue

### Vercel (Recomendado - Gratis)

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
# Sube la carpeta dist/ a Netlify
```

### GitHub Pages

```bash
npm run build
# Configura GitHub Actions para deploy automático
```

## 🔒 Privacidad y Seguridad

- **Datos locales**: Toda la información se almacena en tu dispositivo
- **Firebase opcional**: Solo si eliges sincronización en la nube
- **Sin telemetría**: No se recopilan datos de uso
- **Exportación completa**: Control total sobre tus datos

## 📈 Roadmap

- [ ] **Presupuestos por categoría** con alertas
- [ ] **Gráficos interactivos** para análisis de tendencias
- [ ] **Notificaciones push** para facturas próximas
- [ ] **Integración bancaria** (Open Banking)
- [ ] **Análisis de gastos** con IA
- [ ] **Múltiples cuentas** y portafolios

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

- **Issues**: [GitHub Issues](https://github.com/tu-usuario/finanzas-app/issues)
- **Documentación**: [Wiki del proyecto](https://github.com/tu-usuario/finanzas-app/wiki)
- **Email**: tu-email@ejemplo.com

## 🙏 Agradecimientos

- **React Team** por el framework
- **Tailwind CSS** por el sistema de diseño
- **Firebase** por la infraestructura backend
- **Comunidad open source** por las librerías utilizadas

---

**¡Disfruta gestionando tus finanzas de forma inteligente! 💰✨** 