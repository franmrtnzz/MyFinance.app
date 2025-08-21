# 🤖 Guía de Uso de IA - MyFinance

## ✨ Funcionalidad de Inteligencia Artificial

MyFinance ahora incluye **captura inteligente** usando OpenAI GPT-3.5-turbo para procesar lenguaje natural en español:

- **💰 Transacciones generales** (ingresos y gastos)
- **📈 Transacciones de activos** (compras, ventas, dividendos, comisiones)

## 🚀 Cómo Usar la IA

### 1. **IA para Transacciones Generales**
- Ve a la pestaña **"Transacciones"**
- Haz clic en el botón **"IA"** (botón morado con icono de chispas ✨)
- Se abrirá el formulario de captura inteligente

### 2. **IA para Transacciones de Activos**
- Ve a la pestaña **"Portfolio"**
- Haz clic en el botón **"IA Transacción"** (botón verde con icono de chispas ✨)
- Se abrirá el formulario de operaciones de activos

### 3. **Escribir en Lenguaje Natural**
Simplemente describe tu operación como lo harías normalmente:

#### 💰 **Transacciones Generales:**

**📝 Ejemplos de Gastos:**
- *"hoy he ido a comer con mis amigos y he gastado 25 euros"*
- *"he comprado gasolina y me ha costado 45,30 euros"*
- *"pago mensual del gimnasio 29,99 euros"*
- *"he pagado la factura de la luz 67,50 euros"*

**💵 Ejemplos de Ingresos:**
- *"he recibido la nómina y me han ingresado 807,60 euros"*
- *"pago de freelance por diseño web 150 euros"*
- *"reembolso de Amazon 34,99 euros"*

#### 📈 **Transacciones de Activos:**

**🛒 Ejemplos de Compras:**
- *"he comprado 10 acciones de Apple a 150 dólares cada una"*
- *"he invertido 2000 euros en acciones de Telefónica"*
- *"he comprado 0.1 Bitcoin a 40000 euros"*

**💸 Ejemplos de Ventas:**
- *"he vendido mis acciones de Tesla por 2000 euros"*
- *"he vendido 5 acciones de Microsoft a 300 dólares cada una"*

**💰 Ejemplos de Dividendos:**
- *"he recibido dividendos de Telefónica por 25 euros"*
- *"dividendos de Apple por 15 dólares"*

**🏦 Ejemplos de Comisiones:**
- *"he pagado 5 euros de comisión por operar"*
- *"comisión del broker 2.50 euros"*

### 4. **Procesamiento Automático**

#### **Para Transacciones Generales:**
- ✅ **Tipo**: Ingreso o Gasto
- ✅ **Cantidad**: Importe exacto
- ✅ **Categoría**: Clasificación inteligente
- ✅ **Descripción**: Texto descriptivo
- ✅ **Recurrencia**: Si es un pago recurrente

#### **Para Transacciones de Activos:**
- ✅ **Activo**: Nombre del activo (Apple, Tesla, Bitcoin, etc.)
- ✅ **Tipo de Operación**: Compra, Venta, Dividendo, Comisión
- ✅ **Cantidad Total**: Importe total de la operación
- ✅ **Número de Acciones**: Cuántas unidades (si aplica)
- ✅ **Precio por Unidad**: Precio individual (si aplica)
- ✅ **Moneda**: EUR, USD, GBP
- ✅ **Creación Automática**: Si el activo no existe, se crea automáticamente

### 5. **Confirmación y Guardado**
- La IA procesará tu texto (puede tomar 2-3 segundos)
- Se mostrará una confirmación de éxito
- **Transacciones Generales**: Aparecen en tu lista de transacciones
- **Transacciones de Activos**: Se crean el activo (si no existe) y la transacción correspondiente

## 🎯 **Casos de Uso Ideales**

### **Captura Rápida en Móvil**
- Perfecto para registrar gastos mientras estás fuera
- No necesitas abrir formularios complejos
- Solo escribe y listo

