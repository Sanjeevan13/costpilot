<div align="center">
  <img src="public/assets/costpilotgithublogo.png" alt="CostPilot Logo" width="800">
</div>


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

## 3. Overview of Google AI Tech Used
- **Gemini API** → Intelligent financial recommendations & predictive analysis  
- **Firebase** → Secure authentication & real-time database management  
- **Google Antigravity** → Prototype development and testing environment  

👉 Full technical implementation details are available in the **Project Documentation**.

---

## 4. UN Sustainable Development Goals (SDGs)
CostPilot contributes to global sustainability by aligning with key UN SDGs:
- **SDG 8: Decent Work & Economic Growth**  
  Encourages structured saving and investing by connecting financial services and shares in Malaysia.
- **SDG 1: No Poverty**  
  Helps users plan long-term saving goals and emergency funds, reducing risks of income mismanagement.

---

## 5. Setup Instructions
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
Built with ❤️ by **Team TVK** for **KitaHack 2026**


