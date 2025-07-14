This version is only to show off code.
Real version is a private rep.

# 🎲 Discord Gambling Bot with Siegeline

This is a full-featured Discord bot designed for server entertainment through interactive gambling games and live betting functionality on Rainbow Six Siege ranked matches.

## ⚙️ Features
![alt text](https://github.com/gurdeep530/Gambling-discord-bot/blob/main/extra%20assests/discord%20bot%20mini%20games%20-%20Made%20with%20Clipchamp.mp4)
- 🎰 **Casino-Style Games**  
  Users can play games like Blackjack, Slots, and Roulette using in-server currency.

- 🧾 **User Profiles**  
  Each user has a profile stored in MongoDB with persistent balance, game history, and win/loss stats.

- 💸 **Currency System**  
  Earn, bet, and lose virtual currency. Admins can modify balances or reset the economy.

- 🏆 **Leaderboards**  
  View global or server-specific rankings by balance or win rate.

- ✅ **Moderation Commands**  
  Ban/unban from gambling, reset users, view logs, and more.

---

## ⚔️ Siegeline – Live Match Betting

`/siegeline` is a specialized module allowing users to place real-time bets on **live Rainbow Six Siege ranked matches**.

### How It Works: 
1. A user runs `/siegeline <playername>` to trigger a live match check via web scraping.
2. If a game is detected, the bot enters **Betting Live** mode and opens a betting UI in Discord.
3. Other users can bet whether the player will win, lose, or draw the match.
4. After the match ends, the bot uses the game’s public API to compare stats and determine the result.
5. Winners are paid out based on the odds, and results are displayed in a final embed message.

   ![Go to extra Assets for Diagram!](https://github.com/gurdeep530/Gambling-discord-bot/blob/main/extra%20assests/Siegeline-explanantion.png)

### Technologies Used:
- **Node.js** & **Discord.js**
- **MongoDB** (User profiles, bets, state management)
- **Axios** & **Cheerio** (for web scraping)
- **REST APIs** (to get Siege stats)
- **Interactive Discord Buttons**

---

## 🧠 Architecture Overview

The bot is composed of several modules:
- `games/`: Gambling logic (slots, blackjack, etc.)
- `profile/`: User account and balance logic
- `siegeline/`: Live match betting feature
- `moderation/`: Admin-only commands and logging
- `utils/`: Reusable functions (e.g., embed formatting, DB handling)

---

Dependencies:
npm i puppeteer
npm i discord.js-games
npm i discord.js
