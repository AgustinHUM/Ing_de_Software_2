# Ing_de_Software_2

FLUJO DE TRABAJO 

Se crea una nueva rama para mis propios cambios para no sobreescribir los cambios de otra persona con el 
siguiente comando:

git checkout -b nombre-de-la-nueva-rama //en la terminal

Para agregar cambios usamos el comando:

git add .

Cuando queremos hacer un commit usamos el comando:

git commit -m "descripcion del commit"

Cuando queremos hacer públicos nuestros cambios locales que hicimos en nuestra rama, hacemos push utilizando el comando:

git push origin nombre_de_nuestra_rama //"subimos" nuestra rama personal al repositorio general

Ahora, toca agregar tus cambios a la rama principal (main). Para ello, primero debemos obtener la última versión del repositorio con los siguientes comandos:

git checkout main //cambia la rama en donde estamos trabajando a la del main
git pull origin main //traemos las cosas de la rama main (posibles nuevos cambios de otra persona)
git checkout nombre-de-la-nueva-rama //volvemos a nuestra rama personal
git merge main //fusionamos los cambios de nuestra rama con la principal

Ahora nuestra rama está actualizada con los últimos cambios del repositorio

Para actualizar la rama main

git checkout main
git merge mi-rama-feature // se puede resolver atraves de github
git push origin main



