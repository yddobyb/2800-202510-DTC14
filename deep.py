
import sys
from openai import OpenAI

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="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",  
)

def ask_deepseek(conversation: list[dict], question: str) -> str:
    """
    conversation에 user 메시지를 추가하고 GPT에 질의하여 assistant 응답을 반환합니다.
    """
    conversation.append({"role": "user", "content": question})
    response = client.chat.completions.create(
        model="deepseek/deepseek-chat:free",
        messages=conversation,
        stream=False
    )
    answer = response.choices[0].message.content.strip()
    conversation.append({"role": "assistant", "content": answer})
    return answer


def main():

    place = " ".join(sys.argv[1:])
    if not place:
        print("Usage: python deep.py [PLACE_NAME]")
        sys.exit(1)

    conversation = [
        {"role": "system", "content": (
            "You are a fun-fact generating assistant. "
            "When given the name of a place, you reply with one interesting, concise fun fact about it."
        )}
    ]

    question = f"Give me one interesting and concise fun fact about {place}."
    fact = ask_deepseek(conversation, question)

    print(fact)


if __name__ == "__main__":
    main()
