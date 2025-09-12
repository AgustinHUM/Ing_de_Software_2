import os
import boto3
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "change-me")
    SQLALCHEMY_DATABASE_URI = ("postgresql://dbmaster:password@ingsoft2.cj06eqq0ykhj.us-east-2.rds.amazonaws.com:5432/IngSotf2_db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False


    COGNITO_USER_POOL_ID = "us-east-2_LvFG8XSkK"
    COGNITO_CLIENT_ID = "4fnv0tpv5p871lr5e4nf031q78"
    COGNITO_REGION = "us-east-2"
    COGNITO_CLIENT_SECRET = "1mprtv9hbl1b71oqmigmje4pks3e3cd8qvi4h7um4nodjq9rrdht"


    COGNITO_CLIENT = boto3.client("cognito-idp", region_name=COGNITO_REGION)


'postgresql://dbmaster:password@ingsoft2.cj06eqq0ykhj.us-east-2.rds.amazonaws.com:5432/IngSoft2_db'