### **Transacciones Complejas**
- La IA entiende contexto y detalles
- Categoriza automáticamente
- Detecta patrones de recurrencia

### **Múltiples Idiomas**
- Funciona perfectamente en español
- Entiende jerga financiera común
- Adapta categorías según el contexto

## 🔧 **Configuración Técnica**

### **API Key de OpenAI**
- Tu clave ya está configurada en la aplicación
- Se usa el modelo GPT-3.5-turbo (rápido y económico)
- Máximo 150 tokens por consulta (suficiente para transacciones)

### **Seguridad y Privacidad**
- Solo se envía el texto de la transacción a OpenAI
- No se comparten datos financieros personales
- La respuesta se procesa localmente

## 📱 **Ejemplos Prácticos**

### **Escenario 1: Comida**
**Texto:** *"hoy he ido a comer con mis amigos y he gastado 25 euros"*

**Resultado IA:**
- Tipo: Gasto
- Cantidad: 25.00 EUR
- Categoría: Comida
- Descripción: Comida con amigos
- Recurrente: No

### **Escenario 2: Salario**
**Texto:** *"he recibido la nómina y me han ingresado 807,60 euros"*

**Resultado IA:**
- Tipo: Ingreso
- Cantidad: 807.60 EUR
- Categoría: Salario
- Descripción: Nómina mensual
- Recurrente: Sí (mensual)

### **Escenario 3: Servicios**
**Texto:** *"pago mensual de internet 45 euros"*

**Resultado IA:**
- Tipo: Gasto
- Cantidad: 45.00 EUR
- Categoría: Servicios
- Descripción: Internet mensual
- Recurrente: Sí (mensual)

### **Escenario 4: Compra de Acciones**
**Texto:** *"he comprado 10 acciones de Apple a 150 dólares cada una"*

**Resultado IA:**
- Activo: Apple Inc. (se crea automáticamente si no existe)
- Tipo: Compra
- Cantidad Total: 1500.00 USD
- Número de Acciones: 10
- Precio por Unidad: 150.00 USD
- Descripción: Compra de 10 acciones de Apple

### **Escenario 5: Dividendos**
**Texto:** *"he recibido dividendos de Telefónica por 25 euros"*

**Resultado IA:**
- Activo: Telefónica (debe existir previamente o se crea)
- Tipo: Dividendo
- Cantidad Total: 25.00 EUR
- Descripción: Dividendos de Telefónica

## 🚨 **Limitaciones y Consejos**

### **Lo que funciona bien:**
- Cantidades claras en euros
- Descripciones específicas
- Categorías comunes (comida, transporte, servicios)
- Patrones de recurrencia obvios

### **Lo que puede fallar:**
- Textos muy ambiguos
- Cantidades en otras monedas
- Categorías muy específicas o personalizadas
- Jerga local o regional

### **Consejos para mejores resultados:**
1. **Sé específico** con cantidades y fechas
2. **Usa categorías comunes** (comida, transporte, servicios, etc.)
3. **Menciona la recurrencia** si es importante
4. **Escribe en español claro** y directo

## 🔄 **Fallback Manual**

Si la IA no puede procesar tu texto:
1. Se mostrará un mensaje de error
2. Puedes usar el formulario manual tradicional
3. La IA seguirá aprendiendo y mejorando

## 💡 **Trucos y Consejos**

### **Para Gastos Recurrentes:**
- *"pago mensual del gimnasio 29,99 euros"*
- *"abono transporte mensual 120 euros"*
- *"seguro del coche anual 450 euros"*

### **Para Ingresos Variables:**
- *"freelance diseño web 150 euros"*
- *"venta de muebles usados 75 euros"*
- *"bonus de empresa 500 euros"*

### **Para Categorías Específicas:**
- *"gasolina coche 45,30 euros"*
- *"cena restaurante 67,50 euros"*
- *"ropa nueva 89,99 euros"*

---

**¡Disfruta de la captura inteligente de transacciones! 🚀✨**

La IA hace que registrar tus finanzas sea tan fácil como escribir un mensaje de texto. 