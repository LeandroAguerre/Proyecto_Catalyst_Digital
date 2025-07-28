#!/bin/bash

LOG="/var/log/cuentas.log"

if [ ! -f "$LOG" ]; then
  sudo touch "$LOG"
  sudo chmod 644 "$LOG"
  sudo chown root:root "$LOG"
fi 

if passwd -S root | grep -q 'L' && grep -q '^root:.*:/usr/sbin/nologin' /etc/passwd && grep -q '^PermitRootLogin no' /etc/ssh/sshd_config; then
  rootOff=1
else
  rootOff=0
fi

rutaBase="/etc/skel"
carpetas=("adminweb" "desarrollador" "srvweb" "mysql" "backup")
for carpeta in "${carpetas[@]}"; do
  rutaCompleta="$rutaBase/$carpeta"
  if [ ! -d "$rutaCompleta" ]; then
    mkdir -p "$rutaCompleta"
  fi
done

if [ ! -f /etc/sudoers.d/administradores ]; then
  echo "%administradores ALL=(ALL) ALL" > /etc/sudoers.d/administradores
  chmod 440 /etc/sudoers.d/administradores
  chown root:root /etc/sudoers.d/administradores
  echo "[PERMISOS] Grupo 'administradores' agregado a sudoers - $(date '+%Y-%m-%d %H:%M:%S')" >> "$LOG"
fi

# Aplicar permisos seguros a los skel
for carpeta in "${carpetas[@]}"; do
  rutaCompleta="$rutaBase/$carpeta"
  find "$rutaCompleta" -type d -exec chmod 755 {} \;
  find "$rutaCompleta" -type f -exec chmod 644 {} \;
done

while [ "$opcion" != "0" ]; do

  echo ""
  echo "1 - Crear usuario"
  echo "2 - Eliminar usuario"
  echo "3 - Lista de usuarios"
  echo "4 - Consultar usuario"
  echo "0 - Salir"
  echo ""
  read -p "Seleccione una opcion: " opcion

  case $opcion in
    1)
      read -p "Ingrese tipo de usuario a crear (1- adminweb , 2- desarrollador , 3- srvweb , 4- mysql , 5- backup): " tipo
      case $tipo in
        1)
          skel="/etc/skel/adminweb"
          grupo="administradores"
          ;;
        2)
          skel="/etc/skel/desarrollador"
          grupo="desarrolladores"
          ;;
        3) 
          skel="/etc/skel/srvweb"
          grupo="srvweb"
          ;;
        4) 
          skel="/etc/skel/mysql"
          grupo="mysql"
          ;;  
        5)
          skel="/etc/skel/backup"
          grupo="backup"
          ;;
        *)
          echo ""
          echo "Tipo de usuario no valido."
          tipo="novalido"
          echo ""
          continue
          ;;
      esac

      if [[ "$tipo" != "novalido" ]]; then

        read -p "Ingrese nombre de usuario: " user
        if [ -n "$user" ]; then
          if id "$user" &>/dev/null; then
            echo "El usuario '$user' ya existe."
          else
            if ! getent group "$grupo" &>/dev/null; then
              echo " Grupo '$grupo' no existe, creandolo..."
              groupadd "$grupo"
            fi
            useradd -m -k "$skel" -g "$grupo" "$user"
            echo " Usuario '$user' creado y asignado al grupo '$grupo'."
            echo "[CREADO] El usuario '$user' fue creado - $(date '+%d-%m-%Y / %H:%M:%S')" >> "$LOG"
            passwd "$user"
            if [[ "$grupo" == "administradores" && "$rootOff" -eq 0 ]]; then
              echo ""
              echo "[RECORDATORIO] Desactivar login root en la opcion 5"
            fi  
          fi
        else
          echo "El nombre de usuario no puede estar vacio"  
        fi  
      fi
      ;;

    2)
      read -p "Ingrese el nombre de usuario a eliminar: " user
      if id "$user" &>/dev/null; then
        userdel -r "$user"
        echo " Usuario '$user' eliminado."
	      echo "[ELIMINADO] El usuario '$user' fue eliminado - $(date '+%d-%m-%Y / %H:%M:%S')" >> "$LOG"
      else
        echo " El usuario '$user' no existe."
      fi
      ;;

    3)
      echo " Lista de usuarios:"
      cut -d: -f1 /etc/passwd
      ;;

    4)
      read -p "Ingrese nombre de usuario a consultar: " user
      if id "$user" &>/dev/null; then
        echo " Informacion del usuario '$user':"
        id "$user"
        groups "$user"
      else
        echo " El usuario '$user' no existe."
      fi
      ;;

    5)
      userAdmin=$(getent group administradores | cut -d: -f4)
      echo "[RECORDATORIO] Recuerda tener un usuario aministrador antes de usar esta opcion."
      read -p "Desea desactivar el login root? si/no" loginOpcion
      if [[ "$loginOpcion" = "si" ]]; then 
        if [[ -n "$userAdmin" ]]; then
          sed -i 's/^#*PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
          systemctl restart sshd
          passwd -l root
          usermod -s /usr/sbin/nologin root
          echo "Usuario root desactivado completamente"
          echo "[DESACTIVADO] Usuario root - $(date '+%Y-%m-%d %H:%M:%S')" >> /var/log/cuentas.log
          rootOff=1
        else
          echo "" 
          echo "[RECORDATORIO] Recuerda tener un usuario aministrador antes de usar esta opcion."
        fi  
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

