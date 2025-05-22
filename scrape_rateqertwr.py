import requests
from bs4 import BeautifulSoup

RATES_URL = "https://vancouver.ca/streets-transportation/parking-meters-and-rates.aspx"

def scrape_parking_rates():
    resp = requests.get(RATES_URL)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    table = soup.select_one("main table")
    if not table:
        raise RuntimeError("Could not find the rates table on the page")

    rates = {}
    headers = [th.get_text(strip=True).lower() for th in table.select("thead th")]
    zi = headers.index("zone")    if "zone"    in headers else headers.index("block")
    ri = headers.index("rate")    if "rate"    in headers else headers.index("hourly rate")

    for row in table.select("tbody tr"):
        cols = [td.get_text(strip=True) for td in row.find_all("td")]
        if len(cols) <= max(zi, ri):
            continue
        zone, rate = cols[zi], cols[ri]
        rates[zone] = rate
    if not rates:
        raise RuntimeError("No rates parsed from HTML table")
    return rates

if __name__ == "__main__":
    rates_map = scrape_parking_rates()
    for z, r in rates_map.items():
        print(f"{z}: {r}")
