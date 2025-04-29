This is my readme file.

to run the website.
1. download the files
2. open index.html in your browser


# ParkSmart Analyzer

**ParkSmart Analyzer** is a mobile-first progressive web application that helps drivers in Vancouver comply with curb-side rules and avoid unintentional parking tickets. By merging several City of Vancouver open-data feeds—parking-ticket records, meter rates, motorcycle & accessible stalls, and street-cleaning schedules—it visualizes enforcement intensity, highlights legal special-use spaces, and sends timely push alerts to encourage on-time payment or relocation.

---

## Key Features

- **Enforcement Heat-map:** Hourly ticket density visualized by block  
- **Disability & Motorcycle Filters:** Show only legally available stalls for each permit type  
- **Push Notifications:** 15-minute alerts before street-cleaning or meter expiry  
- **One-Tap Payment:** Deep-link into PayByPhone with location pre-filled  

---

## Tech Stack

- **ETL & Data:** Python
- **Database:** MySQL
- **API Server:** Node.js (Express) + TypeScript  
- **Frontend:** HTML, CSS, JavaScript, Tailwind CSS

---

## Getting Started

### Prerequisites

- Node.js (v16+)  
- Python (v3.8+)  
- MySQL (with Spatial support)  

### Installation

1. **Clone the repo**  
   ```bash
   git clone https://github.com/yddobyb/ParkSmartAnalyzer.git
   cd ParkSmartAnalyzer


## Project Structure

- `parksmart-analyzer/` 
  - `README.md`          # Project overview and setup  
