# 🔌 Backend Integration Guide

## Connecting Your Discord Bot to the Web Frontend

This guide shows you how to integrate your existing Discord bot (from `C:\Users\admin\Servicefilesp8`) with the new web frontend.

---

## 📋 Overview

Your Discord bot currently manages:
- User registrations (`pending_registrations.json`)
- Active bookings (`activebookings_vm*.json`)
- User data (CSV files)
- VM scheduling and management
- Shop packages

The web frontend needs to access this same data through a REST API.

---

## 🏗️ Architecture

```
┌──────────────────┐
│  Web Browser     │
│  (React App)     │
└────────┬─────────┘
         │ HTTP/WS
         ▼
┌──────────────────┐
│  FastAPI Server  │  ← New addition
│  (Port 3000)     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Discord Bot     │
│  (Existing)      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  File Storage    │
│  (JSON/CSV)      │
└──────────────────┘
```

---

## 🚀 Quick Start

### Step 1: Install FastAPI in Your Discord Bot Project

```bash
cd C:\Users\admin\Servicefilesp8
pip install fastapi uvicorn python-jose[cryptography] python-multipart aiofiles
```

### Step 2: Create API Server File

Create `api_server.py` in your Discord bot directory:

```python
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
import json
import os
from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import Optional
import httpx

app = FastAPI(title="Skates Gamehosting API")

# CORS - Allow web frontend to access API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "https://stealan1.github.io"  # GitHub Pages
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
SECRET_KEY = "your-secret-key-change-this"  # Change in production!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
DISCORD_CLIENT_ID = "your-discord-client-id"
DISCORD_CLIENT_SECRET = "your-discord-client-secret"
DISCORD_REDIRECT_URI = "http://localhost:3000/auth/discord/callback"

# File paths (adjust to your setup)
BASE_DIR = os.path.dirname(__file__)
BOOKINGS_DIR = BASE_DIR
PENDING_REG_FILE = os.path.join(BASE_DIR, "pending_registrations.json")

# ============================================================================
# Helper Functions
# ============================================================================

def load_json(filepath):
    """Load JSON file"""
    try:
        with open(filepath, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def save_json(filepath, data):
    """Save JSON file"""
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)

def create_access_token(data: dict):
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(authorization: Optional[str] = Header(None)):
    """Get current user from JWT token"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_user_bookings(discord_id: str):
    """Get all bookings for a user across all VMs"""
    all_bookings = []
    for i in range(5):  # VM0-VM4
        filepath = os.path.join(BOOKINGS_DIR, f"activebookings_vm{i}.json")
        bookings = load_json(filepath)
        for booking in bookings:
            if booking.get("discord_id") == discord_id:
                booking["vmId"] = f"vm{i}"
                all_bookings.append(booking)
    return all_bookings

# ============================================================================
# Authentication Endpoints
# ============================================================================

@app.get("/auth/discord")
async def discord_oauth(return_url: Optional[str] = None):
    """Initiate Discord OAuth flow"""
    oauth_url = (
        f"https://discord.com/api/oauth2/authorize"
        f"?client_id={DISCORD_CLIENT_ID}"
        f"&redirect_uri={DISCORD_REDIRECT_URI}"
        f"&response_type=code"
        f"&scope=identify email"
    )
    if return_url:
        oauth_url += f"&state={return_url}"
    return RedirectResponse(oauth_url)

@app.get("/auth/discord/callback")
async def discord_callback(code: str, state: Optional[str] = None):
    """Handle Discord OAuth callback"""
    # Exchange code for access token
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            "https://discord.com/api/oauth2/token",
            data={
                "client_id": DISCORD_CLIENT_ID,
                "client_secret": DISCORD_CLIENT_SECRET,
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": DISCORD_REDIRECT_URI,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        token_data = token_response.json()

        # Get user info from Discord
        user_response = await client.get(
            "https://discord.com/api/users/@me",
            headers={"Authorization": f"Bearer {token_data['access_token']}"}
        )
        discord_user = user_response.json()

    # Create JWT token
    access_token = create_access_token({"sub": discord_user["id"]})
    refresh_token = create_access_token({"sub": discord_user["id"], "refresh": True})

    # Redirect back to frontend with tokens
    return_url = state or "http://localhost:5173/#/login"
    redirect_url = (
        f"{return_url}?access_token={access_token}"
        f"&refresh_token={refresh_token}"
        f"&expires_in={ACCESS_TOKEN_EXPIRE_MINUTES * 60}"
    )
    return RedirectResponse(redirect_url)

@app.post("/auth/refresh")
async def refresh_token(refresh_token: str):
    """Refresh access token"""
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        if not payload.get("refresh"):
            raise HTTPException(status_code=401, detail="Invalid refresh token")

        user_id = payload.get("sub")
        new_access_token = create_access_token({"sub": user_id})
        new_refresh_token = create_access_token({"sub": user_id, "refresh": True})

        return {
            "tokens": {
                "accessToken": new_access_token,
                "refreshToken": new_refresh_token,
                "expiresIn": ACCESS_TOKEN_EXPIRE_MINUTES * 60
            }
        }
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

@app.get("/me")
async def get_current_user_profile(user_id: str = Depends(get_current_user)):
    """Get current user profile"""
    # TODO: Load from your CSV/database
    # For now, return mock data
    return {
        "id": "user_123",
        "discordId": user_id,
        "username": "STEALAN",
        "discriminator": "0001",
        "avatar": None,
        "email": None,
        "hoursBalance": 150,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
    }

# ============================================================================
# Booking Endpoints
# ============================================================================

@app.get("/bookings")
async def list_bookings(user_id: str = Depends(get_current_user)):
    """List user's bookings"""
    bookings = get_user_bookings(user_id)
    return bookings

@app.post("/book")
async def create_booking(
    booking_data: dict,
    user_id: str = Depends(get_current_user)
):
    """Create new booking"""
    # TODO: Implement booking logic from your Discord bot
    # This should:
    # 1. Check user has enough hours
    # 2. Check VM availability
    # 3. Create booking in activebookings_vm*.json
    # 4. Deduct hours from user balance

    return {
        "id": "booking_123",
        "userId": user_id,
        "service": booking_data["service"],
        "realm": booking_data["realm"],
        "duration": booking_data["duration"],
        "startTime": booking_data["startTime"],
        "gameName": booking_data["gameName"],
        "status": "pending",
        "vmId": "vm0",
        "totalPrice": booking_data["duration"] * 10
    }

@app.post("/cancel")
async def cancel_booking(
    booking_id: str,
    user_id: str = Depends(get_current_user)
):
    """Cancel a booking"""
    # TODO: Implement cancellation logic
    # 1. Find booking in activebookings_vm*.json
    # 2. Remove booking
    # 3. Refund hours if applicable

    return {"success": True}

# ============================================================================
# Service & Shop Endpoints
# ============================================================================

@app.get("/services")
async def list_services():
    """List available services"""
    return [
        {"id": "ench", "type": "ENCH", "name": "Enchanting", "pricePerHour": 10, "available": True},
        {"id": "bo", "type": "BO", "name": "Blood Orbs", "pricePerHour": 15, "available": True},
        {"id": "kd", "type": "KD", "name": "Kill Death", "pricePerHour": 12, "available": True},
        {"id": "boss", "type": "BOSS", "name": "Boss Farm", "pricePerHour": 20, "available": True},
    ]

@app.get("/price")
async def get_price_estimate(hours: int):
    """Get price estimate"""
    base_price = 10
    total = hours * base_price
    discount = 0.1 if hours >= 10 else 0

    return {
        "basePrice": base_price,
        "hours": hours,
        "totalPrice": total,
        "discountApplied": discount,
        "finalPrice": total * (1 - discount)
    }

@app.get("/shop/packs")
async def list_shop_packs():
    """List shop packs"""
    return [
        {"id": "pack_1", "name": "10 Hours", "hours": 10, "price": 5, "currency": "USD"},
        {"id": "pack_2", "name": "25 Hours", "hours": 25, "price": 10, "currency": "USD"},
        {"id": "pack_3", "name": "50 Hours", "hours": 50, "price": 18, "currency": "USD"},
    ]

@app.post("/shop/buy")
async def purchase_pack(
    pack_data: dict,
    user_id: str = Depends(get_current_user)
):
    """Purchase a pack"""
    # TODO: Implement payment logic
    return {
        "success": True,
        "transactionId": "txn_123",
        "hoursAdded": 10,
        "newBalance": 160
    }

# ============================================================================
# VM & Stats Endpoints
# ============================================================================

@app.get("/vms")
async def list_vms():
    """List all VMs"""
    vms = []
    for i in range(5):
        vms.append({
            "id": f"vm{i}",
            "name": f"VM-{i}",
            "status": "online",
            "currentBooking": None,
            "cpu": 45,
            "memory": 60,
            "uptime": 86400,
            "region": "EU"
        })
    return vms

@app.get("/stats")
async def get_server_stats():
    """Get server statistics"""
    return {
        "totalServers": 5,
        "activeBookings": 3,
        "availableServers": 2,
        "totalPlayers": 12
    }

# ============================================================================
# WebSocket Support (Optional)
# ============================================================================

from fastapi import WebSocket

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Send updates to connected clients
            await websocket.send_json({
                "type": "ping",
                "timestamp": datetime.utcnow().isoformat()
            })
            await asyncio.sleep(30)
    except:
        pass

# ============================================================================
# Run Server
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)
```

