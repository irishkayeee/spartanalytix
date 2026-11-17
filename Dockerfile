FROM php:8.4-apache

RUN printf 'expose_php=Off\ndisplay_errors=Off\nlog_errors=On\nsession.cookie_httponly=1\nsession.cookie_samesite=Lax\n' > /usr/local/etc/php/conf.d/production.ini

COPY assets/ /var/www/html/assets/
COPY includes/ /var/www/html/includes/
COPY index.php login.php logout.php /var/www/html/

EXPOSE 80
