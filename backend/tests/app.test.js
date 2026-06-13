const request = require('supertest');
jest.mock('winston', () => {
  const originalWinston = jest.requireActual('winston');
  return {
    ...originalWinston,
    createLogger: jest.fn().mockImplementation((options) => {
      if (global.throwWinstonError) {
        throw new Error('Mock Winston Error');
      }
      return originalWinston.createLogger(options);
    })
  };
});
const app = require('../app');
const { calculateFootprint } = require('../services/calculatorService');
const firestoreService = require('../services/firestore');

describe('C.A.R.B.O.N+ Core Business Logic Tests', () => {
  test('calculateFootprint should correctly calculate emissions based on factors', () => {
    const input = {
      transportType: 'car_petrol',
      transportDistance: 100, // 100 * 0.2 = 20 kg CO2e
      electricityKwh: 50,     // 50 * 0.82 = 41 kg CO2e
      electricityType: 'grid',
      foodHabit: 'vegetarian', // 1.7 kg CO2e
      wasteWeight: 10,        // 10 * 0.8 = 8 kg CO2e
      wasteType: 'landfill',
      date: '2026-06-10'
    };

    const result = calculateFootprint(input);
    expect(result.total).toBe(70.7); // 20 + 41 + 1.7 + 8 = 70.7
    // Car petrol: 0.20 * 100 = 20
    // Electricity: 0.82 * 50 = 41
    // Food: 1.7
    // Waste: 0.8 * 10 = 8
    // Total = 70.7. Yes! Let's assert the individual breakdown instead.
    expect(result.breakdown.transport).toBe(20);
    expect(result.breakdown.electricity).toBe(41);
    expect(result.breakdown.food).toBe(1.7);
    expect(result.breakdown.waste).toBe(8);
    expect(result.total).toBe(70.7);
  });

  test('calculateFootprint should use defaults for missing values', () => {
    const result = calculateFootprint({});
    // Default transportType = car_petrol, distance = 0 => 0
    // Default electricityKwh = 0 => 0
    // Default foodHabit = meat_average => 2.5
    // Default wasteWeight = 0 => 0
    expect(result.total).toBe(2.5);
  });
});

