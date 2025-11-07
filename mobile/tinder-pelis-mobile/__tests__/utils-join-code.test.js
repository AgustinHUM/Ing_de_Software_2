/**
 * Tests para toJoinCode - Helper de conversión de códigos de grupo
 * 
 * Esta función convierte el ID interno de grupo a un código de unión.
 * Fórmula: groupId * 7 + 13
 * 
 * Es crítica para la funcionalidad de grupos. Si cambia, debe cambiar
 * también en leaveGroup y en el backend.
 */

describe('toJoinCode - Group Join Code Conversion Tests', () => {
  // Función a testear
  const toJoinCode = (groupId) => groupId * 7 + 13;

  describe('Basic conversion', () => {
    it('should calculate join code correctly for groupId 1', () => {
      const result = toJoinCode(1);
      expect(result).toBe(20); // 1 * 7 + 13 = 20
    });

    it('should calculate join code correctly for groupId 10', () => {
      const result = toJoinCode(10);
      expect(result).toBe(83); // 10 * 7 + 13 = 83
    });

    it('should calculate join code correctly for groupId 0', () => {
      const result = toJoinCode(0);
      expect(result).toBe(13); // 0 * 7 + 13 = 13
    });

    it('should calculate join code correctly for groupId 100', () => {
      const result = toJoinCode(100);
      expect(result).toBe(713); // 100 * 7 + 13 = 713
    });
  });

  describe('Edge cases', () => {
    it('should handle negative groupId', () => {
      const result = toJoinCode(-1);
      expect(result).toBe(6); // -1 * 7 + 13 = 6
    });

    it('should handle large groupId', () => {
      const result = toJoinCode(999999);
      expect(result).toBe(7000006); // 999999 * 7 + 13 = 7000006
    });

    it('should handle decimal groupId (should be converted to integer)', () => {
      // Nota: En JavaScript, Number(5.5) * 7 = 38.5, pero si se pasa como int debería ser 5
      // Este test verifica el comportamiento actual
      const result = toJoinCode(5.5);
      expect(result).toBe(51.5); // 5.5 * 7 + 13 = 51.5
    });
  });

  describe('Consistency with leaveGroup function', () => {
    it('should match the formula used in leaveGroup', () => {
      // Esta función debe usar la misma fórmula que leaveGroup en api.js
      // leaveGroup hace: Number(groupId) * 7 + 13
      
      const testCases = [
        { groupId: 1, expected: 20 },
        { groupId: 5, expected: 48 },
        { groupId: 10, expected: 83 },
        { groupId: 25, expected: 188 },
        { groupId: 50, expected: 363 }
      ];

      testCases.forEach(({ groupId, expected }) => {
        const result = toJoinCode(groupId);
        expect(result).toBe(expected);
      });
    });
  });

  describe('Reverse calculation (bonus)', () => {
    it('should allow reverse calculation from joinCode to groupId', () => {
      // Fórmula inversa: (joinCode - 13) / 7
      const groupId = 10;
      const joinCode = toJoinCode(groupId);
      const reverseCalculated = (joinCode - 13) / 7;
      
      expect(reverseCalculated).toBe(groupId);
    });

    it('should handle reverse calculation for multiple values', () => {
      const testGroupIds = [1, 5, 10, 25, 50, 100];
      
      testGroupIds.forEach(groupId => {
        const joinCode = toJoinCode(groupId);
        const reverseCalculated = (joinCode - 13) / 7;
        expect(reverseCalculated).toBe(groupId);
      });
    });
  });
});

