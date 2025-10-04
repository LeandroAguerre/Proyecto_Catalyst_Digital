#!/bin/bash

# Verificar que se tengan permisos para ejecutar comandos de sistema
if [[ ! -r /proc/cpuinfo ]]; then
    echo "No tienes permisos para leer información del sistema."
    exit 1
fi


# MONITOREO DE CPU
echo "===== CPU ====="
# Muestra el modelo de CPU (solo la primera coincidencia)
grep -m 1 "model name" /proc/cpuinfo | cut -d: -f2 | sed 's/^ //'
# Muestra el uso de CPU en porcentaje (promedio de 1 segundo)
echo "Uso de CPU:"
top -bn1 | grep "Cpu(s)" | awk '{print $2 + $4 "%"}'


# MONITOREO DE MEMORIA RAM
echo "===== MEMORIA RAM ====="
# Muestra memoria total y usada
free -h | awk 'NR==1 || NR==2 {print}'


# MONITOREO DE DISCO
echo "===== DISCO ====="
# Muestra uso de disco en todas las particiones
df -h --total | grep -E "Filesystem|total"

# MONITOREO DE RED
echo "===== RED ====="
# Muestra interfaces de red y bytes enviados/recibidos
if [[ -r /proc/net/dev ]]; then
    awk 'NR>2 {print $1, "Recibidos:", $2, "bytes", "Enviados:", $10, "bytes"}' /proc/net/dev
else
    echo "No se pudo leer información de red."
fi
