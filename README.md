# ParkSmart

## Project Description
ParkSmart is a web application that helps users conveniently search for parking spaces, check real-time rates, and make easy payments. It also provides favorite features and user account management for a personalized experience.

## Key Features
- **Diverse Parking Option Filtering:** Filter searches by various conditions such as regular parking, motorcycle-only parking, and disabled parking zones.
- **Real-time Rate Information:** Check time-based rate information for selected parking spaces.
- **Real-time Parking Status Check and Management:** Monitor current parking status (remaining time, total cost) and extend or stop parking sessions.
- **Easy Payment System:** Pay parking fees through various payment methods including credit cards within the application.
- **Favorites:** Add frequently used parking spaces to favorites for quick access.
- **User Account Management:** Features for user registration, login, password recovery, and profile modification.
- **Email Verification:** Enhanced account security through email verification during registration.

## Technology Stack
- **Backend:**
  - Node.js
  - Express.js
  - MySQL
  - Python (Data processing scripts)
- **Frontend:**
  - HTML, CSS, JavaScript
  - Tailwind CSS
  - Mapbox GL JS
- **Database:**
  - MySQL
- **Development Tools:**
  - Git
  - VS Code (recommended)

## Installation Guide

### Prerequisites
1. Required Software:
   - Node.js (v14 or higher)
   - MySQL (v8.0 or higher)
   - Python 3.x
   - Git
   - Code Editor (VS Code recommended)

2. Required Accounts and API Keys:
   - Mapbox API key
   - SMTP server access for email functionality

### Installation Steps
1. **Clone the Repository**
   ```bash
   git clone https://github.com/yddobyb/2800-202510-DTC14.git
   cd 2800-202510-DTC14
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment**
   Create a `.env` file in the root directory with:
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
   MAPBOX_API_KEY=your_mapbox_api_key
   ```

4. **Database Setup**
   ```bash
   mysql -u your_username -p your_database < db-setup.sql
   ```

5. **Run the Application**
   ```bash
   npm run dev  # Development mode
   # or
   npm start    # Production mode
   ```

## Project Structure
```
.
├── api/                # API routes and controllers
├── public/            # Frontend files
│   ├── asset/        # Static assets
│   ├── scripts/      # JavaScript files
│   └── *.html        # HTML pages
├── node_modules/     # Node.js packages
├── app.js           # Express application
├── db-setup.sql     # Database setup
└── Python scripts   # Data processing
```

## API and Services Usage
- **Mapbox API:** Used for map visualization and location services
- **SMTP Service:** Used for email verification and notifications
- **MySQL Database:** Used for data persistence and management
- **Express.js:** Web application framework
- **Nodemailer:** Email service
- **Bcrypt:** Password hashing
- **CSRF:** Cross-site request forgery protection

## Contact Information
For any questions or support, please contact:
- GitHub: [yddobyb](https://github.com/yddobyb)

## License
This project is licensed under the MIT License.
