# C.A.R.B.O.N+ Testing Documentation

This document explains the testing setup, execution guidelines, and coverage targets.

## Testing Stack
- **Framework**: Jest
- **API Assertions**: Supertest (integration testing)
- **Coverage Tool**: Istanbul (built into Jest)

## Executing Tests

### Run All Tests
```bash
cd backend
npm run test
```

### Coverage Report
To view line-by-line coverage analysis:
```bash
npx jest --coverage
```

## Coverage Thresholds
The project maintains a strict target of **90%+ test coverage** across all files:
- Statements: 90%+
- Branches: 90%+
- Functions: 90%+
- Lines: 90%+

## What is Covered?
1. **Business Logic**: Input/Output calculations for emission factors (car commuting, household electricity, diet choices, waste disposal).
2. **Health Check**: Validation of service availability reporting.
3. **Firestore Fail-Safe**: Verification that if GCP authentication keys are absent, all database CRUD calls route dynamically to the in-memory fallback store without dropping user requests.
4. **Controllers & Routing**: Verification of request validation middleware, inputs sanitization, and structured HTTP responses.
