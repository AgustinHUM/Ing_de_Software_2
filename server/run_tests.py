#!/usr/bin/env python3
"""
Script para ejecutar tests con configuración adecuada
"""
import os
import sys
import subprocess
from pathlib import Path

def main():
    # Configurar variables de entorno para testing
    os.environ['FLASK_ENV'] = 'testing'
    
    # Cambiar al directorio del servidor
    server_dir = Path(__file__).parent
    os.chdir(server_dir)
    
    # Comandos de pytest
    commands = {
        'unit': ['pytest', 'tests/unit/', '-v', '--tb=short'],
        'integration': ['pytest', 'tests/integration/', '-v', '--tb=short'],
        'all': ['pytest', 'tests/', '-v', '--tb=short', '--cov=app', '--cov-report=html'],
        'coverage': ['pytest', 'tests/', '--cov=app', '--cov-report=html', '--cov-report=term']
    }
    
    if len(sys.argv) < 2:
        print("Uso: python run_tests.py [unit|integration|all|coverage]")
        print("Ejemplos:")
        print("  python run_tests.py unit")
        print("  python run_tests.py all")
        print("  python run_tests.py coverage")
        return
    
    test_type = sys.argv[1]
    
    if test_type not in commands:
        print(f"Tipo de test no válido: {test_type}")
        print(f"Opciones disponibles: {list(commands.keys())}")
        return
    
    # Ejecutar tests
    cmd = commands[test_type]
    print(f"Ejecutando: {' '.join(cmd)}")
    
    try:
        result = subprocess.run(cmd, check=True)
        print("✅ Tests ejecutados exitosamente")
    except subprocess.CalledProcessError as e:
        print(f"❌ Tests fallaron con código: {e.returncode}")
        sys.exit(e.returncode)
    except FileNotFoundError:
        print("❌ pytest no encontrado. Instala las dependencias con: pip install pytest pytest-flask pytest-cov")
        sys.exit(1)

if __name__ == '__main__':
    main()
