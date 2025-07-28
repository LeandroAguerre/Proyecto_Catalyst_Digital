#!/bin/bash

#Guardar script en /usr/local/sbin/
#Darle permisos de ejecucion

# 1. Configurar bloqueo tras 3 intentos fallidos
AUTH_FILE="/etc/pam.d/common-auth"
if ! grep -q "pam_faillock" "$AUTH_FILE"; then
  sed -i '1iauth required pam_faillock.so preauth silent deny=3 unlock_time=300' "$AUTH_FILE"
  echo "auth [default=die] pam_faillock.so authfail deny=3 unlock_time=300" >> "$AUTH_FILE"
  echo "Bloqueo por 3 intentos fallidos configurado."
else
  echo "[YA CONFIGURADO] Bloqueo de cuenta ya estaba configurado."
fi

# 2. Configurar expiración global de contraseñas en login.defs
DEF_FILE="/etc/login.defs"
if grep -q "^PASS_MAX_DAYS" "$DEF_FILE"; then
  sed -i 's/^PASS_MAX_DAYS.*/PASS_MAX_DAYS   90/' "$DEF_FILE"
else
  echo "PASS_MAX_DAYS   90" >> "$DEF_FILE"
fi

getent passwd | awk -F: '$3 >= 1000 && $1 != "nobody" { print $1 }' | while read -r user; do
  chage -M 90 "$user"
  echo "Expiración aplicada a $user" 
done