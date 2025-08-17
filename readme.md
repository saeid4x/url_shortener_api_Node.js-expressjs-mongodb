# URL Shortener API

A clean and efficient microservice for creating short, unique aliases for long URLs, similar to services like Bit.ly. Built with Node.js and Express, this API is designed for speed and reliability.

---

## ✨ Features

-   **Short URL Generation:** Creates a unique, random short code for any given long URL.
-   **Fast Redirection:** Quickly redirects users from the short URL to the original destination.
-   **Click Tracking:** (Optional) Can be extended to count the number of times a short URL is accessed.
-   **RESTful Design:** Simple and intuitive API endpoints.
-   **No Authentication Required:** Designed as a public-facing, simple utility.

---

## 🛠️ Technologies Used

-   **Backend:** Node.js, Express.js
-   **Database:** MongoDB (to store the mapping between short and long URLs).
-   **Utilities:** `nanoid` or a similar library for generating unique short IDs.

---

## 🚀 Getting Started

### Prerequisites

-   Node.js (v14 or higher)
-   MongoDB instance

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/url-shortener-api.git](https://github.com/your-username/url-shortener-api.git)
    cd url-shortener-api
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root directory:
    ```env
    PORT=3000
    MONGODB_URL=mongodb://localhost:27017/url-shortener-db
    BASE_URL=http://localhost:3000
    ```

4.  **Run the server:**
    ```bash
    npm start
    ```
    The server is now live.

---

## 🔌 API Endpoints

| Method | Endpoint         | Description                                        |
| :----- | :--------------- | :------------------------------------------------- |
| `POST` | `/api/shorten`   | Create a short URL. Body: `{ "longUrl": "..." }`   |
| `GET`  | `/:shortCode`    | Redirect to the original long URL.                 |

### Example Usage

1.  **Shorten a URL:**
    -   **Request:** `POST /api/shorten` with body `{"longUrl": "https://www.google.com/search?q=very-long-query"}`
    -   **Response:** `{"shortUrl": "http://localhost:3000/aB1cDef"}`

2.  **Access the short URL:**
    -   Visiting `http://localhost:3000/aB1cDef` in a browser will redirect you to the original long URL.