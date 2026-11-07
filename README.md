# Packaging AI

A blockchain-based maintenance assistant for packaging lines.  
Users log maintenance sessions on Solana (Devnet) and receive AI-powered solutions using Grok, based on a technical manual.

## Features

- Wallet connection with Phantom
- On-chain session logging (Solana + Anchor)
- AI responses powered by Grok
- Simple and clean frontend

## Tech Stack

- **Blockchain**: Solana (Devnet) + Anchor
- **Frontend**: React + TypeScript + Vite
- **AI**: Grok API (via backend proxy)
- **Wallet**: Phantom

## Project Structure
packaging_ai/
├── programs/          # Anchor program (smart contract)
├── frontend/          # React frontend
├── backend/           # Node.js proxy for Grok API
└── README.md

## Prerequisites

- Node.js (v18+)
- Phantom wallet (set to Devnet)
- A Grok API key from [console.x.ai](https://console.x.ai)

## Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd packaging_ai

# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install

You need two terminals.

Terminal 1 – BackendBashcd backend
node server.js

Terminal 2 – FrontendBashcd frontend
npm run dev

Open the URL shown by Vite (usually http://localhost:5173).How to Use
Connect your Phantom wallet (make sure it is set to Devnet)
Click Initialize Access (only once)
Describe a packaging problem and click Log Session
The session is stored on-chain and Grok returns a solution based on the manual
Smart ContractThe Anchor program is located in the programs/ folder.

It handles:
User access initialization
Maintenance session logging
LicenseMIT


