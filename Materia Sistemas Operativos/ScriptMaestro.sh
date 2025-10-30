#!/bin/bash

while [ "$opcion" != "0" ]; do
    
    echo ""
    echo "MENU DE GESTION DE SCRIPTS"
    echo "1. Gestion de usuarios"
    echo "2. Gestion de servicios"
    echo "3. Monitoreo de recursos"
    echo "4. Gestion de base de datos"
    echo "5. Gestion de conectividad"
    echo "6. Monitoreo de acceso"
    echo "7. Respaldos manuales"
    echo "0. Salir"

    read -p "Selecciona una opcion: " opcion

    case $opcion in
        1)
            /home/administrador/scripts/gestionDeUsuarios.sh
            ;;
        2)
            /home/administrador/scripts/gestionDeServicios.sh
            ;;
        3)
            /home/administrador/scripts/monitor_de_recursos.sh
            ;;
        4)
            /home/administrador/scripts/gestionBaseDeDatos.sh
            ;;   
        5)
            /home/administrador/scripts/gestionDeConectividad.sh
            ;;
        6)
            /home/administrador/scripts/monitoreoDeAcceso.sh
            ;;
        7)
            /home/administrador/scripts/respaldosManuales.sh
	     ;;
        0)
            echo "Saliendo..."
            ;;
        *)
            echo "Opcian invalida. Por favor, selecciona un numero del  0 al 7."
            ;;
    esac
done