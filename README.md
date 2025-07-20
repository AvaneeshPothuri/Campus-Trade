
# Campus Trade

**Campus Trade** is a simple campus marketplace where students can buy, sell, and auction products within their university. This project is built using **React.js + Supabase**.

## Features

- **Buy/Sell Marketplace** – Post and browse product listings easily.  
- **Auction System** – Place bids in real-time and track your auctions.  
- **Profile Dashboard** – View your sold items, active listings, bids, and buy requests.  
- **Contact Requests** – Connect with sellers or buyers via phone/Facebook.  
- **Real-time Updates** – Auctions and listings update dynamically.  
- **Secure Auth** – User authentication via Supabase.

## Tech Stack

- **Frontend:** React.js, Tailwind CSS  
- **Backend:** Supabase (Database + Authentication + Realtime)  
- **Deployment:** Vercel

## Setup Instructions

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/campus-trade.git
cd campus-trade
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Setup Environment Variables

Create a `.env` file in the root directory:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4️⃣ Run Locally

```bash
npm run dev
```

## Project Structure

```
src/
  components/
    BuySell.jsx
    Auctions.jsx
    Profile.jsx
    UI/
      Card.jsx
      Button.jsx
  supabaseClient.js

public/
  favicon.ico
```

## Live Demo

[Campus Trade Live Demo]([https://campus-trade-khaki.vercel.app/])
