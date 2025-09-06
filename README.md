# Hospital Management System

A comprehensive web-based application designed to streamline and manage various operations within a hospital environment. This system aims to improve efficiency in patient management, appointment scheduling, staff administration, and more.

## Features

*   **Patient Management:** Register new patients, view patient details, update records.
*   **Appointment Scheduling:** Schedule, view, and manage patient appointments.
*   **Staff Management:** Manage hospital staff information, roles, and access.
*   **Database Integration:** Persistent storage for all hospital data.
*   **User-Friendly Interface:** Intuitive and responsive design for easy navigation.

## Technologies Used

This project is built using a modern stack, combining robust backend services with a dynamic frontend.

### Frontend

*   **React:** A JavaScript library for building user interfaces.
*   **TypeScript:** A typed superset of JavaScript that compiles to plain JavaScript.
*   **Vite:** A fast build tool that provides a lightning-fast development experience.
*   **Tailwind CSS:** A utility-first CSS framework for rapidly building custom designs.

### Backend

*   **Python:** The primary language for the backend logic.
*   **FastAPI:** A modern, fast (high-performance) web framework for building APIs with Python 3.7+ based on standard Python type hints.
*   **SQLite:** A C-language library that implements a small, fast, self-contained, high-reliability, full-featured, SQL database engine.

### Server

*   **Node.js:** A JavaScript runtime built on Chrome's V8 JavaScript engine, used for an additional server component (e.g., proxy, authentication, or specific services).

## Setup and Installation

Follow these steps to get the Hospital Management System up and running on your local machine.

### Prerequisites

Ensure you have the following installed:

*   **Node.js** (LTS version recommended) & **npm** (comes with Node.js) or **Yarn**
*   **Python 3.8+**
*   **pip** (Python package installer, comes with Python)

### 1. Clone the Repository

```bash
git clone https://github.com/aysha-dheesan-banu/hospital-managelment-system.git
cd hospital-managelment-system
```

### 2. Backend Setup

Navigate to the `backend` directory, install dependencies, and run the server.

```bash
cd backend
pip install -r requirements.txt # Assuming a requirements.txt exists or will be created
uvicorn main:app --reload # To run the FastAPI application
```

*Note: If `requirements.txt` does not exist, you might need to manually install dependencies like `fastapi`, `uvicorn`, `sqlalchemy`, etc. based on the `backend/main.py` and `backend/database.py` files.*

### 3. Frontend Setup

Navigate to the project root, install dependencies, and start the development server.

```bash
cd .. # Go back to the project root if you are in the backend directory
npm install # or yarn install
npm run dev # or yarn dev
```

The frontend application will typically run on `http://localhost:5173`.

### 4. Server Setup (Node.js)

Navigate to the `server` directory, install dependencies, and start the Node.js server.

```bash
cd server
npm install # or yarn install
node server.js
```

The Node.js server will typically run on `http://localhost:3000`.

## Usage

Once all components (Backend, Frontend, and Node.js Server) are running:

1.  Open your web browser and navigate to the frontend application (e.g., `http://localhost:5173`).
2.  Interact with the application to manage patients, appointments, and staff.
3.  The backend API will be accessible at `http://localhost:8000` (or specified port by uvicorn).
4.  The Node.js server will be accessible at `http://localhost:3000`.

## Contributing

Contributions are welcome! If you'd like to contribute, please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes and commit them (`git commit -m 'Add some feature'`).
4.  Push to the branch (`git push origin feature/your-feature-name`).
5.  Open a Pull Request.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
