FROM php:8.3-apache
RUN docker-php-ext-install pdo_mysql mysqli \
 && echo "pdo_mysql.default_socket=/run/mysqld/mysqld.sock" > /usr/local/etc/php/conf.d/sock.ini \
 && echo "mysqli.default_socket=/run/mysqld/mysqld.sock" >> /usr/local/etc/php/conf.d/sock.ini \
 && printf "upload_max_filesize=20M\npost_max_size=25M\n" > /usr/local/etc/php/conf.d/uploads.ini
