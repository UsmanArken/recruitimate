FROM python:3.11-slim

WORKDIR /app

# System deps needed by psycopg2-binary
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    curl \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Export deps from pyproject.toml and install with pip (no Poetry needed at runtime)
RUN pip install --no-cache-dir poetry==1.8.3

COPY pyproject.toml ./

# Export to requirements.txt, then install with pip — faster and no resolver conflict
RUN poetry export -f requirements.txt --without-hashes --without dev -o requirements.txt \
    && pip install --no-cache-dir -r requirements.txt \
    && rm requirements.txt

# Copy application code
COPY . .

RUN mkdir -p /app/uploads

EXPOSE 8000
