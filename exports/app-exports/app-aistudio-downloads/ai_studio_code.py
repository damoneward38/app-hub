# infra/prefect/flow.py
from prefect import flow, task
import httpx

@task
async def call_ai(service: str, prompt: str):
    url = f"http://gateway:5000/{service}/chat"
    async with httpx.AsyncClient() as client:
        r = await client.post(url, json={"prompt": prompt})
        return r.json()

@flow
def orchestrator(user_query: str):
    # Example: route to assistant, if fails route to autotask, etc.
    result = call_ai.submit("assistant", user_query)
    # Could chain more calls based on outcome
    return result

if __name__ == "__main__":
    orchestrator("What's the next marketing copy?")