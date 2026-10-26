FROM python:3.13-slim
# uv is copied in from its official image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Mirror the repo layout (/app/backend + /app/data) so the code's data path still resolves
WORKDIR /app/backend

# Copy dependency files first: Docker caches this layer, so rebuilds are fast
COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync --frozen --no-dev

COPY backend/app ./app
COPY data /app/data

ENV PATH="/app/backend/.venv/bin:$PATH"
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]