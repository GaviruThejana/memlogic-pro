Live Public Link-
           memlogic-ro7yc41yr-gaviru.vercel.app

🧠 MemLogic Pro
MemLogic Pro is an interactive, visual web application built to simulate and analyze Operating System Page Replacement Algorithms. Designed with Next.js, TypeScript, and modern UI components, it delivers real-time visualization, step-by-step analytics, and dynamic metric comparisons.

✨ Features
Interactive Page Replacement Visualizations: Real-time tracking of page frames, page faults, and hits for standard algorithms (FIFO, LRU, Optimal, etc.).

Step-by-Step Execution: Step forward/backward through reference strings to observe frame states at any point in time.

Performance Analytics Dashboard: Comparative graphs and tables highlighting hit rates, fault rates, and execution metrics.

Responsive UI: Modern design built with React and Tailwind CSS.

Production-Ready CI/CD: Fully containerized with Docker and integrated with GitHub Actions for automated linting, building, and registry deployment.

🏗️ Tech Stack & Architecture
Frontend Framework: Next.js (App Router), React, TypeScript

Styling & UI: Tailwind CSS

Containerization: Docker (Multi-stage build)

CI/CD Pipeline: GitHub Actions (Automated Linting, Production Build, Docker Hub Push)

🚀 Getting Started
Prerequisites
Node.js (v20 or higher)

Docker (Optional, for running via container)

Local Development Setup
Clone the repository:

Bash
git clone https://github.com/GaviruThejana/memlogic-pro.git
cd memlogic-pro
Install dependencies:

Bash
npm install
Run the development server:

Bash
npm run dev
Open http://localhost:3000 in your browser.

🐳 Running with Docker
1. Build & Run Locally
Bash
# Build the Docker image
docker build -t memlogic-pro .

# Run the container
docker run -p 3000:3000 memlogic-pro
2. Pull from Docker Hub
Bash
docker pull <your-dockerhub-username>/memlogic-pro:latest
docker run -p 3000:3000 <your-dockerhub-username>/memlogic-pro:latest
🔄 CI/CD Pipeline
This project uses GitHub Actions for Continuous Integration:

Lint & Code Quality: Runs npm run lint on every push.

Build Verification: Executes npm run build to ensure type safety and production readiness.

Automated Docker Image Build: Compiles a production Docker image.

Registry Push: Authenticates and pushes the updated image to Docker Hub.
