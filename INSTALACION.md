# 🚀 Guía de Instalación Rápida - MyFinance

## ✅ Requisitos Previos

- **Node.js 18+** instalado en tu sistema
- **Navegador moderno** (Chrome, Safari, Firefox)
- **Git** (opcional, para clonar)

## 🚀 Instalación en 3 Pasos

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Ejecutar en Desarrollo
```bash
npm run dev
```

### 3. Abrir en Navegador
La aplicación se abrirá automáticamente en `http://localhost:3000`

## 📱 Probar la Aplicación

### Datos de Ejemplo
1. Ve a **Configuración** (última pestaña)
2. Haz clic en **"Importar Datos"**
3. Selecciona el archivo `sample-data.json` que viene con la app
4. ¡Disfruta de datos de ejemplo para probar todas las funciones!

### Funcionalidades a Probar
- **Dashboard**: Resumen mensual y portfolio
- **Transacciones**: Añadir ingresos/gastos (con IA o manual)
- **Portfolio**: Gestionar activos e inversiones
- **Facturas**: Control de pagos recurrentes
- **Configuración**: Exportar/importar datos

## 🔧 Construir para Producción

```bash
npm run build
npm run preview
```

## 📱 Instalar como PWA

1. Abre la app en Chrome/Safari
2. Busca el botón de instalación en la barra de direcciones
3. Haz clic en "Instalar"
4. ¡La app aparecerá en tu escritorio/aplicaciones!

## 🌐 Desplegar Online

### Vercel (Gratis)
```bash
npm install -g vercel
vercel
```

### Netlify
1. Haz `npm run build`
2. Sube la carpeta `dist/` a Netlify

## 🆘 Solución de Problemas

### Error: "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port already in use"
```bash
# Cambia el puerto en vite.config.ts
server: { port: 3001 }
```

### La app no se carga
1. Verifica que Node.js esté instalado: `node --version`
2. Reinstala dependencias: `npm install`
3. Limpia caché: `npm run build`

## 📞 Soporte

- **Issues**: [GitHub Issues](https://github.com/tu-usuario/finanzas-app/issues)
- **Documentación**: [README.md](./README.md)

---

**¡Tu aplicación de finanzas está lista! 💰✨** 