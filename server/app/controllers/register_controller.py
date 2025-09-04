from flask import request, redirect, url_for

def handle_register():
    #cambiar para que matchee con la bsae de datos
    if request.method == "POST":
        email = request.form["email"]
        username = request.form["username"]
        password = request.form["password"]
        #agregar funcion de registro
        #redirect a main si son validos los datos
        #dejo asi para testear supongo
        return redirect(url_for('pantalla_principal_bp.pantalla_principal'))
        #si esta mal volver a registro con mensaje de error
