import os
import boto3
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "change-me")
    SQLALCHEMY_DATABASE_URI = ("postgresql://dbmaster:password@ingsoft2.cj06eqq0ykhj.us-east-2.rds.amazonaws.com:5432/IngSotf2_db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False


    COGNITO_USER_POOL_ID = "us-east-2_EDRSvCODn"
    COGNITO_CLIENT_ID = "9m5l8uln4o6jpm1q7eg3mvl6"
    COGNITO_REGION = "us-east-2"
    COGNITO_CLIENT_SECRET = "1o0h1u8m8i0le4pkd3u6298a8e1aumkmq4qstuo9mjr54ck48qls"


    COGNITO_CLIENT = boto3.client("cognito-idp", region_name=COGNITO_REGION)


'postgresql://dbmaster:password@ingsoft2.cj06eqq0ykhj.us-east-2.rds.amazonaws.com:5432/IngSoft2_db'