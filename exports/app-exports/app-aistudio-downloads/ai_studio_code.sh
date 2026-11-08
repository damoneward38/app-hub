# 1️⃣  Start all containers
docker compose up --build

# 2️⃣  Access the garden
http://localhost:3000   # React front‑end
http://localhost:5000   # API gateway (dev only)
http://localhost:3000   # UI

# 3️⃣  Orchestration
prefect agent cloud start   # or prefect agent local start
# or directly run the flow:
prefect run flow.py