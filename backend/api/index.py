"""
Vercel Serverless Function Handler for FastAPI Backend
"""
from app.main import app

# Vercel will call this handler
handler = app
