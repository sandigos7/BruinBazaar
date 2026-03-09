# BruinBazaar

A marketplace platform for UCLA students to buy and sell items.

## Project Structure

- `frontend/` - React application with Vite
- `backend/` - Firebase configuration and rules

## Getting Started

### Prerequisites

- Node.js
- Firebase CLI

### Installation

1. Clone the repository
2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Set up Firebase:
   - Copy `.env.example` to `.env` and fill in your Firebase config
   - Initialize Firebase project if needed

### Running the Application

1. Start the development server from the root directory:
   ```bash
   npm run dev
   ```
   Or manually from the frontend directory:
   ```bash
   cd frontend
   npm run dev
   ```
2. Build for production:
   ```bash
   npm run build
   ```
3. Deploy to Firebase:
   ```bash
   npm run firebase:deploy
   ```

## Contributing

Please read the PRD.md for project details and CursorRules.md for coding guidelines.