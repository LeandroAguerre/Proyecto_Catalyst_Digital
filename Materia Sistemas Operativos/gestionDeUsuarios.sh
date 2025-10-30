#!/bin/bash

logBackups="/var/log/backups.log"
LOG="/var/log/cuentas.log"
LogErrores="/var/log/errores.log"
regex='^[a-z_][a-z0-9_-]*[$]?$' 
ArchivoDeControl="/etc/configSeguridadAplicada.flag"
AuthArchivo="/etc/pam.d/common-auth" 
DefArchivo="/etc/login.defs"
MaxFallos=3          
TiempoBloqueo=120
MaxDias=90 

#Config de permisos de cron
chown root:administradores /etc/cron.allow
chmod 770 /etc/cron.allow

#Configuracion de intentos fallidos y expiracion de contraseña
if [[ ! -f "$ArchivoDeControl" ]]; then
     
  echo "Aplicando configuracion basica de seguridad..."

  #Regla preauth
  sed -i "1iauth required pam_faillock.so preauth silent deny=$MaxFallos unlock_time=$TiempoBloqueo" "$AuthArchivo"

  #Regla authfail
  sed -i "/@include common-auth/iauth [default=die] pam_faillock.so authfail deny=$MaxFallos unlock_time=$TiempoBloqueo" "$AuthArchivo"

  #Configurar la politica global para nuevas cuentas
  sed -i "s/^PASS_MAX_DAYS.*/PASS_MAX_DAYS \t $MaxDias/" "$DefArchivo" 

  #Aplicar la politica a todos los usuarios existentes
  getent passwd | awk -F: '$3 >= 1000 && $1 != "nobody" { print $1 }' | while read -r user; do
      
      chage -M $MaxDias "$user"
  done

      touch "$ArchivoDeControl"
      echo "Configuracion aplicada"
fi

#Crea el grupo admin si no existe
if ! getent group administradores &>/dev/null; then
    echo "Grupo 'administradores' no existe, creandolo..."
    groupadd administradores
fi

if ! getent group backup &>/dev/null; then
    groupadd backup
fi

#Crea archivo sudoers para el grupo administradores si no existe
if [ ! -f /etc/sudoers.d/administradores ]; then
  echo "%administradores ALL=(ALL) ALL" > /etc/sudoers.d/administradores
  chmod 440 /etc/sudoers.d/administradores
  chown root:administradores /etc/sudoers.d/administradores
  echo "[PERMISOS] Grupo 'administradores' agregado a sudoers - $(date '+%Y-%m-%d %H:%M:%S')" >> "$LogErrores"
fi

#Verifica si existe el archivo de cuentas.log, si no existe, lo crea y configura permisos.
if [ ! -f "$LOG" ]; then
  touch "$LOG"
  chmod 770 "$LOG"
  chown root:administradores "$LOG"
  echo "[PERMISOS] Permisos dados a cuentas.log - $(date '+%Y-%m-%d %H:%M:%S')" >> "$LogErrores"
fi 

#Verifica si existe el archivo de errores.log, si no existe, lo crea y configura permisos.
if [ ! -f "$LogErrores" ]; then
  touch "$LogErrores"
  chmod 770 "$LogErrores"
  chown root:administradores "$LogErrores"
  echo "[PERMISOS] Permisos dados a errores.log - $(date '+%Y-%m-%d %H:%M:%S')" >> "$LogErrores"
fi 

#Verifica si el login del usuario root esta deshabilitado completamente
if passwd -S root | grep -q 'L' && grep -q '^root:.*:/usr/sbin/nologin' /etc/passwd && grep -q '^PermitRootLogin no' /etc/ssh/sshd_config; then
  rootOff=1
else
  rootOff=0
fi

#Define la ruta para los skel personalizados y los nombres de las carpetas a verificar o crear
rutaBase="/etc/skel"
carpetas=("adminweb" "desarrollador" "srvweb" "mysql" "backup")
for carpeta in "${carpetas[@]}"; do
  rutaCompleta="$rutaBase/$carpeta"
  if [ ! -d "$rutaCompleta" ]; then
    mkdir -p "$rutaCompleta"
    chown root:administradores "$rutaCompleta"
    echo "[CREACION] Se crearon carpetas de skel - $(date '+%Y-%m-%d %H:%M:%S')" >> "$LogErrores"
  fi
done

