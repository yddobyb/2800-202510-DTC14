
import os, sys
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI
import random

load_dotenv(dotenv_path=Path(__file__).parent / ".env")
api_key  = os.getenv("OPENAI_API_KEY")
base_url = os.getenv("OPENAI_BASE_URL", "https://openrouter.ai/api/v1")



if not api_key:
    print("Fun fact: Vancouver once considered painting its fire hydrants rainbow-coloured.")
    sys.exit(0)

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url="https://openrouter.ai/api/v1",
    default_headers={
        "HTTP-Referer": "https://parksmart.local",  
        "X-Title":      "ParkSmart Fun Fact Script"
    }
)

FALLBACKS = [
    "{place} has more public green space per resident than most Canadian cities.",
    "{place} hosted one of the world’s largest outdoor yoga classes in 2016.",
    "{place} was almost named ‘Sequoia City’ in the 19th century."
]

def ask_fun_fact(place: str) -> str:
    res = client.chat.completions.create(
        model="deepseek/deepseek-chat:free",
        messages=[
            {"role": "system",
             "content": "You are a fun-fact assistant. Reply with ONE short, interesting fun fact."},
            {"role": "user",
             "content": f"Give me one interesting and concise fun fact about {place}."}
        ]
    )
    return res.choices[0].message.content.strip()


def main():
    place = " ".join(sys.argv[1:]).strip()
    if not place:
        print("Usage: python deep.py [PLACE_NAME]")
        sys.exit(1)

    try:
        fact = ask_fun_fact(place)
        print(fact)
    except Exception as e:
        print("DEBUG │ GPT-error →", e, file=sys.stderr)
        print(random.choice(FALLBACKS).format(place=place.title()))

if __name__ == "__main__":
    main()