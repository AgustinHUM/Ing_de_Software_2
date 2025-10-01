from datetime import datetime
from ..db import db
from sqlalchemy.orm import relationship
from sqlalchemy import DateTime
from sqlalchemy.dialects.postgresql import JSON


grupos_de_usuario = db.Table("USUARIO_GRUPO",
                            db.Column("mail_usuario", db.String(128), db.ForeignKey("USUARIO.mail"), primary_key=True),
                            db.Column("id_grupo", db.Integer, db.ForeignKey("GRUPO.id_grupo"), primary_key=True))

usuario_plataforma = db.Table("USUARIO_PLATAFORMA", 
                            db.Column("mail_usuario", db.String(128), db.ForeignKey("USUARIO.mail"), primary_key=True),
                            db.Column("id_plataforma", db.Integer, db.ForeignKey("PLATAFORMA.id_plataforma"), primary_key=True))

pelis_favoritas = db.Table("PELICULAS_FAVORITAS",
                            db.Column("mail_usuario", db.String(128), db.ForeignKey("USUARIO.mail"), primary_key=True),
                            db.Column("id_pelicula", db.Integer, db.ForeignKey("PELICULA.id_pelicula"), primary_key=True))

genero_pelicula = db.Table("GENERO_PELICULA",
                            db.Column("id_pelicula", db.Integer, db.ForeignKey("PELICULA.id_pelicula"), primary_key=True),
                            db.Column("id_genero", db.Integer, db.ForeignKey("GENERO.id_genero"), primary_key=True))

genero_favorito = db.Table("GENERO_FAVORITO",
                            db.Column("id_genero", db.Integer, db.ForeignKey("GENERO.id_genero"), primary_key=True),
                            db.Column("mail_usuario", db.String(128), db.ForeignKey("USUARIO.mail"), primary_key=True))

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

    mail = db.Column(db.String(128), db.ForeignKey("CUENTA.mail"), primary_key=True)
    id_icono = db.Column(db.Integer, nullable=True)
    formulario_pendiente = db.Column(db.Boolean, default=False, nullable=False)
    #Verificar el backpopulates
    grupos = db.relationship("Grupo", secondary=grupos_de_usuario, back_populates="usuarios")

    #UUsuario pertenece a un pais
    id_pais = db.Column(db.Integer, db.ForeignKey("PAIS.id_pais"))
    pais = db.relationship("Pais", back_populates="usuario_del_pais")

    #Usuario paga plataforma
    plataformas = db.relationship("Plataforma", secondary=usuario_plataforma, back_populates="usuarios_plat")

    #Usuario vio pelis
    pelis_vistas = db.relationship("UsuarioVioPeli", back_populates="usuario")

    #Favoritas de usuario
    favoritas = db.relationship("Pelicula", secondary=pelis_favoritas, back_populates="fav_usuario")

    generos_fav = db.relationship("Genero", secondary=genero_favorito, back_populates="usuarios")

    #Disyuncion del MER
    __mapper_args__ = {"polymorphic_identity": "usuario"}

    def __repr__(self):
        return f"Usuario: {self.nombre_cuenta}\nMail: {self.mail}"


class Admin(Cuenta):
    __tablename__ = "ADMIN"

    mail = db.Column(db.String(120), db.ForeignKey("CUENTA.mail"), primary_key=True)

    # Admin que creó este admin
    mail_creador = db.Column(db.String(120), db.ForeignKey("ADMIN.mail"), nullable=True)
    # Admin que eliminó este admin
    eliminado_por_mail = db.Column(db.String(120), db.ForeignKey("ADMIN.mail"), nullable=True)
    
    creador = db.relationship(
        "Admin",
        remote_side=[mail],
        backref=db.backref("creado", uselist=False),
        foreign_keys=[mail_creador]
    )

    # Admin que eliminó este admin
    eliminado_por = db.relationship(
        "Admin",
        remote_side=[mail],
        back_populates="eliminados",
        foreign_keys=[eliminado_por_mail]
    )

    # Admins eliminados por este admin
    eliminados = db.relationship(
        "Admin",
        back_populates="eliminado_por",
        foreign_keys=[eliminado_por_mail]
    )

    esta_eliminado = db.Column(db.Boolean, default=False)

    __mapper_args__ = {"polymorphic_identity": "admin"}

    def __repr__(self):
        return f"Admin: {self.nombre_cuenta}\nMail: {self.mail}"
    

    
class Grupo(db.Model):
    __tablename__ = "GRUPO"

    id_grupo = db.Column(db.Integer, primary_key=True)
    nombre_grupo = db.Column(db.String(128), nullable=False)

    usuarios = db.relationship("Usuario", secondary=grupos_de_usuario, back_populates="grupos")


