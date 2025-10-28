# 📱 Frontend Mobile Testing Guide

## 📋 Descripción

Guía completa para testing del frontend React Native de Tinder Pelis.

## 🏗️ Estructura

```
mobile/tinder-pelis-mobile/
├── __tests__/              # Tests unitarios
│   ├── basic.test.js
│   ├── api-real.test.js
│   ├── api-functions.test.js
│   ├── textinput-simple.test.js
│   └── utils.test.js
├── e2e/                    # Tests E2E (Detox)
│   ├── config.json
│   └── init.js
├── jest.config.js          # Configuración de Jest
├── jest.setup.js           # Setup global
├── babel.config.js         # Configuración de Babel
└── run_tests.js            # Script de utilidad
```

## 🚀 Comandos Disponibles

### Scripts de NPM

```bash
# Ejecutar todos los tests
npm test

# Modo watch
npm run test:watch

# Con cobertura
npm run test:coverage

# Para CI
npm run test:ci
```

### Script de Utilidad (`run_tests.js`)

```bash
# Todos los tests
node run_tests.js test

# Tests básicos
node run_tests.js test:basic

# Tests de funciones
node run_tests.js test:functions

# Tests de TextInput
node run_tests.js test:textinput

# Con cobertura
node run_tests.js test:coverage

# Limpiar dependencias
node run_tests.js clean
```

## 🧪 Tipos de Tests

### Tests Unitarios
- **Propósito**: Probar componentes y funciones individuales
- **Ubicación**: `__tests__/`
- **Herramientas**: Jest, React Native Testing Library

### Tests E2E
- **Propósito**: Probar flujos completos de usuario
- **Ubicación**: `e2e/`
- **Herramientas**: Detox

## 🔧 Configuración

### jest.config.js
```javascript
module.exports = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: [
    '**/__tests__/**/*.(js|jsx|ts|tsx)',
    '**/*.(test|spec).(js|jsx|ts|tsx)'
  ],
  collectCoverageFrom: [
    'components/**/*.{js,jsx}',
    'screens/**/*.{js,jsx}',
    'src/**/*.{js,jsx}',
    '!**/*.d.ts',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleFileExtensions: ['js', 'jsx', 'json'],
  testEnvironment: 'node'
};
```

### jest.setup.js
```javascript
// Configurar console para evitar warnings en tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
```

## 📊 Tests Actuales

### Tests Unitarios (18 tests)
- **basic.test.js**: 3 tests - Verificación de configuración
- **api-real.test.js**: 3 tests - Mocking de axios
- **api-functions.test.js**: 2 tests - Funciones reales del proyecto
- **textinput-simple.test.js**: 3 tests - Componente TextInput
- **utils.test.js**: 7 tests - Funciones de utilidad

## 🎯 Mejores Prácticas

### Naming
- Archivos: `*.test.js`
- Describe: `ComponentName Tests`
- Tests: `should do something specific`

### Estructura
```javascript
describe('ComponentName Tests', () => {
  it('should render correctly', () => {
    // Arrange
    const props = { title: 'Test' };
    
    // Act
    const { getByText } = render(<Component {...props} />);
    
    // Assert
    expect(getByText('Test')).toBeDefined();
  });
});
```

### Mocking
```javascript
// Mock de módulos externos
jest.mock('react-native-paper', () => ({
  useTheme: () => ({ colors: { primary: 'blue' } }),
  TextInput: 'TextInput',
}));

// Mock de axios
jest.mock('axios');
const axios = require('axios');
```

## 🧪 Ejemplos de Tests

### Test de Componente
```javascript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TextInput from '../../components/TextInput';

describe('TextInput Component Tests', () => {
  it('should handle password toggle', () => {
    const { getByLabelText } = render(
      <TextInput label="Password" password={true} />
    );
    
    const input = getByLabelText('Password');
    expect(input.props.secureTextEntry).toBe(true);
    
    const toggleButton = getByLabelText('Show password');
    fireEvent.press(toggleButton);
    expect(input.props.secureTextEntry).toBe(false);
  });
});
```

### Test de API
```javascript
describe('API Functions Tests', () => {
  it('should test getMovies function', async () => {
    const mockResponse = { movies: [{ id: 1, title: 'Movie 1' }] };
    const mockAxiosInstance = {
      request: jest.fn().mockResolvedValue({ data: mockResponse }),
    };
    axios.create.mockReturnValue(mockAxiosInstance);
    
    const result = await getMovies('query', 1);
    
    expect(result).toEqual(mockResponse);
    expect(mockAxiosInstance.request).toHaveBeenCalledWith({
      url: '/movies',
      method: 'GET',
      params: { query: 'query', page: 1 },
      headers: {}
    });
  });
});
```

## 🐛 Troubleshooting

### Error: Cannot find module
```bash
# Verificar que estás en el directorio correcto
cd mobile/tinder-pelis-mobile
npm test
```

### Error: SyntaxError JSX
```bash
# Verificar configuración de Babel
# Asegurar que @babel/preset-env está instalado
```

### Error: Mock not working
```bash
# Verificar que jest.mock() está antes de require()
# Limpiar mocks entre tests con jest.clearAllMocks()
```

## 📈 Cobertura

### Generar Reporte
```bash
npm run test:coverage
```

### Ver Reporte
```bash
open coverage/lcov-report/index.html
```

### Meta de Cobertura
- **Mínimo**: 70%
- **Objetivo**: 80%
- **Crítico**: 90%

## 🔄 CI/CD

### GitHub Actions (Próximo)
- Ejecutar tests en cada PR
- Generar reportes de cobertura
- Notificar fallos

## 📚 Recursos

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Detox Documentation](https://github.com/wix/Detox)
- [MSW Documentation](https://mswjs.io/)
