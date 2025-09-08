from flask import jsonify, render_template, redirect, url_for, request


def handle_login():
    #cambiar para que matchee con la bsae de datos
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        #agregar funcion de login y auth
        #revolver success o fallo a frontend
        #dejo asi para testear supongo
        if username == "testuser" and password == "testpass":
            return jsonify({"message": "Login successful"}), 200
        else:
            return jsonify({"error": "Invalid credentials"}), 401
        #si esta mal volver a login con mensaje de error
