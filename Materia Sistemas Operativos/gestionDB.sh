#!/bin/bash

#Config de acceso
usuarioDB="root"
passDB="catalystdigital05" 
nombreDB="reddeoficios" 
host="127.0.0.1"
puerto="3307"

ejecutar_sql() {
    local consultaSql="$1" #$1 recibe como parametro a la variable siguiente a la llamada del metodo(ej: $select o $insert)
    
    mysql -u "$usuarioDB" -p"$passDB" -h "$host" -P "$puerto" "$nombreDB" -BNe "$consultaSql" 2>&1 #hace la conexion a la bd -BNe (ejecuta, saca numeros de columnas y lo muestra con tabulaciones)
    
    if [ $? -eq 0 ]; then #$? almacena el ultimo proceso, si da 0 es exitoso sino hubo error
        echo "Sentencia ejecutada con exito."
    else
        echo "Error al ejecutar, verifique sintaxis y permisos."
    fi
}


opcion=""
while [ "$opcion" != "0" ]; do
    echo "Gestion de base de datos (dml)"
    echo "1 - Consultar Datos (SELECT)"
    echo "2 - Insertar Datos (INSERT)"
    echo "3 - Modificar Datos (UPDATE)"
    echo "4 - Eliminar Datos (DELETE)"
    echo "5 - Ver tablas"
    echo "0 - Salir"
    echo ""
    read -p "Seleccione una opcion: " opcion

    case $opcion in
        1)
            read -p "Ingrese SELECT COMPLETO (ej: SELECT nombre, correo FROM usuarios WHERE id > 10): " select
            if [[ -n "$select" ]]; then
                ejecutar_sql "$select"
            fi
            ;;
            
        2)
            read -p "Ingrese INSERT COMPLETO (ej: INSERT INTO usuarios (correo, nombre) VALUES ('joel@gmail.com', 'Joel') ): " insert
            if [[ -n "$insert" ]]; then
                ejecutar_sql "$insert"
            fi
            ;;
            
        3)
            read -p "Ingrese UPDATE COMPLETO (ej: UPDATE usuarios SET nombre='kevin' WHERE id = 7): " update
            if [[ -n "$update" ]]; then
                ejecutar_sql "$update"
            fi
            ;;
            
        4)
            echo "[ADVERTENCIA] si usa DELETE sin una condicion WHERE borrara toda la tabla"
            read -p "Ingrese DELETE COMPLETO (ej: DELETE FROM usuarios WHERE id=7): " delete
            if [[ -n "$delete" ]]; then
                ejecutar_sql "$delete"
            fi
            ;;
	 5)
	     echo ""
            echo "[TABLAS]"
	     echo ""
            tablas="show tables"
            ejecutar_sql "$tablas"
	     echo ""
	     echo ""
            ;;

            
        0)
            echo "Saliendo..."
            ;;

        *)
            echo "Opcion invalida, seleccione una opcion 0-4."
            ;;
    esac
done