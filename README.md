# 📈 CS2 Trading & Market Comparator

> **⚠️ ESTADO DEL PROYECTO: EN DESARROLLO (WORK IN PROGRESS) ⚠️** > *Este proyecto se encuentra actualmente en fase de desarrollo (Fase 4 completada). Las funcionalidades y la estructura de la base de datos están sujetas a cambios continuos.*

## 📖 Sobre el Proyecto

CS2 Trading & Market Comparator es una plataforma web full-stack diseñada para analizar, comparar y trackear los precios de las skins de Counter-Strike 2 (CS2) en diferentes mercados. Su objetivo principal es calcular los márgenes de beneficio (Profit Margins) cruzando datos en tiempo real entre el mercado oficial de Steam y mercados de terceros (como DMarket).

Además, incluye un módulo de estadísticas del ecosistema competitivo profesional (Pro Stats).

## 🛠️ Stack Tecnológico

**Backend:**
* PHP 8.x
* Laravel 11.x
* Laravel Sanctum (Autenticación basada en Tokens)
* SQLite / MySQL
* HTTP Client (Integración de APIs RESTful)

**Frontend:**
* Angular 17/18
* TypeScript
* Bootstrap Icons
* CSS / HTML5

**APIs Externas Integradas:**
* Steam Community Market API (Precios base y volumen)
* DMarket API (Ofertas en vivo)
* CSAPI.de (Clasificaciones, Partidos y Estadísticas de jugadores Pro)

---

## ✨ Características Principales (Hasta la fecha)

1. **Catálogo de Skins Base:** Base de datos con modelos de armas normalizados.
2. **Sincronización de Mercados:** Comandos programados para actualizar precios mínimos y calcular márgenes de beneficio.
3. **Ofertas Detalladas (DMarket):** Vinculación de ofertas específicas (con *float values* e *inspect links*) al catálogo base.
4. **Sistema de Usuarios:** Registro, login, actualización de perfil e imagen, gestionado de forma segura con tokens.
5. **Panel Pro-Stats:** Sistema de caché implementado para mostrar el ranking mundial, últimos partidos y estadísticas de jugadores profesionales.

---

## ⚙️ Instalación y Despliegue Local

### 1. Clonar el repositorio
```bash
git clone [https://github.com/tu-usuario/CSGO-Market-Comparator.git](https://github.com/tu-usuario/CSGO-Market-Comparator.git)
cd CSGO-Market-Comparator

### 2. Configuración del Backend (Laravel)
cd backend
composer install
cp .env.example .env
php artisan key:generate

Configura tu base de datos en el archivo .env (por defecto SQLite para desarrollo).

# Execució de migracions i càrrega de dades inicials (Seeder)
php artisan migrate:fresh --seed

# Iniciar el servidor de desenvolupament
php artisan serve

### 3. Configuración del Frontend (Angular)
cd frontend
npm install
npm start

La aplicación estará disponible en http://localhost:4200.

## 🤖 Comandos Personalizados (CLI)
El backend incluye comandos Artisan creados específicamente para la orquestación de datos:

php artisan market:sync-skins-lowest-prices   ---  "Sincroniza los precios mínimos de Steam y DMarket para las skins del catálogo base y calcula el margen de beneficio."
php artisan dmarket:sync-items   ---  "Importa las ofertas en vivo (Top 100 populares) desde DMarket, gestiona las altas de nuevas skins y guarda los datos de desgaste (float)."

(Nota: Para evitar baneos de IP por Rate Limiting de Steam, los comandos incluyen pausas estratégicas de 2-3 segundos entre peticiones).

## 📂 Estructura Arquitectónica Destacada
MarketApiService: Servicio centralizado que aplica el principio DRY para gestionar todas las llamadas HTTP a las APIs de Steam y DMarket.

ProStatsController: Controlador optimizado con Cache (1 hora) para reducir la latencia al consultar datos competitivos externos.

AuthController: Gestión integral de la sesión del usuario utilizando tokens planos de Laravel Sanctum.


Desarrollado por Álvaro y Álex.
### ¿Qué te parece?
He incluido todas las partes clave en las que hemos trabajado: los comandos Artisan, el `MarketApiService`, el control de usuarios, y hasta el detalle técnico de por qué usamos caché y el `sleep()` para evitar que Steam os bloquee.

Siéntete libre de modificar los enlaces (como el de clonar el repositorio) para que coincidan exactamente con la URL de vuestro GitHub.
