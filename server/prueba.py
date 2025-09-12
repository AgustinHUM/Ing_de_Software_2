import requests

BASE_URL = "http://localhost:5000"  # Cambia según tu servidor
REGISTER_ENDPOINT = f"{BASE_URL}/register"
LOGIN_ENDPOINT = f"{BASE_URL}/login"

# Datos de prueba
test_user = {
    "email": "usuario_prueba@example.com",
    "username": "usuarioPrueba",
    "password": "Password123!"  # Cumple con la política de Cognito
}

def test_register():
    print("=== Probando registro ===")
    response = requests.post(REGISTER_ENDPOINT, json=test_user)
    print("Status code:", response.status_code)
    print("Respuesta:", response.json())

def test_login():
    print("\n=== Probando login ===")
    login_data = {
        "email": test_user["email"],
        "password": test_user["password"]
    }
    response = requests.post(LOGIN_ENDPOINT, json=login_data)
    print("Status code:", response.status_code)
    try:
        print("Respuesta:", response.json())
    except Exception:
        print("No se pudo parsear la respuesta JSON")

if __name__ == "__main__":
    test_register()
    test_login()
