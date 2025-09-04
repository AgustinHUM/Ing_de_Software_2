from datetime import datetime
from ..db import db

grupos_de_usuario = db.Table("USUARIO_GRUPO",
                            db.Column("mail_usuario", db.String(128), db.ForeignKey("USUARIO.mail"), primary_key=True),
                            db.Column("id_grupo", db.Integer, db.ForeignKey("GRUPO.id_grupo"), primary_key=True))

class Cuenta(db.Model):
    __tablename__ = "CUENTA"

    mail = db.Column(db.String(120), primary_key=True)
    nombre_cuenta = db.Column(db.String(128), nullable=False)
    contrasenia = db.Column(db.String(256), nullable = False)
    type = db.Column(db.String(128))

    __mapper_args__ = {
        "polymorphic_identity": "account",
        "polymorphic_on": type
    }

class Usuario(Cuenta):
    __tablename__= "USUARIO"

    mail = db.Column(db.String(120), db.ForeignKey("CUENTA.mail"), primary_key=True)
    #Verificar el backpopulates
    grupos = db.relationship("Grupo", secondary=grupos_de_usuario, back_populates="USUARIO")

    __mapper_args__ = {"polymorphic_identity": "usuario"}

    def __repr__(self):
        return f"Usuario: {self.nombre_cuenta}\nMail: {self.mail}"

class Admin(Cuenta):
    __tablename__= "ADMIN"

    mail = db.Column(db.String(120), db.ForeignKey("CUENTA.mail"), primary_key=True)

    __mapper_args__ = {"polymorfic_identity": "admin"}

    def __repr__(self):
        return f"Admin: {self.nombre_cuenta}\nMail: {self.mail}"
    



    
class Grupo(db.Model):
    __tablename__ = "GRUPO"

    id_grupo = db.Column(db.Integer, primery_key=True)
    nombre_grupo = db.Column(db.String(128), nullable=False)

    usuarios = db.relationship("Usuario", secondary=grupos_de_usuario, back_populates="GRUPO")