class Pais(db.Model):
    __tablename__ = "PAIS"

    id_pais = db.Column(db.Integer, primary_key=True)
    nombre_pais = db.Column(db.String(128), unique=True, nullable=False)
    codigo_pais = db.Column(db.String(128), unique=True, nullable=False)
    url_bandera = db.Column(db.String(128), nullable=False)

    usuario_del_pais = db.relationship("Usuario", back_populates="pais", cascade="all, delete-orphan")

    pelis_plataformas = db.relationship("PeliculaPlataformaPais", back_populates="pais")

class Plataforma(db.Model):
    __tablename__ = "PLATAFORMA"

    id_plataforma = db.Column(db.Integer, primary_key=True)
    nombre_plataforma = db.Column(db.String(128), unique=True, nullable=False)
    url_logo = db.Column(db.String(128), nullable=False)

    usuarios_plat = db.relationship("Usuario", secondary=usuario_plataforma, back_populates="plataformas")

    pelis_paises = db.relationship("PeliculaPlataformaPais", back_populates="plataforma")



class Pelicula(db.Model):
    __tablename__ = "PELICULA"

    id_pelicula = db.Column(db.Integer, primary_key=True)
    trama = db.Column(db.String(1024), nullable=False)
    anio_lanzamiento = db.Column(db.Integer, nullable=False)
    titulo = db.Column(db.String(128), nullable=False)
    duracion = db.Column(db.Integer, nullable=False)
    clasificacion_edad = db.Column(db.String(128), nullable=False)
    url_poster = db.Column(db.String(128), nullable=False)
    score_critica = db.Column(db.Float, nullable=True)
    score_usuarios = db.Column(db.Float, nullable=False, default=0.0)
    popularidad_percentil = db.Column(db.Float, nullable=False, default=0.0)
    directores = db.Column(db.String(128), nullable=False)


    plataformas_paises = db.relationship("PeliculaPlataformaPais", back_populates="pelicula")

    vista_usuarios = db.relationship("UsuarioVioPeli", back_populates="pelicula")

    fav_usuario = db.relationship("Usuario", secondary=pelis_favoritas, back_populates="favoritas")

    generos = db.relationship("Genero", secondary=genero_pelicula, back_populates="pelis_genero")


class PeliculaCompleta(db.Model):
    __tablename__ = "MV_PELICULAS_COMPLETA"

    id_pelicula = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String)
    trama = db.Column(db.String)
    anio_lanzamiento = db.Column(db.Integer)
    directores = directores = db.Column(db.String(128), nullable=False)
    duracion = db.Column(db.Integer)
    clasificacion_edad = db.Column(db.String)
    url_poster = db.Column(db.String)
    score_critica = db.Column(db.Float, nullable=True)
    score_usuarios = db.Column(db.Float, nullable=False, default=0.0)
    popularidad_percentil = db.Column(db.Float, nullable=False, default=0.0)
    generos = db.Column(JSON)
    plataformas = db.Column(JSON)

    def __repr__(self):
        return f"<PeliculaCompleta {self.titulo}>"


class Genero(db.Model):
    __tablename__ = "GENERO"

    id_genero = db.Column(db.Integer, primary_key=True)
    nombre_genero = db.Column(db.String(128), nullable=False)

    pelis_genero = db.relationship("Pelicula", secondary=genero_pelicula, back_populates="generos")

    usuarios = db.relationship("Usuario", secondary=genero_favorito, back_populates="generos_fav")


class PeliculaPaisPlataforma(db.Model):
    __tablename__ = "PELICULA_PLATAFORMA_PAIS"

    id_plataforma = db.Column(db.Integer, db.ForeignKey("PLATAFORMA.id_plataforma"), primary_key=True)
    id_pelicula = db.Column(db.Integer, db.ForeignKey("PELICULA.id_pelicula"), primary_key=True)
    id_pais = db.Column(db.Integer, db.ForeignKey("PAIS.id_pais"), primary_key=True)

    plataforma = db.relationship("Plataforma", back_populates="pelis_paises")
    pelicula = db.relationship("Pelicula", back_populates="plataformas_paises")
    pais = db.relationship("Pais", back_populates="pelis_plataformas")


class UsuarioVioPeli(db.Model):
    __tablename__ = "USUARIO_VIO_PELI"

    mail_usuario = db.Column(db.String(128), db.ForeignKey("USUARIO.mail"), primary_key=True)
    id_pelicula = db.Column(db.Integer, db.ForeignKey("PELICULA.id_pelicula"), primary_key=True)

    # Campo extra: rating personal del usuario
    rating = db.Column(db.Float, nullable=True)

    # Relaciones bidireccionales
    usuario = db.relationship("Usuario", back_populates="pelis_vistas")
    pelicula = db.relationship("Pelicula", back_populates="vista_usuarios")