# Usa la imagen oficial de PHP 8.3 con Apache preinstalado
FROM php:8.3-apache

# Instala Xdebug desde PECL y habilita la extensión
RUN pecl install xdebug \
    && docker-php-ext-enable xdebug \
    # Instala la extensión PDO para conectarse a bases de datos MySQL/MariaDB
    && docker-php-ext-install pdo_mysql

# Configura Xdebug para depuración remota desde el host
RUN echo "zend_extension=xdebug" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini \
    && echo "xdebug.mode=debug" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini \
    && echo "xdebug.start_with_request=yes" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini \
    && echo "xdebug.client_host=host.docker.internal" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini \
    && echo "xdebug.client_port=9003" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini

# Habilita el módulo mod_rewrite de Apache para usar URLs limpias
RUN a2enmod rewrite

# Copia tu configuración personalizada de Apache al contenedor
#COPY ../apache-conf.conf /etc/apache2/sites-available/000-default.conf
COPY docker/apache-conf.conf /etc/apache2/sites-available/000-default.conf




# Habilita el sitio configurado (crea symlink en sites-enabled)
RUN a2ensite 000-default.conf

# Da permisos adecuados a los archivos del proyecto (opcional pero recomendado)
RUN chown -R www-data:www-data /var/www/html \
    && mkdir -p /var/www/html/public/uploads/publicaciones \
    && chown -R www-data:www-data /var/www/html/public/uploads \
    && chmod -R 755 /var/www/html/public/uploads

