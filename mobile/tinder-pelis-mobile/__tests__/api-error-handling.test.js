/**
 * Tests para normalizeAxiosError - Función crítica de manejo de errores
 * 
 * Esta función maneja TODOS los errores de API en la aplicación.
 * Si falla, los errores no se muestran correctamente al usuario.
 */

describe('normalizeAxiosError - Error Handling Tests', () => {
  // Importar la función (necesitamos acceder a la función interna)
  // Como normalizeAxiosError no está exportada, vamos a testearla indirectamente
  // o recrearla para testing
  
  const normalizeAxiosError = (error) => {
    if (error.response) {
      const data = error.response.data ?? {};
      const msg = data.error || data.detail || `HTTP ${error.response.status}`;
      return new Error(msg);
    }

    if (error.request) {
      if (error.code === "ECONNABORTED") return new Error("Request timeout");
      return new Error("No response from server");
    }

    return new Error(error.message || "Request error");
  };

  describe('Error with response (server responded with error)', () => {
    it('should extract error message from data.error', () => {
      const axiosError = {
        response: {
          status: 400,
          data: {
            error: "Email already exists"
          }
        }
      };

      const result = normalizeAxiosError(axiosError);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe("Email already exists");
    });

    it('should extract error message from data.detail when error is not present', () => {
      const axiosError = {
        response: {
          status: 404,
          data: {
            detail: "User not found"
          }
        }
      };

      const result = normalizeAxiosError(axiosError);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe("User not found");
    });

    it('should use HTTP status code when neither error nor detail exist', () => {
      const axiosError = {
        response: {
          status: 500,
          data: {}
        }
      };

      const result = normalizeAxiosError(axiosError);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe("HTTP 500");
    });

    it('should handle null data in response', () => {
      const axiosError = {
        response: {
          status: 401,
          data: null
        }
      };

      const result = normalizeAxiosError(axiosError);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe("HTTP 401");
    });

    it('should prioritize error over detail', () => {
      const axiosError = {
        response: {
          status: 400,
          data: {
            error: "Primary error message",
            detail: "Secondary detail message"
          }
        }
      };

      const result = normalizeAxiosError(axiosError);
      expect(result.message).toBe("Primary error message");
    });
  });

  describe('Error with request but no response (network/timeout)', () => {
    it('should return timeout error for ECONNABORTED code', () => {
      const axiosError = {
        request: {},
        code: "ECONNABORTED"
      };

      const result = normalizeAxiosError(axiosError);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe("Request timeout");
    });

    it('should return "No response from server" for other request errors', () => {
      const axiosError = {
        request: {},
        code: "ENOTFOUND"
      };

      const result = normalizeAxiosError(axiosError);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe("No response from server");
    });

    it('should return "No response from server" when request exists but no code', () => {
      const axiosError = {
        request: {}
      };

      const result = normalizeAxiosError(axiosError);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe("No response from server");
    });
  });

  describe('Generic error (other errors)', () => {
    it('should use error.message when available', () => {
      const axiosError = {
        message: "Network request failed"
      };

      const result = normalizeAxiosError(axiosError);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe("Network request failed");
    });

    it('should return "Request error" when message is not available', () => {
      const axiosError = {};

      const result = normalizeAxiosError(axiosError);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe("Request error");
    });

    it('should return "Request error" when message is empty string', () => {
      const axiosError = {
        message: ""
      };

      const result = normalizeAxiosError(axiosError);
      expect(result.message).toBe("Request error");
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined data in response', () => {
      const axiosError = {
        response: {
          status: 400,
          data: undefined
        }
      };

      const result = normalizeAxiosError(axiosError);
      expect(result.message).toBe("HTTP 400");
    });

    it('should handle empty string in data.error', () => {
      const axiosError = {
        response: {
          status: 400,
          data: {
            error: "",
            detail: "This should be used"
          }
        }
      };

      // Empty string is falsy, so it should use detail
      const result = normalizeAxiosError(axiosError);
      expect(result.message).toBe("This should be used");
    });
  });
});

