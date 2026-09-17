#!/usr/bin/env bash
set -e

python -m pip install -r requirements.txt
python -m server.seed

cd client
npm install
npm run build
cd ..

python -m uvicorn server.main:app --host 0.0.0.0 --port 8000 &
cd client && npm run dev -- --host 0.0.0.0 --port 5173
