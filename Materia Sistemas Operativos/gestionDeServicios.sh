#!/bin/bash

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
            if [[ -n "$servicio" ]] && systemctl status "$servicio" &>/dev/null ; then
                systemctl start "$servicio"
                echo "El servicio '$servicio' se ha iniciado."
            else
                echo "Error, El servicio no existe."
            fi
            ;;
        2)
            read -p "Ingresa el nombre del servicio: " servicio
            if [[ -n "$servicio" ]] && systemctl status "$servicio" &>/dev/null ; then
                systemctl stop "$servicio"
                echo "El servicio '$servicio' se ha detenido."
            else
                echo "Error, El servicio no existe."
            fi
            ;;
        3)
            read -p "Ingresa el nombre del servicio: " servicio
            if [[ -n "$servicio" ]] && systemctl status "$servicio" &>/dev/null ; then
                systemctl restart "$servicio"
                echo "El servicio '$servicio' se ha reiniciado."
            else
                echo "Error, El servicio no existe."
            fi
            ;;
        4)
            read -p "Ingresa el nombre del servicio: " servicio
            if [[ -n "$servicio" ]] && systemctl status "$servicio" &>/dev/null ; then
                systemctl status "$servicio"
            else
                echo "Error, El servicio no existe."
            fi
            ;;
        5)
            read -p "Ingresa el nombre del servicio: " servicio
            if [[ -n "$servicio" ]] && systemctl status "$servicio" &>/dev/null ; then
                systemctl enable "$servicio"
                echo "El servicio '$servicio' se ha habilitado para iniciar en el arranque."
            else
                echo "Error, El servicio no existe."
            fi
            ;;
        6)
            read -p "Ingresa el nombre del servicio: " servicio
            if [[ -n "$servicio" ]] && systemctl status "$servicio" &>/dev/null ; then
                systemctl disable "$servicio"
                echo "El servicio '$servicio' se ha deshabilitado para el arranque."
            else
                echo "Error, El servicio no existe."
            fi
            ;;
        7)
            systemctl list-units --type=service
            ;;    
        0)
            echo "Saliendo..."
            ;;
        *)
            echo "Opcian invalida. Por favor, selecciona un numero del  0 al 6."
            ;;
    esac
done