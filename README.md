<div align="center">
  <img src="public/assets/costpilotgithublogo.png" alt="CostPilot Logo" width="800">
</div>
<p align="center">
  <strong>Live Demo: <a href="https://www.costpilot.vercel.app">https://www.costpilot.vercel.app</a></strong>
</p>

## Table of Contents
- [1. Introduction](#1-introduction)
- [2. Key Features](#2-key-features)
- [3. UN Sustainable Development Goals (SDGs)](#3-un-sustainable-development-goals-sdgs)
- [4. Technical Deep Dive](#4-technical-deep-dive)
- [5. Core Innovations](#5-core-innovations)
- [6. Challenges Faced & Engineering Solutions](#6-challenges-faced--engineering-solutions)
- [7. Setup Instructions](#7-setup-instructions)
- [8. Future Roadmap](#8-future-roadmap)

---

## 1. Introduction
CostPilot is a financial optimization platform designed to help users manage their money smarter. Beyond tracking expenses, it intelligently optimizes across **transport, lifestyle, and accommodation**, while also integrating **subsidies you may qualify for but didn’t know existed**. With AI-guided savings and investment options, CostPilot empowers users to set **smart goals** and achieve wealth targets with personalized strategies.

---

## 2. Key Features
- **Financial Stress Score**  
  Measure how well your spending aligns with your income.

- **Optimization Engine (AI-powered)**  
  - **Transport**: Suggests cost-saving and faster travel routes.  
  - **Accommodation**: Explore financially better areas if you’re open to relocating.  
  - **Subsidies**: Automatically matches Malaysian subsidies to your profile and shows how they impact your financial breakdown.  
  - **Lifestyle**: Integrates cost-saving options into your daily routine.

- **What if EV?**  
  Compare your current vehicle costs with potential EV ownership. AI projects how your finances would change if you switch to an electric vehicle.

- **Wealth+**  
  Define short/long-term wealth goals with your risk appetite (conservative, moderate, aggressive). AI generates intelligent action plans with optimized monthly allocations, showing key financial metrics like **return on equity, dividend yield, and interest rates**.

- **Smart Goals Dashboard**  
  Track financial goals in a unified dashboard with clear breakdowns and progress visualization.

---

## 3. UN Sustainable Development Goals (SDGs)
CostPilot contributes to global sustainability by aligning with key UN SDGs:
- **SDG 1: No Poverty**: By uncovering hidden subsidies (STR, SARA, Budi Madani) and suggesting lower-cost relocation areas to help families stay financially afloat.
- **SDG 8: Decent Work & Economic Growth**: By promoting structured saving and connecting users to local equity markets (Bursa Malaysia shares), driving national investment.

---

## 4. Technical Deep Dive

CostPilot is engineered with a **Hybrid Reasoning Architecture**, separating critical financial arithmetic from cognitive reasoning. This ensures 100% mathematical accuracy while providing nuanced, AI-driven guidance.

### 🧠 AI & Intelligent Insights (Gemini Implementation)
The "Brain" of CostPilot is built on **Gemini 2.0 Flash**, optimized for low-latency decision support.

- **Dynamic Grounding with Google Search**: 
  We leverage Gemini's native search tools to bridge the "knowledge cutoff" gap. The engine fetches **real-time Bursa Malaysia stock prices** and **ASNB Net Asset Values (NAV)** during strategy generation, ensuring investment plans are based on today's market, not training data.
- **Structured JSON Output & Prompt Engineering**: 
  The backend utilizes strict multi-step prompt templates that enforce a specific JSON schema. This prevents "model drift" and ensures that the AI’s qualitative advice (e.g., "Relocate to Setia Alam") is always accompanied by quantitative valid data for the frontend to render.
- **Fail-Safe Fallback Logic**: 
  To ensure 99.9% uptime for KitaHack, we implemented an `explainFallback.js` layer. If the LLM encounter rate limits or network issues, the system gracefully reverts to a deterministic recommendation engine that uses static financial logic.

### 🛡️ TypeScript & State Management (The Skeleton)
CostPilot is built with a **Strict Type-System** to eliminate runtime errors in financial calculations.

- **Centralized Schema Architecture**: 
  All financial entities—`UserProfile`, `SmartGoal`, `WealthPlusStrategy`, and `AnalysisResult`—are defined as strict TypeScript interfaces in `types.ts`. This ensures that every component, from the Dashboard to the EV Comparison Card, consumes data in a predictable, standardized format.
- **Reactive State with React Context API**: 
  The application utilizes a hierarchical context system:
  - `UserProvider`: Synchronizes the local UI state with **Firebase Cloud Firestore** using `onSnapshot` for real-time cost reflecting.
  - `AuthProvider`: Manages secure identity tokens and session persistence.
- **Financial Validation Pattern**: 
  We use TypeScript `enums` and `guards` to manage complex states مانند `ViewState` and `RiskAppetite` ('conservative' | 'moderate' | 'aggressive'). This prevents invalid permutations of investment advice.

### 🏗️ Backend Optimization & Scenarios
- **Deterministic Scoring Engine**: 
  The "Financial Stress Score" is NOT generated by AI. It is computed via a weighted algorithm (0.55 Expense Ratio, 0.25 Savings Buffer, 0.20 Debt Ratio) to ensure transparency and auditability.
- **What-If Simulation Logic**: 
  The app re-runs the entire financial engine recursively. When a user "Claims" a subsidy or "Applies" a lifestyle change, the engine updates the `UserContext`, triggering a global UI refresh of all sustainability scores.

### 🎨 Design System: "Liquid Glass"
The UI utilizes a custom design system built with **Tailwind CSS** and **Backdrop-Filter utilities**, creating a premium, semi-transparent aesthetic that provides a "high-fidelity cockpit" feel for financial navigation.

---

## 5. Core Innovations
- **Malaysian Grounding (Localization-as-a-Service)**: 
  Unlike generic financial apps, CostPilot is "Madani-Ready." It features a dedicated **Subsidy Intelligence Engine** that automatically cross-checks user profiles against real Malaysian criteria for **STR**, **SARA**, and **Budi Madani**.
- **The "What-If" Reality Simulation**: 
  Our most significant innovation is the recursive scoring loop. Users don't just see advice; they can "toggle" proposed lifestyle changes (e.g., *Switching to an EV* or *Relocating to Petaling Jaya*) and see their global Financial Stress Score update in real-time.
- **Cognitive Wealth+ Architect**: 
  We moved beyond simple savings calculators by building a system that interprets risk appetite through a localized lens—linking users directly to **Bursa Malaysia** assets and **ASNB** products with deep-link integration.

---

## 6. Challenges Faced & Engineering Solutions
- **AI Hallucinations**
  - **Challenge:** The AI sometimes hallucinates math, leading to incorrect budget totals.
  - **Solution:** Implemented **Hybrid Validation Middleware**. We calculate hard numbers deterministically in Node.js first, then pass them to Gemini as strict context, ensuring 100% mathematical accuracy.

- **Complex Global State Sync**
  - **Challenge:** Keeping the "Stress Score" and savings synchronized across 12+ different components without page refreshes or race conditions.
  - **Solution:** Built a **Reactive Pipeline** via a singleton `UserContext` and Firebase `onSnapshot`. Optimizing one category (e.g., Housing) instantly updates the entire dashboard in real-time.

- **Real-Time Data Latency**
  - **Challenge:** Fetching live market data for every user hit rate limits and slowed down the app.
  - **Solution:** Combined **Google Search Grounding** with a **Dynamic Caching Layer** to batch requests, ensuring the Wealth+ engine stays fast and market-accurate without overloading APIs.

---

## 7. Setup Instructions

### Prerequisites

Before running the project locally, ensure you have the following installed:

- **Node.js** (v18 or higher) — https://nodejs.org/
- **npm** (comes with Node.js)
- A **Gemini API Key** — https://aistudio.google.com/app/apikey

### 1. Clone the Repository

```bash
git clone https://github.com/Sanjeevan13/costpilot.git
cd costpilot
```

### 2. Install Frontend Dependencies
From the root directory:
```bash
npm install
```

### 3. Install Backend Dependencies
```bash
cd backend
npm install
cd ..
```

### 4. Configure Environment Variables
Create a .env file inside the backend/ folder:
```
backend/.env
```
Add the following:
```env
PORT=3001
GEMINI_API_KEY=your_gemini_api_key_here
```
Important:
> Replace `your_gemini_api_key_here` with your actual Gemini API key.

### 5. Run the Application
From the root directory, start both frontend and backend concurrently:
```bash
npm run dev
```
This will launch:
| Service  | URL                                            |
| -------- | ---------------------------------------------- |
| Frontend | http://localhost:3000 |
| Backend  | http://localhost:3001 |

---

## 8. Future Roadmap
CostPilot is continuously evolving to provide a more holistic financial safety net. Our upcoming milestones include:
- **Automated Expense Ingestion:** Include integration for daily spending tracking by collaborating with DuitNow, PayNet, and major Malaysian banks through open banking APIs.
- **Micro-Investing Engine:** Automatically round up daily purchases and funnel the spare change into user-selected ASNB funds or safe-haven Robo-advisor portfolios.
- **Real-Time Property & Grocery Comparisons:** Integrate with leading property websites and online groceries to provide instant, localized cost comparisons for rent and daily essentials directly within the optimizer.
- **Smart Debt Consolidation:** Introduce an active debt-restructuring AI module that negotiates and calculates the optimal payoff strategies for PTPTN, credit cards, and personal loans versus utilizing EPF Account 2 withdrawals.

---
Built with ❤️ by **Team TVK** for **KitaHack 2026**


