# 📈 CS2 Trading & Market Comparator

## 📖 Sobre el Proyecto

**CS2 Trading & Market Comparator** es una plataforma web *Full-Stack* de alto rendimiento y grado comercial diseñada para centralizar, analizar y comparar precios de activos virtuales (*skins*) de *Counter-Strike 2* (CS2) entre múltiples plataformas. Su objetivo principal es detectar y calcular de manera automatizada **oportunidades de arbitraje financiero**, cruzando datos en tiempo real entre el mercado oficial de Steam y mercados externos como DMarket.

La plataforma ofrece una experiencia rica e interactiva que incluye gestión de inventarios y portafolios personales, cálculo dinámico de costes transaccionales de mercado (comisiones reales de Steam del 15%), **un consultor financiero inteligente asistido por IA (Google Gemini API)**, panel de analíticas avanzadas con gráficos interactivos y un proxy de datos sobre el ecosistema competitivo profesional (Pro Stats).

---

## 🛠️ Stack Tecnológico

### **Backend (Arquitectura y Lógica de Negocio)**
* **Framework:** Laravel 11.x
* **Lenguaje:** PHP 8.x
* **Base de Datos:** MySQL / MariaDB 10.11 (Entorno de Producción) | SQLite (Entorno de desarrollo local)
* **Seguridad y Autenticación:** Laravel Sanctum (Tokens de acceso de portador en API)
* **Caché del Sistema:** Laravel Cache Driver (para estadísticas competitivas y reducción de latencia)
* **Integración de APIs:** HTTP Client nativo con enmascaramiento de agentes

### **Frontend (Interfaz de Usuario Reactiva)**
* **Framework:** Angular 17/18
* **Lenguaje:** TypeScript
* **Estilos:** Tailwind CSS y Material Symbols / Bootstrap Icons
* **Reactividad:** Angular Signals y componentes modulares
* **Animaciones:** Transiciones y efectos CSS de micro-interacciones

### **Infraestructura y Despliegue**
* **Orquestación:** Kubernetes (K8s) con namespace aislado (`grup7`)
* **Persistencia:** Persistent Volume Claims (PVC) vía NFS Client compartido (`mysql-pvc-v2`)
* **Daemon Scheduler:** Proceso loop daemon ejecutándose de forma continua en el pod de backend (`while [ true ]; do php artisan schedule:run; sleep 60; done`)
* **Seguridad:** Inyección de credenciales, llaves de aplicación de Laravel y API keys mediante Kubernetes `Secrets` (`csgo-secrets`)

---

## ✨ Características y Módulos del Sistema

### 1. Arbitrage Scanner (Comparador en Vivo)
* **Consumo de APIs Externas:** Integración directa con **Steam Community Market API** (filtros por AppID 730, parseo de strings monetarios sucios) y **DMarket API** (escalado de valores en centavos de USD a float y obtención de imágenes oficiales).
* **Estrategias Anti-Baneo:** 
  * Periodos dinámicos de sincronización (2 horas activas de consultas y 2 horas inactivas de descanso para proteger la IP de baneos de Steam).
  * Lotes aleatorios de consulta (entre 20 y 40 ítems por lote Artisan).
  * Esperas humanas aleatorias (pausas aleatorias entre 3 y 7 segundos por cada skin consultada).
* **Cálculo de Beneficios:** Algoritmo dinámico que calcula la diferencia neta de arbitraje restando de manera matemática la comisión del **15% del mercado de Steam**.
* **Filtros Avanzados:** Búsqueda textual reactiva, rangos de precios mínimos/máximos, tipo de arma específico (Pistolas, Rifles, Subfusiles, Pesadas, Cuchillos, Guantes) y niveles de recomendación calculados en vivo (*Profitable Opportunity* si margen > 10%, *Low Margin* si margen > 0% o *Not Recommended*).

### 2. Gestión de Inventario y Simulador Financiero
* **Cartera y Saldo Simulado:** Balance de saldo configurable asociado a cada cuenta de usuario.
* **Operaciones de Compraventa:**
  * **Compra:** Permite adquirir cualquier skin del catálogo base a precio de DMarket, deduciendo el dinero del saldo disponible del usuario y añadiéndolo a su inventario en estado de propiedad (*owned*).
  * **Venta (Sell Asset):** Permite vender una skin del inventario personal a un precio bruto personalizado. El backend calcula de manera precisa la tarifa de venta estimada (comisión de Steam del 15%), calcula el beneficio neto de la operación y acredita el saldo neto al usuario, guardando el activo como vendido (*sold*).
* **Movimientos Financieros (P&L):** Historial completo con pestañas de filtro (General, Compras, Ventas), registrando el volumen de compraventa e indicando de manera visual la ganancia o pérdida neta (*Profit & Loss*) de cada activo cerrado.
* **Importación Externa:** Botón de simulación para importar instantáneamente skins desde el inventario del perfil externo de Steam/DMarket (importación simulada del catálogo real como *AK-47 | Redline* y *AWP | Asiimov*).
* **Mètriques en Tiempo Real:** Cálculo dinámico de Inversión Total, Valor Estimado en Steam de la cartera activa y ROI (Retorno de Inversión) global acumulado.

