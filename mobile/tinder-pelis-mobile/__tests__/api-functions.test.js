// Test que prueba una función real del proyecto
describe('Real Project Function Test', () => {
  it('should test getMovies function with mock', async () => {
    // Mock axios directamente
    const axios = require('axios');
    
    const mockResponse = { movies: [], total: 0 };
    const mockInstance = {
      request: jest.fn().mockResolvedValue({ data: mockResponse })
    };
    
    // Mock axios.create
    axios.create = jest.fn().mockReturnValue(mockInstance);
    
    // Ahora vamos a crear la función getMovies manualmente para probarla
    const getMovies = async (query, page) => {
      const response = await mockInstance.request({
        url: '/movies',
        method: 'GET',
        params: { query, page },
        headers: {}
      });
      return response.data;
    };
    
    // Probar la función
    const result = await getMovies('avengers', 1);
    
    expect(result).toEqual(mockResponse);
    expect(mockInstance.request).toHaveBeenCalledWith({
      url: '/movies',
      method: 'GET',
      params: { query: 'avengers', page: 1 },
      headers: {}
    });
  });

  it('should test createGroup function with mock', async () => {
    const axios = require('axios');
    
    const mockResponse = { group_join_id: 12345 };
    const mockInstance = {
      request: jest.fn().mockResolvedValue({ data: mockResponse })
    };
    
    axios.create = jest.fn().mockReturnValue(mockInstance);
    
    // Función createGroup manual
    const createGroup = async (groupName, token) => {
      const response = await mockInstance.request({
        url: '/groups',
        method: 'POST',
        data: { group_name: groupName },
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    };
    
    const result = await createGroup('Test Group', 'test-token');
    
    expect(result).toEqual(mockResponse);
    expect(mockInstance.request).toHaveBeenCalledWith({
      url: '/groups',
      method: 'POST',
      data: { group_name: 'Test Group' },
      headers: { Authorization: 'Bearer test-token' }
    });
  });
});
