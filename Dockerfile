FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt ./
RUN python -m pip install --upgrade pip setuptools wheel
RUN pip install --no-cache-dir --only-binary=:all: -r requirements.txt
COPY app ./app
EXPOSE 8000
CMD sh -c 'uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}'
