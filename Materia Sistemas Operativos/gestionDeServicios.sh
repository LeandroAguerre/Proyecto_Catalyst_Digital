#!/bin/bash

service_exists() {
    
    systemctl list-unit-files --no-pager "$1.service" &>/dev/null
}

while [ "$opcion" != "0" ]; do
    
    echo ""
    echo "MENU DE GESTION DE SERVICIOS"
    echo "1. Iniciar un servicio"
    echo "2. Detener un servicio"
    echo "3. Reiniciar un servicio"
    echo "4. Ver el estado de un servicio"
    echo "5. Habilitar un servicio"
    echo "6. Deshabilitar un servicio"
    echo "7. Lista de servicios"
    echo "0. Salir"

    read -p "Selecciona una opción: " opcion

    case $opcion in
        1)
            read -p "Ingresa el nombre del servicio: " servicio
            if service_exists "$servicio"; then
                systemctl start "$servicio"
                echo "El servicio '$servicio' se ha iniciado."
            else
                echo "Error, El servicio no existe."
            fi
            ;;
        2)
            read -p "Ingresa el nombre del servicio: " servicio
            if service_exists "$servicio"; then
                systemctl stop "$servicio"
                echo "El servicio '$servicio' se ha detenido."
            else
                echo "Error, El servicio no existe."
            fi
            ;;
        3)
            read -p "Ingresa el nombre del servicio: " servicio
            if service_exists "$servicio"; then
                systemctl restart "$servicio"
                echo "El servicio '$servicio' se ha reiniciado."
            else
                echo "Error, El servicio no existe."
            fi
            ;;
        4)
            read -p "Ingresa el nombre del servicio: " servicio
            if service_exists "$servicio"; then
                echo "$(systemctl status "$servicio")"
            else
                echo "Error, El servicio no existe."
            fi
            ;;
        5)
            read -p "Ingresa el nombre del servicio: " servicio
            if service_exists "$servicio"; then
                systemctl enable "$servicio"
                echo "El servicio '$servicio' se ha habilitado para iniciar en el arranque."
            else
                echo "Error, El servicio no existe."
            fi
            ;;
        6)
            read -p "Ingresa el nombre del servicio: " servicio
            if service_exists "$servicio"; then
                systemctl disable "$servicio"
                echo "El servicio '$servicio' se ha deshabilitado para el arranque."
            else
                echo "Error, El servicio no existe."
            fi
            ;;
        7)
            echo "$(systemctl list-units --type=service)"
            ;;    
        0)
            echo "Saliendo..."
            ;;
        *)
            echo "Opcian invalida. Por favor, selecciona un numero del  0 al 7."
            ;;
    esac
done