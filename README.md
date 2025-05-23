# ParkSmart

## Project Description
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
├── scrape_pdf_rates_qwer.py    # Python data scraping script
├── scrape_rateqertwr.py      # Python data scraping script
├── deep.py                     # Python data processing script (estimated)
└── etl.py                      # Python ETL script
```

## Installation and Running Instructions

### Prerequisites
1. Required Software:
   - Node.js (v14 or higher)
   - MySQL (v8.0 or higher)
   - Python 3.x
   - Git
   - Code Editor (VS Code recommended)

2. Required Accounts and API Keys:

   a. Mapbox API Key:
   - Sign up for a free account at [Mapbox](https://www.mapbox.com/)
   - Create a new access token in your Mapbox account dashboard
   - Add the token to your `.env` file:
     ```
     MAPBOX_API_KEY=your_mapbox_access_token
     ```
   - The token is used in `public/scripts/map.js` for map initialization

   b. SMTP Server Configuration:
   - Option 1: Use Gmail SMTP (Recommended for development)
     - Enable 2-factor authentication in your Gmail account
     - Generate an App Password:
       1. Go to Google Account Settings
       2. Security → App Passwords
       3. Select "Mail" and "Other (Custom name)"
       4. Name it "ParkSmart"
       5. Copy the generated 16-character password
     - Add to `.env` file:
       ```
       SMTP_HOST=smtp.gmail.com
       SMTP_PORT=587
       SMTP_USER=your_gmail_address
       SMTP_PASS=your_app_password
       ```

   - Option 2: Use other SMTP providers (for production)
     - Services like SendGrid, Amazon SES, or Mailgun
     - Follow their specific setup instructions
     - Update the SMTP settings in `.env` accordingly

   Note: The SMTP configuration is used in the backend for:
   - Email verification during registration
   - Password reset functionality
   - Important notifications

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yddobyb/2800-202510-DTC14.git
   cd 2800-202510-DTC14
   ```

2. **Install Node.js Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Python Environment**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

4. **Database Setup**
   - Install MySQL
   - Create a new database
   - Run the setup script:
     ```bash
     mysql -u your_username -p your_database < db-setup.sql
     ```

5. **Environment Configuration**
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

6. **Run the Application**
   ```bash
   npm run dev  # Development mode
   # or
   npm start    # Production mode
   ```

## Features
- Diverse Parking Option Filtering
- Real-time Rate Information
- Real-time Parking Status Check and Management
- Easy Payment System
- Favorites Management
- User Account Management
- Email Verification

## Credits and References
- Mapbox GL JS for map visualization
- Tailwind CSS for UI components
- Express.js documentation
- MySQL documentation

## AI and API Usage

### Mapbox API Integration
- **Purpose**: Core mapping and location services
- **Features Used**:
  - Interactive map visualization
  - Geocoding for address search
  - Custom markers for different parking types:
    - Regular parking (default markers)
    - Motorcycle parking (orange markers)
    - Disability parking (blue markers)
  - Real-time location tracking
  - Custom popups with parking information
- **Implementation**: 
  - Used in `public/scripts/map.js` for map initialization and management
  - Integrated with `public/scripts/action_btn.js` for location tracking
  - Custom styling and marker colors for different parking types

### SMTP Service Integration
- **Purpose**: Email verification and notifications
- **Features Used**:
  - Email verification during registration
  - Password reset functionality
  - Account security notifications
- **Implementation**:
  - Configured in `api/email.js` using Nodemailer
  - Supports both development (Gmail SMTP) and production environments
  - Secure email templates for verification codes
  - Rate limiting and security measures implemented

### Database Integration
- **Purpose**: Data persistence and management
- **Features Used**:
  - MySQL database for user data
  - Parking meter information storage
  - Payment history tracking
  - User preferences and favorites
- **Implementation**:
  - Connection pool management in `api/database.js`
  - Secure query execution
  - Environment-based configuration

### Security Features
- **CSRF Protection**: Implemented across all forms
- **Rate Limiting**: Applied to sensitive operations
- **Password Hashing**: Using bcrypt for secure password storage
- **Session Management**: Secure user session handling

### No AI Services Used
This project does not utilize any AI services. All functionality is implemented using traditional programming methods and third-party APIs.

### API Dependencies
- **Express.js**: Web application framework
- **MySQL2**: Database driver
- **Nodemailer**: Email service
- **Bcrypt**: Password hashing
- **CSRF**: Cross-site request forgery protection
- **Dotenv**: Environment variable management

### Development Tools
- **Node.js**: Runtime environment
- **Git**: Version control
- **Python**: Data processing scripts
  - `scrape_pdf_rates_qwer.py`: PDF data extraction
  - `scrape_rateqertwr.py`: Rate data processing
  - `deep.py`: Data analysis
  - `etl.py`: Data transformation

## Contact Information
For any questions or support, please contact:
- GitHub: [yddobyb](https://github.com/yddobyb)


