#!/bin/bash


while [ "$opcion" != "0" ]; do

  echo "1 - Crear usuario"
  echo "2 - Eliminar usuario"
  echo "3 - Modificar usuario"
  echo "4 - Lista de usuarios"
  echo "5 - Consultar usuario"
  echo "0 - Salir"
  echo ""
  read -p "Seleccione una opción: " opcion

  case $opcion in
    1)
      read -p "Ingrese nombre de usuario: " user
      if id "$user" &>/dev/null; then
        echo "El usuario '$user' ya existe."
      else
        read -p "Ingrese grupo al que asignar al usuario (se creara si no existe): " grupo
        if ! getent group "$grupo" &>/dev/null; then
          echo " Grupo '$grupo' no existe, creandolo..."
          groupadd "$grupo"
        fi
        useradd -m -g "$grupo" "$user"
        echo " Usuario '$user' creado y asignado al grupo '$grupo'."
        passwd "$user"
      fi
      ;;

    2)
      read -p "Ingrese el nombre de usuario a eliminar: " user
      if id "$user" &>/dev/null; then
        userdel -r "$user"
        echo " Usuario '$user' eliminado."
      else
        echo " El usuario '$user' no existe."
      fi
      ;;

    3)
      read -p "Ingrese nombre de usuario a modificar: " user
      if id "$user" &>/dev/null; then
        read -p "Ingrese grupo al que desea agregar al usuario: " grupo
        if ! getent group "$grupo" &>/dev/null; then
          echo " Grupo '$grupo' no existe. Creandolo..."
          groupadd "$grupo"
        fi
        usermod -aG "$grupo" "$user"
        echo " Usuario '$user' agregado al grupo '$grupo'."
      else
        echo " El usuario '$user' no existe."
      fi
      ;;

    4)
      echo " Lista de usuarios:"
      cut -d: -f1 /etc/passwd
      ;;

    5)
      read -p "Ingrese nombre de usuario a consultar: " user
      if id "$user" &>/dev/null; then
        echo " Información del usuario '$user':"
        id "$user"
        groups "$user"
      else
        echo " El usuario '$user' no existe."
      fi
      ;;

    0)
      echo " Saliendo..."
      ;;

    *)
      echo " Opcion incorrecta."
      ;;
  esac
done

