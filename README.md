# ParkSmart

ParkSmart is a web application that helps users conveniently search for parking spaces, check real-time rates, and make easy payments. It also provides favorite features and user account management for a personalized experience.

## Key Features

*   **Diverse Parking Option Filtering:** Filter searches by various conditions such as regular parking, motorcycle-only parking, and disabled parking zones.
*   **Real-time Rate Information:** Check time-based rate information for selected parking spaces.
*   **Real-time Parking Status Check and Management:** Monitor current parking status (remaining time, total cost) and extend or stop parking sessions.
*   **Easy Payment System:** Pay parking fees through various payment methods including credit cards within the application.
*   **Favorites:** Add frequently used parking spaces to favorites for quick access.
*   **User Account Management:** Features for user registration, login, password recovery, and profile modification.
*   **Email Verification:** Enhanced account security through email verification during registration.

## Technology Stack

*   **Backend:**
    *   Node.js
    *   Express.js
    *   MySQL (or Mock Database - for testing)
    *   `bcrypt`: Password encryption
    *   `express-session`: Session management
    *   `nodemailer`: Email sending
    *   `dotenv`: Environment variable management
    *   Python: (Data scraping and processing scripts - `scrape_pdf_rates_qwer.py`, `scrape_rateqertwr.py`, `deep.py`, `etl.py`)
*   **Frontend:**
    *   HTML, CSS, JavaScript
    *   Tailwind CSS: UI styling
    *   Mapbox GL JS: Map visualization
*   **Database:**
    *   MySQL
    *   SQL (Schema setup and migration)
*   **Others:**
    *   Git: Version control

## Folder Structure

```
.
├── .git/                       # Git version control
├── .idea/                      # IntelliJ IDEA settings (optional)
├── .venv/                      # Python virtual environment (optional)
├── api/
│   ├── favorites.js            # Favorites API router
│   ├── meters.js               # Parking meter API router
│   └── payment.js              # Payment API router
├── node_modules/               # Node.js packages
├── public/
│   ├── asset/                  # Images, icons, and other static assets
│   ├── scripts/
│   │   ├── action_btn.js       # Action button script (for map.html)
│   │   ├── authentication.js   # User authentication frontend script
│   │   ├── filter.js         # Filtering functionality script (for map.html)
│   │   ├── main.js           # Main page script
│   │   ├── map.js            # Map and core functionality script for map.html
│   │   ├── navigation_bar.js # Common bottom navigation bar script
│   │   ├── payment.js        # Payment page script
│   │   └── status.js         # Status page and timer script
│   ├── main.html               # Main page
│   ├── map.html                # Map search page
│   ├── favorite.html           # Favorites page
│   ├── status.html             # Current parking status page
│   ├── paymentpage.html        # Payment information input page
│   ├── paymentconfirmpage.html # Payment confirmation page
│   ├── paymentsuccesspage.html # Payment success page
│   ├── login.html              # Login page
│   ├── signup.html             # Registration page
│   ├── forgotpassword.html     # Password recovery request page
│   ├── reset_password.html     # Password reset page
│   ├── setting.html            # User settings page
│   ├── motorcycle-parking.json # Motorcycle parking data
│   ├── disability-parking.json # Disabled parking data
│   └── timer.js                # Timer logic (appears to be integrated into status.js)
├── .DS_Store                   # macOS system file (Git ignore target)
├── .gitignore                  # Git ignore file list
├── README.md                   # Project description and guide (current file)
├── app.js                      # Express application main file (server logic and routing)
├── db-setup.sql                # Database table creation script
├── meter_rates.csv             # Parking rates CSV data
├── package-lock.json           # npm dependency lock file
├── package.json                # npm project settings and dependency list
├── settings_backend.js         # Settings backend logic (estimated)
├── style.css                   # Common CSS (can be used alongside Tailwind)
├── tailwind.config.js          # Tailwind CSS configuration
├── update-db.js                # Database update script (estimated)
├── security.html               # (Consider moving to public folder)
├── email.html                  # (Consider moving to public folder)
├── help_and_support.html       # (Consider moving to public folder)
├── password.html               # (Consider moving to public folder)
├── add_a_card.html             # (Consider moving to public folder)
├── scrape_pdf_rates_qwer.py    # Python data scraping script
├── scrape_rateqertwr.py      # Python data scraping script
├── deep.py                     # Python data processing script (estimated)
└── etl.py                      # Python ETL script
```

## Installation and Running Instructions

1.  **Clone Repository:**
    ```bash
    git clone https://github.com/yddobyb/2800-202510-DTC14.git
    cd 2800-202510-DTC14
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Database Setup:**
    *   Prepare MySQL database.
    *   Run `db-setup.sql` to create necessary tables.

4.  **Environment Variables Setup:**
    *   Create a `.env` file in the root directory.
    *   Set required environment variables in the following format (replace with actual values):
        ```
        DB_HOST=localhost
        DB_PORT=3306
        DB_USER=your_db_user
        DB_PASSWORD=your_db_password
        DB_NAME=parksmart_db
        SESSION_SECRET=your_strong_session_secret
        SMTP_HOST=your_smtp_server_host
        SMTP_PORT=your_smtp_server_port
        SMTP_USER=your_smtp_email_address
        SMTP_PASS=your_smtp_email_password
        ```

5.  **Run Application:**
    *   Run in development mode (using nodemon - auto-restart on file changes):
        ```bash
        npm run dev
        ```
    *   Run in production mode:
        ```bash
        npm start
        ```

6.  **Access Application:**
    Open a web browser and navigate to `http://localhost:PORT` (PORT is the port number set in `app.js` or environment variables, typically 3000 or a specified port).

## Data Scripts (Optional)

The project includes Python scripts (`scrape_pdf_rates_qwer.py`, `scrape_rateqertwr.py`, `deep.py`, `etl.py`) and a CSV file (`meter_rates.csv`) for collecting and processing parking rate data. These scripts can be used to update parking data as needed.

## Future Improvement

*   **Real-time Available Spaces Display:** Integrate with APIs to show real-time availability of parking spaces.
*   **Reservation Feature:** Add functionality to reserve parking spaces for specific time slots.
*   **Extended Payment Methods:** Support more payment options.
*   **Admin Dashboard:** Develop an admin page for managing parking space information, users, and payment history.