#Revisa y corrige permisos de directorios y archivos dentro de las carpetas skel
for carpeta in "${carpetas[@]}"; do
  rutaCompleta="$rutaBase/$carpeta"

  #Si encuentra directorios con permisos distintos de 755, los corrige
  if find "$rutaCompleta" -type d ! -perm 770 | grep -q .; then
    find "$rutaCompleta" -type d ! -perm 770 -exec chmod 770 {} \;
    echo "[PERMISOS] Se corrigieron permisos de directorios en '$carpeta' - $(date '+%Y-%m-%d %H:%M:%S')" >> "$LogErrores"
  fi

  #Si encuentra archivos con permisos distintos de 644, los corrige
  if find "$rutaCompleta" -type f ! -perm 770 | grep -q .; then
    find "$rutaCompleta" -type f ! -perm 770 -exec chmod 770 {} \;
    echo "[PERMISOS] Se corrigieron permisos de archivos en '$carpeta' - $(date '+%Y-%m-%d %H:%M:%S')" >> "$LogErrores"
  fi
done

while [ "$opcion" != "0" ]; do

  echo ""
  echo "1 - Crear usuario"
  echo "2 - Eliminar usuario"
  echo "3 - Lista de usuarios"
  echo "4 - Consultar usuario"
  echo "5 - Desactivar login root"
  echo "6 - Ver logs"
  echo "0 - Salir"
  echo ""
  read -p "Seleccione una opcion: " opcion

  case $opcion in
    1)
      #Solicita tipo de usuario y asigna skel y grupo correspondientes
      read -p "Ingrese tipo de usuario a crear (1- administrador , 2- desarrollador , 3- srvweb , 4- mysql , 5- backup): " tipo
      case $tipo in
        1)
          skel="/etc/skel/administrador"
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
          #Opcion invalida, se marca como novalido y se omite el codigo de creacion del usuario
          echo ""
          echo "Tipo de usuario no valido."
          tipo="novalido"
          echo "[ERROR] Se ingreso un tipo de usuario no valido - $(date '+%Y-%m-%d %H:%M:%S')" >> "$LogErrores"
          echo ""
          continue
          ;;
      esac

      if [[ "$tipo" != "novalido" ]]; then
        
        read -p "Ingrese nombre de usuario [a-z-0-9]: " user
        if [[ -n "$user" && "$user" =~ $regex ]]; then
          #Verifica si el usuario ya existe
          if id "$user" &>/dev/null; then
            echo "El usuario '$user' ya existe."
            echo "[ERROR] El usuario '$user' ya fue creado - $(date '+%d-%m-%Y / %H:%M:%S')" >> "$LogErrores"
          else
            #Crea el grupo si no existe
            if ! getent group "$grupo" &>/dev/null; then
              echo " Grupo '$grupo' no existe, creandolo..."
              groupadd "$grupo"
            fi
            #Crea el usuario con el skel y grupo asignado
            useradd -m -k "$skel" -g "$grupo" "$user"
	          chown -R "$user":administradores /home/"$user"
	          chmod 770 /home/"$user"
            echo " Usuario '$user' creado y asignado al grupo '$grupo'."
            echo "[CREADO] El usuario '$user' fue creado - $(date '+%d-%m-%Y / %H:%M:%S')" >> "$LOG"
            passwd "$user"
            #Establece vencimiento de contraseñaa a 90 dias
            chage -M 90 "$user"
            #Si se crea un administrador y root aun no esta deshabilitado, muestra recordatorio
            if [[ "$grupo" == "administradores" && "$rootOff" -eq 0 ]]; then
              echo ""
              echo "[RECORDATORIO] Desactivar login root en la opcion 5"
            fi

            if [[ "$grupo" == "srveb" ]]; then

                chown -R "$user":backup /home/"$user"
                chown -R "$user":desarrolladores /home/"$user"
                usermod -aG docker "$user"
            fi

            if [[ "$grupo" == "backup" ]]; then

                chown -R "$user":backup /home/"$user"


                if ! grep -q "^$user$" /etc/cron.allow 2>/dev/null; then
                     
                  sh -c "echo '$user' >> /etc/cron.allow"
                fi

            fi

            if [[ "$grupo" == "administradores" ]]; then

              if ! grep -q "^$user$" /etc/cron.allow 2>/dev/null; then
                    
                  sh -c "echo '$user' >> /etc/cron.allow"
              fi
              usermod -aG docker "$user"

            fi

            if [[ "$grupo" == "desarrolladores" ]]; then

              usermod -aG docker "$user"

            fi


          fi
        else
          echo "El nombre de usuario es invalido"  
          echo "[ERROR] El nombre usuario no es valido - $(date '+%d-%m-%Y / %H:%M:%S')" >> "$LogErrores"
        fi  
      fi
      ;;

    2)
      #Elimina un usuario
      read -p "Ingrese el nombre de usuario a eliminar: " user
      if id "$user" &>/dev/null && [[ "$user" =~ $regex ]]; then
        userdel -r "$user"
        echo " Usuario '$user' eliminado."
	      echo "[ELIMINADO] El usuario '$user' fue eliminado - $(date '+%d-%m-%Y / %H:%M:%S')" >> "$LOG"
      else
        echo " El usuario '$user' no existe."
        echo "[ERROR] Se intento eliminar el usuario '$user' pero no existe - $(date '+%d-%m-%Y / %H:%M:%S')" >> "$LogErrores"
      fi
      ;;

    3)
      #Lista todos los usuarios mostrando el primer campo del archivo /etc/passwd
      echo " Lista de usuarios:"
      cut -d: -f1 /etc/passwd
      ;;

    4)
      #Muestra si existe informacion del usuario 
      read -p "Ingrese nombre de usuario a consultar: " user
      if id "$user" &>/dev/null && [[ "$user" =~ $regex ]]; then
        echo " Informacion del usuario '$user':"
        id "$user"
        groups "$user"
        echo "[CONSULTA] Se mostro informacion del usuario '$user' - $(date '+%d-%m-%Y / %H:%M:%S')" >> "$LogErrores"
      else
        echo " El usuario '$user' no existe."
        echo "[ERROR] Se intento consultar sobre el usuario '$user' pero no existe - $(date '+%d-%m-%Y / %H:%M:%S')" >> "$LogErrores"
      fi
      ;;

    5)
      #Busca si hay al menos un usuario que su grupo primario sea administradores
      idAdmin=$(getent group administradores | cut -d: -f3)
      userAdmin=$(awk -F: -v gid="$idAdmin" '$4 == gid { print $1 }' /etc/passwd)

      echo "[RECORDATORIO] Recuerda tener un usuario aministrador antes de usar esta opcion."
      read -p "Desea desactivar el login root? si/no " loginOpcion
      if [[ "$loginOpcion" == "si" ]]; then 
        if [[ -n "$userAdmin" ]]; then
          #Deshabilita login SSH, shell y contraseña del usuario root
          sed -i 's/^#*PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
          systemctl restart sshd
          passwd -l root
          usermod -s /usr/sbin/nologin root
          echo "Usuario root desactivado completamente"
          echo "[DESACTIVADO] Usuario root - $(date '+%Y-%m-%d %H:%M:%S')" >> "$LOG"
          rootOff=1
        else
          echo "" 
          echo "[RECORDATORIO] Recuerda tener un usuario aministrador antes de usar esta opcion."
          echo "[ERROR] Se intento desactivar al usuario root sin un administrador - $(date '+%Y-%m-%d %H:%M:%S')" >> "$LogErrores"
        fi  
      else
        echo "Opcion incorrecta."
      fi
      ;;
    6)
      echo "A que archivo desea acceder?"
      echo "1- Alta y baja de cuentas de usuario"
      echo "2- Errores y modificaciones importantes"
      echo "3- Logs de backup"
      echo "0- Salir"
      read -p "Elija una opcion: " opcionLog

      case $opcionLog in
        1)
          cat "$LOG"
          echo "[ADVERTENCIA] Se ingreso al archivo cuentas.log - $(date '+%Y-%m-%d %H:%M:%S')" >> "$LogErrores"
          ;;
        2)
          cat "$LogErrores"
          echo "[ADVERTENCIA] Se ingreso al archivo errores.log - $(date '+%Y-%m-%d %H:%M:%S')" >> "$LogErrores"
          ;;
        3)
          cat "$logBackups"
          echo "[ADVERTENCIA] Se ingreso al archivo backup.log - $(date '+%Y-%m-%d %H:%M:%S')" >> "$LogErrores"
          ;;
        0) 
          echo "Saliendo.."
          ;;
        *)
          echo ""
          echo "[ERROR] Se ingreso una opcion no valida en ver logs - $(date '+%Y-%m-%d %H:%M:%S')" >> "$LogErrores"
          echo ""
          continue
          ;;
      esac
      ;;   
    0)
      echo " Saliendo..."
      echo "[CIERRE] Se cerro el programa - $(date '+%Y-%m-%d %H:%M:%S')" >> "$LogErrores"
      ;;

    *)
      echo " Opcion incorrecta."
      echo "[ERROR] Se puso una opcion incorrecta en las opciones del menu principal - $(date '+%Y-%m-%d %H:%M:%S')" >> "$LogErrores"
      ;;
  esac
done
