#!/bin/bash

while [ "$opcion" != "0" ]; do
    
    echo ""
    echo "MENU DE GESTION DE SCRIPTS"
    echo "1. Gestion de usuarios"
    echo "2. Gestion de servicios"
    echo "3. Monitoreo de recursos"
    echo "4. El que falta"
    echo "0. Salir"

    read -p "Selecciona una opción: " opcion

    case $opcion in
        1)
            /home/administradores/scripts/gestionDeUsuarios.sh
            ;;
        2)
            /home/administradores/scripts/gestionDeServicios.sh
            ;;
        3)
            /home/administradores/scripts/monitor_de_recursos.sh
            ;;
        4)
            /home/administradores/scripts/elquefalta.sh
            ;;   
        0)
            echo "Saliendo..."
            ;;
        *)
            echo "Opcian invalida. Por favor, selecciona un numero del  0 al 4."
            ;;
    esac
done