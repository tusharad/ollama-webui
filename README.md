# Ollama WebUI

**Ollama WebUI** is a web-based user interface for interacting with the Ollama backend, which manages and stores chat history. This project is structured as a monorepo, consisting of two main components:
1. **Frontend**: Built with React, providing a sleek and user-friendly UI.
2. **Backend**: Built with Haskell using the Scotty framework, responsible for storing chats in a SQLite3 database.

## Features

- Web UI to interact with the Ollama chat backend.
- Backend API for storing and managing chats.
- Frontend written in React.
- Backend powered by Haskell with the Scotty framework.
- SQLite3 database integration for storing chat history.
- Backend utilizes a custom Haskell library: **ollama-haskell**.

## Getting Started

### Backend Setup

0. Make sure you have [ollama](https://ollama.com/) installed on your machine

1. Navigate to the backend directory:

   ```bash
   cd ollama-webui-be
   ```

2. Ensure you have **Stack** installed. If not, you can install it via [GHCup](https://www.haskell.org/ghcup/):

   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://get-ghcup.haskell.org | sh
   ```

3. Run the backend using **Stack**:

   ```bash
   stack run
   ```

   This command will:
   - Start the backend service.
   - Automatically set up the SQLite3 database.

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd ollama-web-ui
   ```

2. Ensure you have **npm** installed.

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Start the frontend development server:

   ```bash
   npm start
   ```

   > **Note**: Ensure that the backend is running on port `5000`. If the backend is running on a different port, update the necessary configuration in the React code.

## Project Structure

- `ollama-webui-be/`: Haskell backend using Scotty, handles the chat API and stores conversations in SQLite.
- `ollama-web-ui/`: React-based frontend that interacts with the backend.

## Dependencies

- **Frontend**:
  - React
  - Axios (or similar) for API requests

- **Backend**:
  - Haskell (Stack)
  - Scotty
  - SQLite3
  - **ollama-haskell** (Custom library)

## Contribution Guidelines

We welcome contributions! If you'd like to add features, fix bugs, or improve the documentation, feel free to submit a pull request or open an issue.

## Screenshot

![alt text](<demo ss.png>)

---

Feel free to reach out or open an issue if you encounter any problems. We appreciate your contributions to the Ollama WebUI!