from flask import render_template, redirect, url_for, request


def handle_login():
    #cambiar para que matchee con la bsae de datos
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        #agregar funcion de login
        #redirect a main si se valida bien
        #dejo asi para testear supongo
        return redirect(url_for('pantalla_principal_bp.pantalla_principal'))
        #si esta mal volver a login con mensaje de error