### 3. Asesor Financiero con Inteligencia Artificial (Smart Advisor)
* **Integración con Google Gemini:** Conexión segura con la API de **Google Gemini** (`gemini-flash-latest`) mediante el servicio centralizado `AiService`.
* **Análisis de Portafolio:** Lee de forma dinámica el inventario activo del usuario (nombres de armas, costes de adquisición originales, precios actuales del mercado y beneficios acumulados en USD) y construye un prompt contextual.
* **Respuestas JSON Estructuradas:** El prompt exige a Gemini una respuesta en JSON estructurado plano (`generationConfig` con `responseMimeType` nativo). El Frontend en Angular mapea la respuesta en vivo, sugiriendo de forma visual acciones de venta o retención de activos (*sell* o *hold*) acompañadas de explicaciones estratégicas redactadas por la IA.

### 4. Gráficas e Históricos de Rendimiento
* **Evolución del Portfolio:** Endpoint de estadísticas en el backend (`realized-profit`) que agrupa y suma los beneficios reales de operaciones completas de venta a lo largo del tiempo, filtrados dinámicamente por Semana, Mes o Año.
* **Gráficas de Evolución de Skins:** Historial lineal completo en la vista de detalle de cada skin, alimentado por la tabla `PriceHistory` con registros de fluctuaciones a lo largo de 30 días.
* **Sumario de Actividad:** Métricas visuales del balance total de operaciones completadas (Compras totales vs Ventas totales).

### 5. Panel Pro-Stats (Entorno Competitivo Profesional)
* **API de CSAPI.de:** Rutas internas configuradas en el backend que sirven como proxy seguro para sortear las restricciones de origen compartido (CORS) del navegador.
* **Datos Profesionales:** Muestra el ranking competitivo mundial actualizado, los últimos partidos de competiciones profesionales de Counter-Strike 2 y estadísticas individuales de los jugadores más valorados.
* **Optimización mediante Caché:** Almacenamiento en caché del backend por un periodo estricto de 1 hora para evitar peticiones duplicadas y reducir drásticamente los tiempos de carga en la interfaz del cliente.

### 6. Perfil de Usuario Avanzado
* **Actualización del Perfil:** Modificación de contraseña y datos personales.
* **Foto de Perfil en Base de Datos:** Carga y actualización de imagen de perfil que se codifica en Base64 en el frontend y se almacena directamente como texto largo en la base de datos MariaDB.

---

## 📂 Estructura Arquitectónica del Código

### **Backend (Laravel)**
* **`App\Services\MarketApiService`**: Encapsula y aísla la lógica de consumo HTTP de las APIs externas, controlando los formatos de respuesta.
* **`App\Services\AiService`**: Construye el contexto de inversión estructurado y consume Gemini de manera robusta.
* **`App\Http\Controllers\OperationController`**: Centraliza el control de la cartera, depurando la lógica contable y registrando movimientos.
* **`App\Http\Controllers\StatsController`**: Consulta y agrupa datos por días, semanas o meses con agrupaciones nativas de base de datos (`DB::raw`).
* **`App\Http\Controllers\ProStatsController`**: Administra la integración y la caché de datos competitivos externos.

### **Modelos de Datos y Migraciones**
* **`User` (`users`)**: Cuentas, credenciales, saldo y foto de perfil en Base64.
* **`Skin` (`skins`)**: Catálogo maestro de armas limpias, preus actualizados y márgenes.
* **`PriceHistory` (`price_histories`)**: Historial de fluctuaciones de precios útil para gráficos lineales.
* **`UserItem` (`user_items`)**: Inventario de skins de usuarios, distinguiendo estados (*owned* o *sold*).
* **`Operation` (`operations`)**: Historial de transacciones de compra/venta y margen de P&L.

---

## 🤖 Comandos Artisan Personalizados (CLI)

* **`php artisan market:seed-all-skins`**
  Lee la lista maestra de objetos líquidas desde el archivo local `storage/app/items.json`, aplica filtros estratégicos descartando ítems sin interés comercial (como grafitis, adhesivos comunes, etc.) e inyecta el catálogo básico limpio en paquetes optimizados de 1000 registros para evitar el desbordamiento de memoria.
* **`php artisan market:seed-demo-charts`**
  Genera de forma automática un usuario demo de pruebas (`usuari1@lacetania.cat` / `Usuari1234!`), le asigna un inventario inicial, un historial completo de 11 compras/ventas repartido a lo largo del último año y un historial de fluctuaciones de precios para visualizar gráficos y balances.
* **`php artisan market:sync-skins-lowest-prices`**
  Actualiza los precios mínimos de Steam y DMarket del catálogo base, genera las variaciones de beneficio neto y crea un registro en la tabla `PriceHistory` para trazar los gráficos de evolución de precios en el frontend.

---

## ⚙️ Instalación y Despliegue Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/CSGO-Market-Comparator.git
cd CSGO-Market-Comparator
```

### 2. Configuración del Backend (Laravel)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```
> Configure la base de datos y su clave `GEMINI_API_KEY` en el archivo `.env`.

```bash
# Ejecutar migraciones
php artisan migrate:fresh

# Cargar catálogo de armas limpio en base de datos
php artisan market:seed-all-skins

# Cargar usuario demo de pruebas e históricos de prueba para las gráficas
php artisan market:seed-demo-charts

# Iniciar servidor local
php artisan serve
```

### 3. Configuración del Frontend (Angular)
```bash
cd ../frontend
npm install
npm start
```
> La aplicación web local estará disponible en `http://localhost:4200` y el backend en `http://localhost:8000`.

---

Desarrollado con dedicación por **Álvaro** (Arquitectura de Backend, Base de Datos e Infraestructura) y **Àlex** (Desarrollo Frontend, UX/UI y Experto de Domini).
