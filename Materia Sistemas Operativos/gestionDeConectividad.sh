#!/bin/bash

while [ "$opcion" != "0" ]; do
    echo ""
    echo "GESTION DE CONECTIVIDAD"
    echo "1 - Ver IP del servidor local"
    echo "2 - Testear conectividad"
    echo "3 - Conectar sitio remoto"
    echo "4 - Consultar DNS"
    echo "0 - Salir"

    read -p "Seleccione una opcion: " opcion

    case $opcion in
        1)
            echo "La direccion IP del servidor local es: "
            #Pide la direcciones ip solo de red (a) y buscar las inet
            ip a | grep 'inet'
            ;;
        2)
            read -p "Ingrese el host o IP a testear (ej: www.google.com) " hostPing
            #Hace 4 ping al host
            ping -c 4 "$hostPing"
            ;;
        3)
            read -p "Ingrese la URL completa a conectar (ej: https://www.google.com) " curlUrl

            #Se muestra el contenido de la pagina pero solos los encabezados -I y sin nada extra -s
            curl -s "$curlUrl"
            ;;
        4)
            read -p "Ingrese el dominio a consultar (ej: https://www.google.com) " hostDig

            #Consulta la ip del dominio y lo muestra de forma reducida gracias a short
            dig "$hostDig" +short
            ;;
        0)
            echo "Saliendo..."
            ;;
        *)
            echo "Opcion invalida. Intente de nuevo."
            ;;
    esac
done