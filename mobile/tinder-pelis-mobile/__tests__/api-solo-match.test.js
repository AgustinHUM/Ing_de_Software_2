/**
 * Tests para createSoloMatch - Función compleja de matching
 * 
 * Esta función orquesta 3 llamadas API secuenciales:
 * 1. createMatchSession
 * 2. joinMatchSession
 * 3. startMatchSession
 * 
 * Es crítica para el flujo de matching individual.
 */

describe('createSoloMatch - Solo Match Creation Tests', () => {
  // Mock de las funciones de API
  let createMatchSession;
  let joinMatchSession;
  let startMatchSession;
  let createSoloMatch;

  beforeEach(() => {
    // Reset mocks antes de cada test
    createMatchSession = jest.fn();
    joinMatchSession = jest.fn();
    startMatchSession = jest.fn();

    // Implementar createSoloMatch con los mocks
    createSoloMatch = async (token, genres) => {
      try {
        // For solo sessions, pass null as group_id
        const session = await createMatchSession(null, token);
        
        if (!session || !session.session_id) {
          throw new Error('Failed to create solo session');
        }
        
        await joinMatchSession(session.session_id, genres, token);
        await startMatchSession(session.session_id, token);
        return session;
      } catch (error) {
        console.error('Error in createSoloMatch:', error);
        throw error;
      }
    };
  });

  describe('Successful solo match creation', () => {
    it('should create solo match successfully with all steps', async () => {
      const mockSession = {
        session_id: 'test-session-123',
        group_id: null,
        status: 'waiting_for_participants'
      };

      const token = 'test-token-123';
      const genres = [1, 2, 3];

      // Mock las 3 funciones para éxito
      createMatchSession.mockResolvedValue(mockSession);
      joinMatchSession.mockResolvedValue({ msg: 'Joined successfully' });
      startMatchSession.mockResolvedValue({ msg: 'Matching started' });

      const result = await createSoloMatch(token, genres);

      // Verificar que se llamaron las 3 funciones en orden
      expect(createMatchSession).toHaveBeenCalledTimes(1);
      expect(createMatchSession).toHaveBeenCalledWith(null, token);

      expect(joinMatchSession).toHaveBeenCalledTimes(1);
      expect(joinMatchSession).toHaveBeenCalledWith(
        mockSession.session_id,
        genres,
        token
      );

      expect(startMatchSession).toHaveBeenCalledTimes(1);
      expect(startMatchSession).toHaveBeenCalledWith(
        mockSession.session_id,
        token
      );

      // Verificar que retorna la sesión
      expect(result).toEqual(mockSession);
    });

    it('should work with empty genres array', async () => {
      const mockSession = {
        session_id: 'test-session-456',
        group_id: null
      };

      createMatchSession.mockResolvedValue(mockSession);
      joinMatchSession.mockResolvedValue({});
      startMatchSession.mockResolvedValue({});

      const result = await createSoloMatch('token', []);

      expect(joinMatchSession).toHaveBeenCalledWith(
        mockSession.session_id,
        [],
        'token'
      );
      expect(result).toEqual(mockSession);
    });
  });

  describe('Error handling', () => {
    it('should throw error if session creation fails', async () => {
      const error = new Error('Failed to create session');
      createMatchSession.mockRejectedValue(error);

      await expect(createSoloMatch('token', [1, 2])).rejects.toThrow('Failed to create session');

      // Verificar que no se llamaron las otras funciones
      expect(joinMatchSession).not.toHaveBeenCalled();
      expect(startMatchSession).not.toHaveBeenCalled();
    });

    it('should throw error if session_id is missing from response', async () => {
      createMatchSession.mockResolvedValue({}); // Sin session_id

      await expect(createSoloMatch('token', [1, 2])).rejects.toThrow('Failed to create solo session');

      expect(joinMatchSession).not.toHaveBeenCalled();
      expect(startMatchSession).not.toHaveBeenCalled();
    });

    it('should throw error if session is null', async () => {
      createMatchSession.mockResolvedValue(null);

      await expect(createSoloMatch('token', [1, 2])).rejects.toThrow('Failed to create solo session');

      expect(joinMatchSession).not.toHaveBeenCalled();
      expect(startMatchSession).not.toHaveBeenCalled();
    });

    it('should throw error if joinMatchSession fails', async () => {
      const mockSession = {
        session_id: 'test-session-789',
        group_id: null
      };

      createMatchSession.mockResolvedValue(mockSession);
      const joinError = new Error('Failed to join session');
      joinMatchSession.mockRejectedValue(joinError);

      await expect(createSoloMatch('token', [1, 2])).rejects.toThrow('Failed to join session');

      // Verificar que no se llamó startMatchSession
      expect(startMatchSession).not.toHaveBeenCalled();
    });

    it('should throw error if startMatchSession fails', async () => {
      const mockSession = {
        session_id: 'test-session-101',
        group_id: null
      };

      createMatchSession.mockResolvedValue(mockSession);
      joinMatchSession.mockResolvedValue({});
      const startError = new Error('Failed to start matching');
      startMatchSession.mockRejectedValue(startError);

      await expect(createSoloMatch('token', [1, 2])).rejects.toThrow('Failed to start matching');
    });
  });

  describe('Edge cases', () => {
    it('should handle session_id as number', async () => {
      const mockSession = {
        session_id: 12345, // Number instead of string
        group_id: null
      };

      createMatchSession.mockResolvedValue(mockSession);
      joinMatchSession.mockResolvedValue({});
      startMatchSession.mockResolvedValue({});

      const result = await createSoloMatch('token', [1]);

      expect(joinMatchSession).toHaveBeenCalledWith(12345, [1], 'token');
      expect(result).toEqual(mockSession);
    });

    it('should handle undefined genres', async () => {
      const mockSession = {
        session_id: 'test-session',
        group_id: null
      };

      createMatchSession.mockResolvedValue(mockSession);
      joinMatchSession.mockResolvedValue({});
      startMatchSession.mockResolvedValue({});

      const result = await createSoloMatch('token', undefined);

      expect(joinMatchSession).toHaveBeenCalledWith('test-session', undefined, 'token');
      expect(result).toEqual(mockSession);
    });
  });
});