### Step 3: Run the API Server

```bash
python api_server.py
```

The API will be available at: http://localhost:3000

### Step 4: Update Frontend .env

```bash
VITE_API_BASE_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

### Step 5: Test the Integration

1. Start the API server: `python api_server.py`
2. Start the frontend: `npm run dev`
3. Open http://localhost:5173
4. Click "Login with Discord"

---

## 📝 TODO: Complete the Integration

The API server above is a **starter template**. You need to:

### 1. **Implement User Data Loading**

Replace the mock data in `/me` endpoint:

```python
@app.get("/me")
async def get_current_user_profile(user_id: str = Depends(get_current_user)):
    # Load from your CSV or database
    users = load_csv("users.csv")  # Your existing user data
    user = next((u for u in users if u["discord_id"] == user_id), None)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user["id"],
        "discordId": user_id,
        "username": user["username"],
        "hoursBalance": user["hours_balance"],
        # ... map your CSV fields
    }
```

### 2. **Implement Booking Creation**

Use your existing booking logic:

```python
@app.post("/book")
async def create_booking(booking_data: dict, user_id: str = Depends(get_current_user)):
    # Your existing booking logic from Discord bot
    # Find available VM
    # Check user hours
    # Create booking in activebookings_vm*.json
    # Start the VM service
    pass
