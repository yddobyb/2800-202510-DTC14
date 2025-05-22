

import io
import requests
import pdfplumber

BYLAW_PDF_URL = "https://bylaws.vancouver.ca/consolidated/2952.pdf"

def scrape_parking_rates():
    """
    Download the consolidated Parking Meter By-law PDF,
    extract the zones/rates table (Schedule A), and return
    a mapping { zone_name: rate_text }.
    """
    resp = requests.get(BYLAW_PDF_URL)
    resp.raise_for_status()
    pdf_bytes = resp.content

    rates = {}
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page in pdf.pages[:3]:
            for table in page.extract_tables():
                headers = [h.strip().lower() for h in table[0]]
                if "zone" in headers and "rate" in headers:
                    zi, ri = headers.index("zone"), headers.index("rate")
                    for row in table[1:]:
                        zone = row[zi].strip()
                        rate = row[ri].strip()
                        if zone and rate:
                            rates[zone] = rate
    if not rates:
        raise RuntimeError("Could not find a zone→rate table in the PDF")
    return rates

if __name__ == "__main__":
    rates = scrape_parking_rates()
    for zone, rate in rates.items():
        print(f"{zone}: {rate}")
