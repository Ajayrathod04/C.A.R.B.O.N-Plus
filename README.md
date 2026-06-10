# C.A.R.B.O.N+ (Carbon Awareness, Reduction & Behavioral Optimization Navigator)

Measure. Understand. Reduce.

C.A.R.B.O.N+ is a production-grade, highly responsive Carbon Footprint Awareness Web Application that helps individuals compute, monitor, and reduce their greenhouse gas emissions through custom analytics, green habits log, and personalized sustainability feedback.

---

## 1. Problem Statement
Global greenhouse gas emissions continue to rise, accelerating climate change. While many individuals want to help, they lack clear visibility into which everyday activities (such as driving a car, home energy usage, dietary habits, and waste disposal) contribute the most. Without actionable tracking and tangible reduction goals, sustainable behavioral shifts remain difficult to achieve.

## 2. Solution Overview
C.A.R.B.O.N+ solves this by providing:
- An intuitive, multi-lingual Carbon Footprint Calculator.
- Real-time aggregations (Daily, Weekly, Monthly, Yearly footprints).
- Interactive, responsive analytics to trace trends and habit offsets.
- Actionable target goals and a gamified Green Habit tracker to cultivate sustainable behaviors.
- Highly scalable, fail-safe cloud integration ready to deploy on GCP Cloud Run.

---

## 3. System Architecture Diagram

```mermaid
graph TD
  User([User Web Browser]) <--> |HTTP/HTTPS| Frontend[React SPA Frontend]
  Frontend <--> |REST API Requests| Backend[Express.js API Backend]
  
  subgraph Backend Services
    Config[Config Layer]
    Routes[Routes Router]
    Controllers[Controllers Layer]
    Validators[Validator Middleware]
    Sanitize[Sanitizer Middleware]
    Logger[Structured Winston Logger]
    ErrorHandler[Global Error Handler]
    
    Calculator[Calculator Service]
    Dashboard[Dashboard Service]
    Analytics[Analytics & Score Service]
    Goals[Goals Service]
    Habits[Habits Service]
    
    FirestoreDB[Google Cloud Firestore]
    MemoryDB[In-Memory Local Mock Database]
  end

  Backend --> Sanitize --> Validators --> Routes --> Controllers
  Controllers --> Calculator & Dashboard & Analytics & Goals & Habits
  
  Calculator & Goals & Habits --> FirestoreDB
  FirestoreDB -.-> |Connection Failure Fallback| MemoryDB
```

For in-depth details, see the [Architecture Guide](docs/ARCHITECTURE.md).

---

## 4. Features & Key Modules
1. **Carbon Footprint Calculator**: Estimates emissions across Transportation, Electricity, Diet, and Waste.
2. **Personal Carbon Dashboard**: Aggregates footprint metrics for multiple periods (Daily, Weekly, Monthly, Yearly).
3. **Green Habit Tracker**: Log environmental actions (walking, recycling) to offset emissions.
4. **Carbon Reduction Goals**: Establish targets, track progress bars, and earn completions.
5. **Eco Score & Impact Analytics**: Dynamic HSL color indicators and weekly SVG trend graphs.
6. **Personalized Insights**: Suggests improvements targeted at the user's highest emission sources.
7. **10 Regional Languages**: Seamless multi-language support (English, Hindi, Marathi, Tamil, Telugu, Kannada, Gujarati, Punjabi, Bengali, Urdu).

---

## 5. Google Services Integration
- **Google Cloud Firestore**: Primary database for logs, goals, and habits. Built with a robust fail-safe mechanism: if GCP config is missing, it seamlessly redirects writes/reads to local in-memory storage without crash.
- **Google Cloud Run**: Container-ready configurations using a multi-stage Docker build, exposing standard environment ports.
- **Google Cloud Logging**: Winston structured logger outputting production logs to console in native JSON format for automated stackdriver ingestion.

---

## 6. Key API Endpoints
- `GET /api/health` - Health state and active database connection report.
- `POST /api/calculator` - Calculates and stores daily footprints.
- `GET /api/dashboard` - Returns grouped totals and logs history.
- `POST /api/goals` - Sets a carbon reduction target.
- `POST /api/habits` - Logs eco-friendly habits and carbon saved.
- `GET /api/analytics` - Fetches Eco Score and weekly SVG trend data.

For a full endpoint list, see the [API Reference Guide](docs/API_REFERENCE.md).

---

## 7. Security & Input Sanitization
- **Helmet Headers**: Blocks script injection and browser exploits.
- **API Rate Limiting**: Throttles rapid API requests.
- **CORS Policies**: Restricts API calls to approved origins.
- **Input Sanitization**: Custom middleware recursively strips HTML/Script tags to mitigate XSS attacks.
- **Secrets Protection**: Configured strictly through environment variables.

---

## 8. Development & Deployment Steps

### Quick Start (Local)
1. **Build Frontend**:
   ```bash
   cd frontend
   npm install
   npm run build
   ```
2. **Launch Backend**:
   ```bash
   cd ../backend
   npm install
   npm start
   ```
3. Open `http://localhost:8080` in your browser.

For containerized and GCP deployment guides, see the [Deployment Guide](docs/DEPLOYMENT.md) and [Cloud Run Deployment Guide](docs/CLOUD_RUN_GUIDE.md).

---

## 9. Testing Suite
The backend features Jest and Supertest unit and integration test coverage:
- **Run tests**: `npm run test` (executed from the `backend/` directory).
- **Target coverage**: 90%+ line coverage across all files.

For full testing configurations, see the [Testing Guide](docs/TESTING.md).

---

## 10. Future Scope
- **IoT Smart Meter Integration**: Pull electricity consumption stats automatically.
- **GPS Commute Tracking**: Log commuting distances in the background.
- **Community Sustainability Leagues**: Leaderboards to encourage green habits collectively.
