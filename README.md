# Coffee App / Ad Experience

This project contains a premium coffee brand landing page with 3D animations (Three.js) and smooth scroll effects (GSAP), along with a backend API (Node.js/Express).

## structure

- **frontend/**: Static HTML/CSS/JS files for the user interface.
- **backend/**: Node.js Express server providing an API for products and orders.

## How to Run

### 1. Start the Backend
The backend serves the product data.

1. Open a terminal.
2. Navigate to the backend folder:
   ```sh
   cd backend
   ```
3. Install dependencies:
   ```sh
   npm install
   ```
4. Start the server:
   ```sh
   npm start
   ```
   Server will run on `http://localhost:5000`.

### 2. Run the Frontend
1. Open the `frontend` folder.
2. You can simply double-click `index.html` to open it in your browser.
   * *Note: For the best experience, use a local server (like Live Server in VS Code) to avoid any CORS warnings with local file access, though the code is designed to handle basic file opening.*

## Features
- **3D Hero Animation**: Interactive floating coffee theme using Three.js.
- **GSAP Animations**: Smooth scroll reveals and entrance animations.
- **API Integration**: Fetches product data from the backend.
- **Offline Fallback**: If backend isn't running, the frontend gracefully shows demo content.