describe('C.A.R.B.O.N+ API Endpoint Tests', () => {
  const mockUserId = 'test-user-id';
  let createdLogId;
  let createdGoalId;
  let createdHabitId;

  // Health check endpoint
  test('GET /api/health should return UP status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('UP');
    expect(res.body.data.database.status).toBe('CONNECTED');
  });

  // Calculator API
  test('POST /api/calculator should fail validation for negative values', async () => {
    const res = await request(app)
      .post('/api/calculator')
      .set('x-user-id', mockUserId)
      .send({ transportDistance: -10 });
    
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors.transportDistance).toBeDefined();
  });

  test('POST /api/calculator should create an emission log', async () => {
    const res = await request(app)
      .post('/api/calculator')
      .set('x-user-id', mockUserId)
      .send({
        transportType: 'car_petrol',
        transportDistance: 50,
        electricityKwh: 20,
        electricityType: 'grid',
        foodHabit: 'vegetarian',
        wasteWeight: 5,
        wasteType: 'landfill',
        date: new Date().toISOString().split('T')[0]
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.total).toBeGreaterThan(0);
    createdLogId = res.body.data.id;
  });

  test('GET /api/calculator should return user logs', async () => {
    const res = await request(app)
      .get('/api/calculator')
      .set('x-user-id', mockUserId);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  // Goals API
  test('POST /api/goals should fail validation with missing fields', async () => {
    const res = await request(app)
      .post('/api/goals')
      .set('x-user-id', mockUserId)
      .send({ title: 'Short target' }); // Missing targetValue and endDate
    
    expect(res.statusCode).toBe(400);
  });

  test('POST /api/goals should create a new goal', async () => {
    const res = await request(app)
      .post('/api/goals')
      .set('x-user-id', mockUserId)
      .send({
        title: 'Reduce Carbon Footprint',
        targetValue: 50,
        category: 'transport',
        endDate: '2026-12-31'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.status).toBe('active');
    createdGoalId = res.body.data.id;
  });

  test('GET /api/goals should list user goals', async () => {
    const res = await request(app)
      .get('/api/goals')
      .set('x-user-id', mockUserId);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('GET /api/goals/:id should return details of a specific goal', async () => {
    const res = await request(app)
      .get(`/api/goals/${createdGoalId}`)
      .set('x-user-id', mockUserId);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.title).toBe('Reduce Carbon Footprint');
  });

  test('PUT /api/goals/:id should update goal progress', async () => {
    const res = await request(app)
      .put(`/api/goals/${createdGoalId}`)
      .set('x-user-id', mockUserId)
      .send({ currentValue: 55 }); // exceeds 50, should complete the goal

    expect(res.statusCode).toBe(200);
    expect(res.body.data.currentValue).toBe(55);
    expect(res.body.data.status).toBe('completed');
  });

  // Habits API
  test('POST /api/habits should log a green habit', async () => {
    const res = await request(app)
      .post('/api/habits')
      .set('x-user-id', mockUserId)
      .send({
        habitType: 'cycling',
        value: 15,
        date: new Date().toISOString().split('T')[0]
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.carbonSaved).toBe(3.0); // 15 * 0.20 = 3 kg
    createdHabitId = res.body.data.id;
  });

  test('GET /api/habits should retrieve logged habits', async () => {
    const res = await request(app)
      .get('/api/habits')
      .set('x-user-id', mockUserId);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  // Dashboard API
  test('GET /api/dashboard should return metrics', async () => {
    const res = await request(app)
      .get('/api/dashboard')
      .set('x-user-id', mockUserId);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.weekly).toBeDefined();
    expect(res.body.data.weekly.total).toBeGreaterThan(0);
  });

  // Analytics API
  test('GET /api/analytics should return weekly report', async () => {
    const res = await request(app)
      .get('/api/analytics')
      .set('x-user-id', mockUserId);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.ecoScore).toBeDefined();
    expect(res.body.data.dailyTrend).toBeDefined();
  });

  // Insights API
  test('GET /api/insights should return insights list', async () => {
    const res = await request(app)
      .get('/api/insights')
      .set('x-user-id', mockUserId);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  // Delete resources
  test('DELETE /api/calculator/:id should delete the log', async () => {
    const res = await request(app)
      .delete(`/api/calculator/${createdLogId}`)
      .set('x-user-id', mockUserId);

    expect(res.statusCode).toBe(200);

    const logsCheck = await request(app)
      .get('/api/calculator')
      .set('x-user-id', mockUserId);
    
    expect(logsCheck.body.data.some(l => l.id === createdLogId)).toBe(false);
  });

  test('DELETE /api/goals/:id should delete the goal', async () => {
    const res = await request(app)
      .delete(`/api/goals/${createdGoalId}`)
      .set('x-user-id', mockUserId);

    expect(res.statusCode).toBe(200);
  });

  test('DELETE /api/habits/:id should delete the habit log', async () => {
    const res = await request(app)
      .delete(`/api/habits/${createdHabitId}`)
      .set('x-user-id', mockUserId);

    expect(res.statusCode).toBe(200);
  });
});

describe('Firestore Fail-safe Mode tests', () => {
  test('isFallbackMode should return true if no FIRESTORE_PROJECT_ID is supplied', () => {
    expect(firestoreService.isFallbackMode()).toBe(true);
  });

  test('Saving a document to local database fallback should work successfully', async () => {
    const data = { dummy: 'test' };
    const res = await firestoreService.saveDocument('test_col', 'doc_123', data);
    expect(res.success).toBe(true);
    
    const retrieved = await firestoreService.getDocument('test_col', 'doc_123');
    expect(retrieved.dummy).toBe('test');
  });
});

describe('Additional C.A.R.B.O.N+ Coverage Tests', () => {
  const mockUserId = 'test-user-id';

  // 1. Wildcard routes in app.js
  test('GET /api/nonexistent-route should return 404', async () => {
    const res = await request(app).get('/api/nonexistent-route');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('GET /nonexistent-frontend-route should serve index.html or fallback text', async () => {
    const res = await request(app).get('/nonexistent-frontend-route');
    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/(C\.A\.R\.B\.O\.N\+ Web App Backend running|frontend|id="root")/i);
  });

  // 2. Logger stream coverage
  test('Morgan logging stream should trigger successfully in development mode', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    
    process.env.NODE_ENV = originalEnv;
  });

  // 3. Input sanitization array branch
  test('POST /api/calculator should sanitize nested array inputs', async () => {
    const res = await request(app)
      .post('/api/calculator')
      .set('x-user-id', mockUserId)
      .send({
        transportType: 'car_petrol',
        transportDistance: 10,
        electricityKwh: 5,
        electricityType: 'grid',
        foodHabit: 'vegetarian',
        wasteWeight: 2,
        wasteType: 'landfill',
        date: new Date().toISOString().split('T')[0],
        nestedArray: ['<script>alert(1)</script>', 'safe']
      });
    expect(res.statusCode).toBe(201);
  });

  // 4. Controller error paths
  test('Controllers should handle service errors and invoke next(error)', async () => {
    const { calculatorService } = require('../services/calculatorService');
    const dashboardService = require('../services/dashboardService');
    const insightsService = require('../services/insightsService');
    const goalService = require('../services/goalService');
    const habitService = require('../services/habitService');
    const analyticsService = require('../services/analyticsService');

    const errorMock = new Error('Mocked Service Error');

    // CalculatorController error
    const spyCalc = jest.spyOn(calculatorService, 'computeAndSave').mockRejectedValueOnce(errorMock);
    const spyGetLogs = jest.spyOn(calculatorService, 'getLogs').mockRejectedValueOnce(errorMock);
    const spyDeleteLog = jest.spyOn(calculatorService, 'deleteLog').mockRejectedValueOnce(errorMock);
    
    let res = await request(app).post('/api/calculator').set('x-user-id', mockUserId).send({ transportDistance: 50 });
    expect(res.statusCode).toBe(500);
    
    res = await request(app).get('/api/calculator').set('x-user-id', mockUserId);
    expect(res.statusCode).toBe(500);
    
    res = await request(app).delete('/api/calculator/123').set('x-user-id', mockUserId);
    expect(res.statusCode).toBe(500);

    spyCalc.mockRestore();
    spyGetLogs.mockRestore();
    spyDeleteLog.mockRestore();

    // DashboardController error
    const spyDash = jest.spyOn(dashboardService, 'getDashboardData').mockRejectedValueOnce(errorMock);
    res = await request(app).get('/api/dashboard').set('x-user-id', mockUserId);
    expect(res.statusCode).toBe(500);
    spyDash.mockRestore();

    // InsightsController error
    const spyInsights = jest.spyOn(insightsService, 'getInsights').mockRejectedValueOnce(errorMock);
    res = await request(app).get('/api/insights').set('x-user-id', mockUserId);
    expect(res.statusCode).toBe(500);
    spyInsights.mockRestore();

    // GoalController error
    const spyCreateGoal = jest.spyOn(goalService, 'createGoal').mockRejectedValueOnce(errorMock);
    const spyGetGoals = jest.spyOn(goalService, 'getGoals').mockRejectedValueOnce(errorMock);
    const spyGetGoal = jest.spyOn(goalService, 'getGoal').mockRejectedValueOnce(errorMock);
    const spyUpdateGoal = jest.spyOn(goalService, 'updateGoalProgress').mockRejectedValueOnce(errorMock);
    const spyDeleteGoal = jest.spyOn(goalService, 'deleteGoal').mockRejectedValueOnce(errorMock);

    res = await request(app).post('/api/goals').set('x-user-id', mockUserId).send({ title: 'Goal', targetValue: 10, endDate: '2026-12-31' });
    expect(res.statusCode).toBe(500);

    res = await request(app).get('/api/goals').set('x-user-id', mockUserId);
    expect(res.statusCode).toBe(500);

    res = await request(app).get('/api/goals/123').set('x-user-id', mockUserId);
    expect(res.statusCode).toBe(500);

    res = await request(app).put('/api/goals/123').set('x-user-id', mockUserId).send({ currentValue: 5 });
    expect(res.statusCode).toBe(500);

    res = await request(app).delete('/api/goals/123').set('x-user-id', mockUserId);
    expect(res.statusCode).toBe(500);

    spyCreateGoal.mockRestore();
    spyGetGoals.mockRestore();
    spyGetGoal.mockRestore();
    spyUpdateGoal.mockRestore();
    spyDeleteGoal.mockRestore();

    // HabitController error
    const spyLogHabit = jest.spyOn(habitService, 'logHabit').mockRejectedValueOnce(errorMock);
    const spyGetHabits = jest.spyOn(habitService, 'getHabits').mockRejectedValueOnce(errorMock);
    const spyDeleteHabit = jest.spyOn(habitService, 'deleteHabitLog').mockRejectedValueOnce(errorMock);

    res = await request(app).post('/api/habits').set('x-user-id', mockUserId).send({ habitType: 'cycling', value: 10 });
    expect(res.statusCode).toBe(500);

    res = await request(app).get('/api/habits').set('x-user-id', mockUserId);
    expect(res.statusCode).toBe(500);

    res = await request(app).delete('/api/habits/123').set('x-user-id', mockUserId);
    expect(res.statusCode).toBe(500);

    spyLogHabit.mockRestore();
    spyGetHabits.mockRestore();
    spyDeleteHabit.mockRestore();

    // AnalyticsController error
    const spyAnalytics = jest.spyOn(analyticsService, 'getAnalytics').mockRejectedValueOnce(errorMock);
    res = await request(app).get('/api/analytics').set('x-user-id', mockUserId);
    expect(res.statusCode).toBe(500);
    spyAnalytics.mockRestore();
  });

  // 5. Validator schema coverage
  test('Validator utility should check various invalid types and ranges', () => {
    const { validateFields } = require('../utils/validator');
    
    // Number type checks
    const numSchema = { val: { type: 'number', min: 10, max: 20 } };
    expect(validateFields({ val: 'not-a-number' }, numSchema).isValid).toBe(false);
    expect(validateFields({ val: 5 }, numSchema).isValid).toBe(false);
    expect(validateFields({ val: 25 }, numSchema).isValid).toBe(false);
    expect(validateFields({ val: 15 }, numSchema).isValid).toBe(true);

    // String enum checks
    const strSchema = { val: { type: 'string', enum: ['yes', 'no'] } };
    expect(validateFields({ val: 123 }, strSchema).isValid).toBe(false);
    expect(validateFields({ val: 'maybe' }, strSchema).isValid).toBe(false);
    expect(validateFields({ val: 'yes' }, strSchema).isValid).toBe(true);

    // Array type checks
    const arrSchema = { val: { type: 'array' } };
    expect(validateFields({ val: 'not-an-array' }, arrSchema).isValid).toBe(false);
    expect(validateFields({ val: [] }, arrSchema).isValid).toBe(true);

    // Date type checks
    const dateSchema = { val: { type: 'date' } };
    expect(validateFields({ val: 'invalid-date' }, dateSchema).isValid).toBe(false);
    expect(validateFields({ val: '2026-06-10' }, dateSchema).isValid).toBe(true);
  });

  // 6. Analytics Service Unit Tests
  test('Analytics Service should calculate weekly trend and improvement comparison', async () => {
    const analyticsService = require('../services/analyticsService');
    const { calculatorService } = require('../services/calculatorService');
    const habitService = require('../services/habitService');
    const goalService = require('../services/goalService');

    const getPastDateStr = (daysAgo) => {
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      return d.toISOString().split('T')[0];
    };

    const mockLogs = [
      { date: getPastDateStr(2), total: 20, transportType: 'car_petrol', transportDistance: 100, breakdown: { transport: 20, electricity: 0, food: 0, waste: 0 } },
      // Last week log (8 days ago) to trigger previous week emissions branch
      { date: getPastDateStr(8), total: 40, transportType: 'car_petrol', transportDistance: 200, breakdown: { transport: 40, electricity: 0, food: 0, waste: 0 } },
      // Older log
      { date: getPastDateStr(15), total: 50, transportType: 'car_petrol', transportDistance: 250, breakdown: { transport: 50, electricity: 0, food: 0, waste: 0 } }
    ];

    const spyLogs = jest.spyOn(calculatorService, 'getLogs').mockResolvedValue(mockLogs);
    const spyHabits = jest.spyOn(habitService, 'getHabits').mockResolvedValue([
      { date: getPastDateStr(2), carbonSaved: 2.5 }
    ]);
    const spyGoals = jest.spyOn(goalService, 'getGoals').mockResolvedValue([
      { status: 'completed' }, { status: 'active' }
    ]);

    const res = await analyticsService.getAnalytics('test-user');
    expect(res.weeklyStats.emissions).toBe(20);
    expect(res.weeklyStats.previousEmissions).toBe(40);
    expect(res.improvementPercentage).toBe(50);
    expect(res.ecoScore).toBeDefined();

    // Test different emission levels for eco score branches
    // 1. Average weekly emissions <= 35
    spyLogs.mockResolvedValueOnce([{ date: getPastDateStr(2), total: 10, transportType: 'car_electric', transportDistance: 100, breakdown: { transport: 10, electricity: 0, food: 0, waste: 0 } }]);
    let scoreRes = await analyticsService.getAnalytics('test-user');
    expect(scoreRes.ecoScore).toBeGreaterThanOrEqual(70);

    // 2. Average weekly emissions <= 70
    spyLogs.mockResolvedValueOnce([{ date: getPastDateStr(2), total: 50, transportType: 'car_petrol', transportDistance: 100, breakdown: { transport: 50, electricity: 0, food: 0, waste: 0 } }]);
    scoreRes = await analyticsService.getAnalytics('test-user');
    expect(scoreRes.ecoScore).toBeDefined();

    // 3. Average weekly emissions <= 105
    spyLogs.mockResolvedValueOnce([{ date: getPastDateStr(2), total: 90, transportType: 'car_petrol', transportDistance: 100, breakdown: { transport: 90, electricity: 0, food: 0, waste: 0 } }]);
    scoreRes = await analyticsService.getAnalytics('test-user');
    expect(scoreRes.ecoScore).toBeDefined();

    // 4. Average weekly emissions > 105
    spyLogs.mockResolvedValueOnce([{ date: getPastDateStr(2), total: 150, transportType: 'car_petrol', transportDistance: 100, breakdown: { transport: 150, electricity: 0, food: 0, waste: 0 } }]);
    scoreRes = await analyticsService.getAnalytics('test-user');
    expect(scoreRes.ecoScore).toBeDefined();

    // 5. No previous emissions but current emissions > 0
    spyLogs.mockResolvedValueOnce([{ date: getPastDateStr(2), total: 20, transportType: 'car_petrol', transportDistance: 100, breakdown: { transport: 20, electricity: 0, food: 0, waste: 0 } }]);
    spyHabits.mockResolvedValueOnce([]);
    spyGoals.mockResolvedValueOnce([]);
    let trendRes = await analyticsService.getAnalytics('test-user');
    expect(trendRes.improvementPercentage).toBe(0);

    // 6. No emissions at all
    spyLogs.mockResolvedValueOnce([]);
    trendRes = await analyticsService.getAnalytics('test-user');
    expect(trendRes.improvementPercentage).toBe(0);

    spyLogs.mockRestore();
    spyHabits.mockRestore();
    spyGoals.mockRestore();
  });

  // 7. Insights Service length check
  test('Insights Service should add electricity recommendations if insights count is small', async () => {
    const insightsService = require('../services/insightsService');
    const dashboardService = require('../services/dashboardService');

    const mockDashboard = {
      weekly: {
        total: 1.5,
        breakdown: { transport: 0, electricity: 0, food: 1.5, waste: 0 }
      }
    };

    const spyDash = jest.spyOn(dashboardService, 'getDashboardData').mockResolvedValue(mockDashboard);
    const res = await insightsService.getInsights('test-user');
    expect(res.length).toBeGreaterThanOrEqual(3);
    spyDash.mockRestore();
  });

  // 8. Service error throw validations (unauthorized or not found)
  test('calculatorService, goalService, habitService should throw errors when resource is missing/unauthorized', async () => {
    const { calculatorService } = require('../services/calculatorService');
    const goalService = require('../services/goalService');
    const habitService = require('../services/habitService');

    await expect(calculatorService.deleteLog('unauthorized-user', 'any-id')).rejects.toThrow();
    await expect(goalService.getGoal('unauthorized-user', 'any-id')).rejects.toThrow();
    await expect(habitService.deleteHabitLog('unauthorized-user', 'any-id')).rejects.toThrow();
  });

  // 9. Firestore service branches and catches
  test('Firestore Service cloud client and catch blocks coverage', async () => {
    const mockDbSuccess = {
      collection: jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({ exists: true, data: () => ({ foo: 'bar' }) }),
          set: jest.fn().mockResolvedValue({}),
          delete: jest.fn().mockResolvedValue({})
        }),
        add: jest.fn().mockResolvedValue({ id: 'mock-add-id' }),
        get: jest.fn().mockResolvedValue({
          forEach: (cb) => cb({ id: 'mock-get-id', data: () => ({ foo: 'bar' }) }),
          empty: false
        })
      })
    };

    const mockDbError = {
      collection: jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockRejectedValue(new Error('Mock Cloud Get Error')),
          set: jest.fn().mockRejectedValue(new Error('Mock Cloud Set Error')),
          delete: jest.fn().mockRejectedValue(new Error('Mock Cloud Delete Error'))
        }),
        add: jest.fn().mockRejectedValue(new Error('Mock Cloud Add Error')),
        get: jest.fn().mockRejectedValue(new Error('Mock Cloud Get Collection Error'))
      })
    };

    // Test cloud mode success paths
    firestoreService.__setMode(false, mockDbSuccess);
    
    let res = await firestoreService.saveDocument('test_col', 'doc_123', { foo: 'bar' });
    expect(res.mode).toBe('cloud');
    
    res = await firestoreService.addDocument('test_col', { foo: 'bar' });
    expect(res.mode).toBe('cloud');

    let doc = await firestoreService.getDocument('test_col', 'doc_123');
    expect(doc.foo).toBe('bar');

    let col = await firestoreService.getCollection('test_col');
    expect(col.length).toBeGreaterThan(0);

    res = await firestoreService.deleteDocument('test_col', 'doc_123');
    expect(res.success).toBe(true);

    // Test cloud mode catch and fallback paths
    firestoreService.__setMode(false, mockDbError);

    res = await firestoreService.saveDocument('test_col', 'doc_123', { foo: 'fallback-bar' });
    expect(res.mode).toBe('fallback_active');

    res = await firestoreService.addDocument('test_col', { foo: 'fallback-bar' });
    expect(res.mode).toBe('fallback_active');

    doc = await firestoreService.getDocument('test_col', 'doc_123');
    expect(doc.foo).toBe('fallback-bar');

    col = await firestoreService.getCollection('test_col');
    expect(col.length).toBeGreaterThan(0);

    res = await firestoreService.deleteDocument('test_col', 'doc_123');
    expect(res.success).toBe(true);

    // Restore to fallback mode
    firestoreService.__setMode(true, null);
  });

  // 10. Winston fallback console logger
  test('Winston fallback console logger should trigger console logs if Winston fails', () => {
    global.throwWinstonError = true;
    let fallbackLogger;
    jest.isolateModules(() => {
      fallbackLogger = require('../services/cloudLogger');
    });
    global.throwWinstonError = false;

    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});

    fallbackLogger.info('test info');
    fallbackLogger.error('test error');
    fallbackLogger.warn('test warn');
    fallbackLogger.debug('test debug');

    expect(logSpy).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
    expect(debugSpy).toHaveBeenCalled();

    logSpy.mockRestore();
    errorSpy.mockRestore();
    warnSpy.mockRestore();
    debugSpy.mockRestore();
  });

  // 11. Default user ID fallback in controllers (covering getUserId in all controllers)
  test('Controllers should fall back to default-user when x-user-id header is missing', async () => {
    const endpoints = [
      '/api/dashboard',
      '/api/analytics',
      '/api/calculator',
      '/api/goals',
      '/api/habits',
      '/api/insights'
    ];
    for (const url of endpoints) {
      const res = await request(app).get(url);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    }
  });

  // 12. Health controller checkHealth catch branch coverage
  test('Health Controller checkHealth should catch errors and call next', async () => {
    const spyFallback = jest.spyOn(firestoreService, 'isFallbackMode').mockImplementationOnce(() => {
      throw new Error('Database status check failed');
    });
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
    spyFallback.mockRestore();
  });

  // 13. Response formatter branch coverage
  test('Response formatter should support default arguments', () => {
    const { successResponse, errorResponse } = require('../utils/responseFormatter');
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementation((val) => val)
    };
    
    let res = successResponse(mockRes);
    expect(res.success).toBe(true);
    expect(res.message).toBe('Success');
    expect(res.data).toBeNull();
    
    res = errorResponse(mockRes);
    expect(res.success).toBe(false);
    expect(res.message).toBe('Internal Server Error');
    expect(res.errors).toBeNull();
  });

  // 14. Error handler branch coverage
  test('Error handler should support default error details and production mode config', async () => {
    const errorHandler = require('../middleware/errorHandler');
    const mockReq = { method: 'GET', url: '/test' };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementation((val) => val)
    };
    const mockNext = jest.fn();
    
    // Error with no statusCode or message
    const emptyErr = new Error();
    errorHandler(emptyErr, mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(500);

    // Error in production mode
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    errorHandler(new Error('Production error'), mockReq, mockRes, mockNext);
    process.env.NODE_ENV = originalNodeEnv;
    expect(mockRes.status).toHaveBeenCalledWith(500);
  });

  // 15. Input sanitization branch coverage
  test('Sanitization middleware should handle null, undefined and basic types', () => {
    const sanitizeInput = require('../middleware/sanitize');
    const mockReq = {
      body: { val1: null, val2: undefined, script: '<script>alert(1)</script>' },
      query: { q: 'safe' },
      params: null
    };
    const mockRes = {};
    const mockNext = jest.fn();
    
    sanitizeInput(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.body.val1).toBeNull();
    expect(mockReq.body.val2).toBeUndefined();
    expect(mockReq.body.script).toBe('alert(1)');
  });

  // 16. Logger environment fallback branch
  test('Morgan logger skip should handle missing process.env.NODE_ENV', () => {
    const originalEnv = process.env.NODE_ENV;
    delete process.env.NODE_ENV;
    jest.isolateModules(() => {
      const loggerMiddleware = require('../middleware/logger');
      // Just test it loads correctly
      expect(loggerMiddleware).toBeDefined();
    });
    process.env.NODE_ENV = originalEnv;
  });

  // 17. Local database localDbHelper features
  test('Local DB helper should support random IDs, update merges, and return empty collection lists', async () => {
    // Test direct set with merge using saveDocument
    await firestoreService.saveDocument('test_merge', 'doc_1', { a: 1 });
    await firestoreService.saveDocument('test_merge', 'doc_1', { b: 2 }, { merge: true });
    
    let doc = await firestoreService.getDocument('test_merge', 'doc_1');
    expect(doc.a).toBe(1);
    expect(doc.b).toBe(2);

    // Merge options falsy (overwrites)
    await firestoreService.saveDocument('test_merge', 'doc_1', { c: 3 }, null);
    doc = await firestoreService.getDocument('test_merge', 'doc_1');
    expect(doc.c).toBe(3);
    expect(doc.a).toBeUndefined();

    // getDocument fallback when cloud is missing but local exists
    const mockDbMissing = {
      collection: jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({ exists: false })
        })
      })
    };
    
    // Save locally first in fallback mode
    firestoreService.__setMode(true, null);
    await firestoreService.saveDocument('fallback_check', 'doc_f', { local: true });
    
    // Switch to cloud mode (which will fail because mockDbMissing returns exists: false, so it falls back to local and finds it)
    firestoreService.__setMode(false, mockDbMissing);
    const retrieved = await firestoreService.getDocument('fallback_check', 'doc_f');
    expect(retrieved.local).toBe(true);

    // Restore mode
    firestoreService.__setMode(true, null);
  });

  // 18. Dashboard Service date filters with custom dates
  test('Dashboard Service should process logs from various past and future dates', async () => {
    const dashboardService = require('../services/dashboardService');
    const { calculatorService } = require('../services/calculatorService');
    
    const getPastDateStr = (daysAgo) => {
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      return d.toISOString().split('T')[0];
    };

    const mockDashboardLogs = [
      { date: getPastDateStr(0), total: 10, breakdown: { transport: 10, electricity: 0, food: 0, waste: 0 } },
      { date: getPastDateStr(5), total: 20, breakdown: { transport: 20, electricity: 0, food: 0, waste: 0 } },
      { date: getPastDateStr(15), total: 30, breakdown: { transport: 30, electricity: 0, food: 0, waste: 0 } },
      { date: getPastDateStr(100), total: 40, breakdown: { transport: 40, electricity: 0, food: 0, waste: 0 } },
      { date: getPastDateStr(400), total: 50, breakdown: { transport: 50, electricity: 0, food: 0, waste: 0 } }, // older than a year
      { date: getPastDateStr(-5), total: 60, breakdown: { transport: 60, electricity: 0, food: 0, waste: 0 } } // future date
    ];

    const spyLogs = jest.spyOn(calculatorService, 'getLogs').mockResolvedValue(mockDashboardLogs);
    const data = await dashboardService.getDashboardData('test-user');
    
    expect(data.daily.total).toBe(10);
    expect(data.weekly.total).toBe(30); // 10 + 20
    expect(data.monthly.total).toBe(60); // 10 + 20 + 30
    expect(data.yearly.total).toBe(100); // 10 + 20 + 30 + 40
    
    spyLogs.mockRestore();
  });

  // 19. Goal Service category and dates fallbacks and active status
  test('Goal Service should handle missing fields and update goals without completing them', async () => {
    const goalService = require('../services/goalService');
    const testGoal = await goalService.createGoal('test-user', {
      title: 'Minimal Goal',
      targetValue: 100, // targetValue must be > 0 to test active status
      currentValue: null,
      endDate: '2026-12-31'
    });
    
    expect(testGoal.category).toBe('general');
    expect(testGoal.startDate).toBeDefined();
    
    // Update goal progress with missing currentValue (falls back to 0, which is < 100, so remains active)
    const updated = await goalService.updateGoalProgress('test-user', testGoal.id, null);
    expect(updated.status).toBe('active');
    expect(updated.currentValue).toBe(0);
    
    await goalService.deleteGoal('test-user', testGoal.id);
  });

  // 20. Habit Service missing value/factor/date fallbacks
  test('Habit Service should handle default values and log successfully', async () => {
    const habitService = require('../services/habitService');
    
    const habitLog = await habitService.logHabit('test-user', {
      habitType: 'unknown_habit_type', // should fall back to factor 0
      value: null,
      date: null
    });
    
    expect(habitLog.carbonSaved).toBe(0);
    expect(habitLog.date).toBeDefined();
    
    await habitService.deleteHabitLog('test-user', habitLog.id);
  });

  // 21. Insights Service unknown primary source fallback
  test('Insights Service should handle unknown/custom primary source categories gracefully', async () => {
    const insightsService = require('../services/insightsService');
    const dashboardService = require('../services/dashboardService');

    const mockDashboard = {
      weekly: {
        total: 10,
        breakdown: { unknown_category: 10, transport: 0, electricity: 0, food: 0, waste: 0 }
      }
    };

    const spyDash = jest.spyOn(dashboardService, 'getDashboardData').mockResolvedValue(mockDashboard);
    const res = await insightsService.getInsights('test-user');
    expect(res.length).toBe(1); // will push exactly electricity[0] due to length < 3
    spyDash.mockRestore();
  });

  // 22. New Insights Roadmap and Report Endpoint tests
  test('GET /api/insights/roadmap should return active 30-60-90 roadmap plan', async () => {
    const res = await request(app)
      .get('/api/insights/roadmap')
      .set('x-user-id', mockUserId);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.roadmap30).toBeDefined();
    expect(res.body.data.roadmap60).toBeDefined();
    expect(res.body.data.roadmap90).toBeDefined();
  });

  test('GET /api/insights/report should generate downloadable sustainability text report', async () => {
    const res = await request(app)
      .get('/api/insights/report')
      .set('x-user-id', mockUserId);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.reportText).toContain('C.A.R.B.O.N+ SUSTAINABILITY REPORT');
  });

  test('insightsService.getRoadmap should fall back to local roadmap generator on API error', async () => {
    const insightsService = require('../services/insightsService');
    
    // Set mock Gemini API Key
    const originalApiKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = 'mock-invalid-key-to-trigger-http';

    // Mock https.request to simulate network failure or API error
    const https = require('https');
    const mockRequestObj = {
      on: jest.fn(),
      write: jest.fn(),
      end: jest.fn()
    };
    const spyRequest = jest.spyOn(https, 'request').mockImplementation((options, cb) => {
      // Trigger error event to simulate call failure
      process.nextTick(() => {
        const errorFn = mockRequestObj.on.mock.calls.find(c => c[0] === 'error');
        if (errorFn) errorFn[1](new Error('Mock network failure'));
      });
      return mockRequestObj;
    });

    const roadmap = await insightsService.getRoadmap('test-user');
    expect(roadmap.roadmap30).toBeDefined();
    expect(roadmap.roadmap60).toBeDefined();

    // Clean up
    spyRequest.mockRestore();
    process.env.GEMINI_API_KEY = originalApiKey;
  });
});

