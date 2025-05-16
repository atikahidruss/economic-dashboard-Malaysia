````markdown
# Malaysia Economic Dashboard

This is a full-stack web application that visualizes Malaysia's economic data. The application uses a **Node.js backend** and a **React frontend**.

## Getting Started

Follow the steps below to run the application locally:

### 1. Start the Backend Server

Open your terminal and navigate to the `backend` directory:

```bash
cd backend
node server.js
````

This will start the backend server using Node.js.

### 2. Start the Frontend Application

Open another terminal window and navigate to the `frontend` directory:

```bash
cd frontend
npm install       # Run this only once to install dependencies
npm start
```

This will start the React frontend, usually accessible at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
malaysia-economic-dashboard/
├── backend/
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   └── package.json
└── README.md
```

## Notes

* The frontend communicates with the backend server, so make sure both are running for full functionality.
