# 🎬 Tinder Pelis - QA Testing Suite

## 📋 Descripción

Suite completa de testing para el proyecto Tinder Pelis, incluyendo tests unitarios, de integración y E2E para backend (Flask + PostgreSQL) y frontend móvil (React Native).

## 🏗️ Arquitectura del Proyecto

```
tinder-pelis/
├── server/                 # Backend Flask + PostgreSQL
│   ├── tests/             # Tests del backend
│   │   ├── unit/          # Tests unitarios
│   │   └── integration/    # Tests de integración
│   └── run_tests.py       # Script de utilidad
├── mobile/                 # Frontend React Native
│   └── tinder-pelis-mobile/
│       ├── __tests__/     # Tests del frontend
│       └── e2e/           # Tests E2E (Detox)
└── run_e2e_mobile.js      # Script E2E móvil
```

## 🚀 Inicio Rápido

### Backend Tests
```bash
cd server
python run_tests.py unit        # Tests unitarios
python run_tests.py integration # Tests de integración
python run_tests.py all         # Todos los tests
python run_tests.py coverage    # Con cobertura
```

### Frontend Tests
```bash
cd mobile/tinder-pelis-mobile
npm test                       # Todos los tests
npm run test:watch             # Modo watch
npm run test:coverage          # Con cobertura
```

### E2E Tests (Móvil)
```bash
node run_e2e_mobile.js e2e:build    # Construir app
node run_e2e_mobile.js e2e:test     # Ejecutar tests
```

## 📊 Estado Actual

- ✅ **Backend**: 19 tests (100% pasando)
- ✅ **Frontend**: 15 tests (100% pasando)
- ✅ **Documentación**: Completa
- ⏳ **CI/CD**: Pendiente
- ⏳ **Herramientas QA**: Pendiente

## 🛠️ Tecnologías

- **Backend**: pytest, pytest-flask, pytest-cov, SQLite in-memory
- **Frontend**: Jest, React Native Testing Library
- **CI/CD**: GitHub Actions (pendiente)

## 📖 Documentación Detallada

- [Backend Testing Guide](server/tests/README.md)
- [Frontend Testing Guide](mobile/tinder-pelis-mobile/TESTING.md)
- [QA Best Practices](QA_BEST_PRACTICES.md)

## 🤝 Contribución

1. Ejecutar tests antes de hacer commit
2. Mantener cobertura > 80%
3. Seguir convenciones de naming
4. Documentar nuevos tests

## 📞 Soporte

Para dudas sobre testing, consultar la documentación específica o contactar al equipo de QA.
