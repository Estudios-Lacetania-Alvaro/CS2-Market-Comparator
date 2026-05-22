FROM php:8.2-apache

# Instal·lar dependències del sistema i llibreries de desenvolupament necessàries
RUN apt-get update && apt-get install -y \
    libzip-dev \
    zip \
    unzip \
    git \
    && rm -rf /var/lib/apt/lists/*

# Instal·lar i configurar les extensions de PHP requerides (PDO, PDO_MySQL, ZIP i BCMath)
RUN docker-php-ext-install pdo pdo_mysql zip bcmath

# Habilitar el mòdul rewrite d'Apache (crític pel routing de Laravel)
RUN a2enmod rewrite

# Actualitzar la configuració de DocumentRoot d'Apache perquè apunti a la carpeta public de Laravel
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Copiar el codi de l'aplicació
COPY . /var/www/html

# Ajustar els permisos de les carpetes de storage i cache
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Eliminar qualsevol fitxer de caché local per evitar errors de càrrega de paquets dev en producció
RUN rm -f /var/www/html/bootstrap/cache/packages.php /var/www/html/bootstrap/cache/services.php /var/www/html/bootstrap/cache/config.php

# Copiar Composer de manera oficial i instal·lar les dependències sense entorns de desenvolupament (dev)
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
RUN composer install --no-dev --optimize-autoloader --no-scripts

EXPOSE 80
