// Tests para funciones de utilidad básicas
describe('Utility Functions Tests', () => {
  describe('formatDate', () => {
    const formatDate = (date) => {
      if (!date) return 'Invalid Date';
      const d = new Date(date);
      if (isNaN(d.getTime())) return 'Invalid Date';
      return d.toLocaleDateString('es-ES');
    };

    it('should format date correctly', () => {
      const date = new Date('2023-12-25T00:00:00Z');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/25\/12\/2023|24\/12\/2023/); // Acepta ambas fechas por zona horaria
    });

    it('should handle invalid date', () => {
      const result = formatDate('invalid-date');
      expect(result).toBe('Invalid Date');
    });
  });

  describe('validateEmail', () => {
    const validateEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    it('should validate correct email', () => {
      const result = validateEmail('test@example.com');
      expect(result).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = validateEmail('invalid-email');
      expect(result).toBe(false);
    });

    it('should reject empty email', () => {
      const result = validateEmail('');
      expect(result).toBe(false);
    });
  });

  describe('generateRandomId', () => {
    const generateRandomId = () => {
      return Math.random().toString(36).substr(2, 9);
    };

    it('should generate random ID', () => {
      const id = generateRandomId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('should generate unique IDs', () => {
      const id1 = generateRandomId();
      const id2 = generateRandomId();
      expect(id1).not.toBe(id2);
    });
  });
});
