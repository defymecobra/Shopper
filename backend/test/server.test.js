const request = require('supertest');
let app, server;

describe('Test suite', () => {
  beforeAll(() => {
    const serverInstance = require('../index');
    app = serverInstance.app;
    server = serverInstance.server;
  });

  afterAll(async () => {
    await new Promise(resolve => server.close(resolve));
  });

  describe('GET /', () => {
    it('responds with "Express app is running"', async () => {
      const response = await request(app).get('/');
      expect(response.statusCode).toBe(200);
      expect(response.text).toBe('Express app is running');
    });
  });

  describe('POST /addproduct', () => {
    it('adds a new product', async () => {
      const newProduct = {
        name: 'Test Product',
        image: 'test.jpg',
        category: 'Test Category',
        new_price: 10,
        old_price: 8,
        description: 'Test Description',
        size: 'M'
      };

      const response = await request(app)
        .post('/addproduct')
        .send(newProduct);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.name).toBe('Test Product');
    });
  });

  describe('POST /removeproduct', () => {
    it('removes a product', async () => {
      const productId = 1;

      const response = await request(app)
        .post('/removeproduct')
        .send({ id: productId });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /allproducts', () => {
    it('fetches all products', async () => {
      const response = await request(app).get('/allproducts');
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /getproductname/:productId', () => {
    it('fetches the product name and size', async () => {
      const productId = 3;

      const response = await request(app).get(`/getproductname/${productId}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(typeof response.body.productName).toBe('string');
      expect(typeof response.body.productSize).toBe('string');
    });
  });

  describe('POST /signup', () => {
    it('registers a new user', async () => {
      const newUser = {
        username: 'testuser',
        email: 'test1@example.com',
        password: 'testpassword'
      };

      const response = await request(app)
        .post('/signup')
        .send(newUser);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(typeof response.body.token).toBe('string');
    });
  });
});