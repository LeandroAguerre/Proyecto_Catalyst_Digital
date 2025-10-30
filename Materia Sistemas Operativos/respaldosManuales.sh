#!/bin/bash

direccionDestino="/home/backup/backups/backupManuales/"
fechaHora=$(date +%Y%m%d_%H%M%S)
logBackup="/var/log/backups.log"

#Creacion de carpeta de destino
if [[ ! -d "$direccionDestino" ]]; then
    echo "Creando directorio de destino: $direccionDestino"
    mkdir -p "$direccionDestino"
    chmod 770 "$direccionDestino"
    chown -R backup:administradores "$direccionDestino"
fi
#Se pide el archivo a respaldad y se obtiene su nombre base
read -p "Ingrese la ruta del archivo a respaldar (ej:/home/usuario/listaDeCompras): " rutaArchivoOriginal
nombreBackup=$(basename "$rutaArchivoOriginal")

#Se verifica si existe el archivo y si existe se hace el respaldo comprimiendo con tar -czf
if [[ ! -f "$rutaArchivoOriginal" ]]; then
    echo "Error, la ruta ingresada no es valida o no es un archivo"
else 
    rutaYarchivoFinal="${direccionDestino}/${nombreBackup}_${fechaHora}.tar.gz"
    tar -czf "$rutaYarchivoFinal" -P "$rutaArchivoOriginal" 
    exitCode=$?

    if [[ "$exitCode" -eq 0 ]]; then

        echo "Respaldo creado con el nombre '${nombreBackup}_${fechaHora}.tar.gz' en la ruta '${direccionDestino}'" >> "$logBackup"
        echo "[COMPLETADO]: Respaldo local de '${nombreBackup}_${fechaHora}.tar.gz' realizado con exito - $(date '+%Y-%m-%d %H:%M:%S')" >> "$logBackup"

    else

        echo "Respaldo fallido, revise logs para mas detalles" >> "$logBackup"
        echo "[ERROR]: Fallo el respaldo local de '${nombreBackup}_${fechaHora}.tar.gz'  - $(date '+%Y-%m-%d %H:%M:%S')" >> "$logBackup"

    fi
fi