```

### 3. **Implement Real-Time Updates**

Add Socket.IO for real-time updates:

```bash
pip install python-socketio
```

```python
import socketio

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
app = socketio.ASGIApp(sio, app)

@sio.event
async def connect(sid, environ):
    print(f"Client {sid} connected")

@sio.event
async def disconnect(sid):
    print(f"Client {sid} disconnected")

# Emit events when bookings change
async def on_booking_started(booking):
    await sio.emit('booking:started', booking)
```

---

## 🔒 Security Checklist

- [ ] Change `SECRET_KEY` to a strong random value
- [ ] Store Discord credentials in environment variables
- [ ] Use HTTPS in production
- [ ] Validate all user inputs
- [ ] Rate limit API endpoints
- [ ] Add request logging
- [ ] Implement CSRF protection

---

## 🚀 Production Deployment

### Option 1: Run API Server Alongside Discord Bot

```python
# In your main Discord bot file
import asyncio
from discord_bot import bot
from api_server import app
import uvicorn

async def run_bot():
    await bot.start(DISCORD_TOKEN)

async def run_api():
    config = uvicorn.Config(app, host="0.0.0.0", port=3000)
    server = uvicorn.Server(config)
    await server.serve()

async def main():
    await asyncio.gather(
        run_bot(),
        run_api()
    )

asyncio.run(main())
```

### Option 2: Separate Processes

Run them in separate terminals:

```bash
# Terminal 1: Discord Bot
python discord_bot.py

# Terminal 2: API Server
python api_server.py
```

---

## 📊 Data Migration

Your existing files will work with the API. Just map them:

- `activebookings_vm*.json` → `/bookings` endpoint
- `pending_registrations.json` → User registration flow
- CSV files → User data
- `vmconfig.json` → VM configuration

---

## 🧪 Testing

Test the API endpoints:

```bash
# Test authentication
curl http://localhost:3000/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test bookings
curl http://localhost:3000/bookings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 💡 Tips

1. **Reuse Discord Bot Logic**: Import functions from your Discord bot into the API server
2. **Share Data Files**: Both processes can read/write the same JSON files
3. **Use Locks**: If writing to files from both bot and API, use file locks
4. **Log Everything**: Add logging to track API requests and errors

---

Your backend API is now ready to connect with the web frontend! 🎉
