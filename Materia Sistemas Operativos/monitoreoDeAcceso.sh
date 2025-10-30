#!/bin/bash

while [ "$opcion" != "0" ]; do
    echo ""
    echo "Monitoreo de acceso al servidor"
    echo "1 - Mostrar sesiones completas de cada usuario"
    echo "2 - Mostrar intento de sesiones fallidas"
    echo "0 - Salir"

    read -p "Seleccione una opcion: " opcion

    case $opcion in
        1)
            read -p "Ingrese la cantidad de ultimas sesiones que desea ver: " sesiones
            if [[ -n "$sesiones" && "$sesiones" =~ ^[0-9]+$ && "$sesiones" -ne 0 ]]; then #triple condicion, no vacia, no sea 0 y que sea un numero 
                echo "USUARIO | TTY/PUERTO | HORA INICIO | HORA SALIDA | DURACION | IP " #el + es que contenga 1 o mas de esos numeros, ^ que inicie y $ que termine con un numero
                last -aFi | head -n "$sesiones" #last muestra el registro del sistema de /var/log/wtmp y -a mueve la ip al ultimo lugar y reordena la informacion
                                                #-F detalla mas la informacion, dando la hora y duracion de la sesion
            fi
            ;;
        2)
            read -p "Ingrese la cantidad de ultimas sesiones que desea ver: " sesiones
            if [[ -n "$sesiones" && "$sesiones" =~ ^[0-9]+$ && "$sesiones" -ne 0 ]]; then
                echo "USUARIO | TTY/PUERTO | IP | HORA DE INTENTO"
                lastb -aFi | head -n "$sesiones"
            fi
            ;;
        0)
            echo "Saliendo..."
            ;;
        *)
            echo "Opcion invalida. Intente de nuevo."
            ;;
    esac
done