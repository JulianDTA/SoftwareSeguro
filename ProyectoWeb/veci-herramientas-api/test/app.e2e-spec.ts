import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  
  // Generamos datos aleatorios para evitar errores de "Email ya existe"
  const randomStr = Math.random().toString(36).substring(7);
  const testUser = {
    name: `Test User ${randomStr}`,
    email: `test_${randomStr}@example.com`,
    password: 'password123',
  };

  const testTool = {
    name: 'Taladro de Prueba E2E',
    description: 'Herramienta creada automáticamente por los tests',
    category: 'Carpintería',
    type: 'loan',
    price: 0,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // PRUEBA 1: Health Check
  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200);
  });

  // PRUEBA 2: Registro
  // CORRECCIÓN: La ruta es /users/register, no /users
  it('/users/register (POST) - Debería registrar un usuario', async () => {
    const response = await request(app.getHttpServer())
      .post('/users/register') 
      .send(testUser)
      .expect(201); // NestJS devuelve 201 por defecto en POST

    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toEqual(testUser.email);
  });

  // PRUEBA 3: Login
  it('/auth/login (POST) - Debería devolver un JWT', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .expect(201);

    expect(response.body).toHaveProperty('access_token');
    jwtToken = response.body.access_token;
  });

  // PRUEBA 4: Creación Protegida
  it('/tools (POST) - Debería crear una herramienta usando el Token', async () => {
    const response = await request(app.getHttpServer())
      .post('/tools')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(testTool)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toEqual(testTool.name);
  });
});