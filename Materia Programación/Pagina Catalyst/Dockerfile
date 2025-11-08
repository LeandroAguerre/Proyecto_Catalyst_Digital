# Imagen base de Nginx
FROM nginx:alpine

# Copiamos los archivos del sitio al directorio que Nginx usa por defecto
COPY . /usr/share/nginx/html

# Exponemos el puerto 80 (HTTP)
EXPOSE 80

# Iniciamos Nginx
CMD ["nginx", "-g", "daemon off;"]
