from flask import request, redirect, jsonify


def handle_register():
    #cambiar para que matchee con la bsae de datos
    if request.method == "POST":
        email = request.form["email"]
        username = request.form["username"]
        password = request.form["password"]
        #agregar funcion de registro y auth
        #devolver success o fallo a frontend
        #dejo asi para testear supongo
        if username == "testuser" and password == "testpass" and email == "testemail":
            return jsonify({"message": "Registration successful"}), 200
        else:
            return jsonify({"error": "Invalid credentials"}), 401
        #si esta mal volver a registro con mensaje de error
