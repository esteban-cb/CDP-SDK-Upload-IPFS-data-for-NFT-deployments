# NFT Deployment Tool

A full-stack application for deploying NFTs using Coinbase Developer Platform (CDP) SDK and Pinata IPFS storage.

## Features
- Upload NFT metadata to IPFS via Pinata
- Deploy ERC-721 and ERC-1155 smart contracts
- Real-time deployment status tracking
- Automatic wallet creation and funding

## Setup

### Frontend
```bash
cd frontend
cp .env.example .env.local  # Add your Pinata credentials
npm install
npm run dev
```

### Backend
```bash
cd backend
cp .env.example .env  # Add your CDP credentials
pip install -r requirements.txt
python app.py
```

### Environment Variables

#### Frontend (.env.local)
```
NEXT_PUBLIC_PINATA_JWT=Your Pinata JWT token
NEXT_PUBLIC_PINATA_GATEWAY=Your Pinata gateway URL
```

#### Backend (.env)
```
CDP_API_KEY_NAME=Your CDP API key name
CDP_API_PRIVATE_KEY=Your CDP private key
```

## Usage
1. Fill in NFT metadata
2. Upload to IPFS
3. Select contract type (ERC-721 or ERC-1155)
4. Deploy and monitor progress
5. View on BaseScan when complete