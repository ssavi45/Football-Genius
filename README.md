# Football Genius — Football Trivia Game

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Production-brightgreen?style=for-the-badge)](https://football-genius.vercel.app/)
[![Architecture Notes](https://img.shields.io/badge/Architecture-Notes-blue?style=for-the-badge)](#core-engineering--pipeline-highlights)

**Football Genius** is a production-grade, cloud-native football trivia and interactive game hub designed for football enthusiasts. It showcases automated data-scraping pipelines, secure distributed authentication, real-time multiplayer lobbies, and an intelligent LLM agent engine powered by Google Gemini.

---

## Visual Preview

<p align="center">
  <img src="img/scout_duel_ai.gif" width="800" alt="Scout's Duel Gameplay Preview"/>
</p>

---

## Core Engineering & Pipeline Highlights

The system architecture is structured to operate with minimal manual intervention, leveraging scheduled automation, serverless database synchronization, robust caching, and intelligent client-side fallbacks.

```mermaid
sequenceDiagram
    autonumber
    actor User as Client UI View
    participant DB as Supabase DB
    participant Scraper as Node.js Scraper (GH Actions)
    participant Proxy as Supabase Edge Function (Gemini Proxy)
    participant Gemini as Gemini AI (gemini-2.0-flash)

    %% Scraper Flow
    Note over Scraper, DB: Daily Cron Execution (2:00 AM UTC)
    Scraper->>Scraper: Scrape Transfermarkt (Cheerio/Axios)
    Scraper->>DB: Upsert Player Stats (Goals, Club, Market Value)

    %% Client Load Flow
    User->>DB: Get Active Players & Profiles
    DB-->>User: Return Player Metadata & Scores

    %% Game Flow (Scout's Duel)
    User->>User: User Inputs Question
    User->>Proxy: POST /gemini-proxy { prompt } (JWT Auth)
    Proxy->>Proxy: Validate JWT token with Supabase Auth
    Proxy->>Gemini: POST /generateContent (Temp=0.1)
    Gemini-->>Proxy: Return text ("Yes" / "No")
    Proxy-->>User: Return JSON Response
    Note over User: If request fails: trigger local fallback keyword matching
    User->>User: Render Answer to User
