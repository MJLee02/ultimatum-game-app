# Ultimatum Game React Native App (Multiplayer)

A React Native application for conducting multiplayer Ultimatum Game experiments with 10 rounds and demographic data collection, integrated with Supabase.

## Features

- **Multiplayer Lobbies**: Multiple players can join a game lobby
- **Even Player Requirement**: Games can only start with an even number of players (2, 4, 6, etc.)
- **Random Role Assignment**: Each player is randomly assigned as proposer in 5 rounds and responder in 5 rounds
- **Random Matching**: Each round, proposers are randomly matched with responders
- **Real-time Gameplay**: Players interact in real-time through Supabase
- **Demographic Questions**: Collects age, gender, education, income, ethnicity, and country
- **Results Summary**: Shows total earnings and round-by-round results

## Game Flow

1. **Waiting Screen**: Auto-creates player account and joins/creates a lobby
2. **Lobby Screen**: Shows all players in the lobby
   - Any player can press "Start Game" button
   - Game only starts if there's an even number of players (≥2)
   - Once started, no new players can join
3. **Game Rounds** (10 rounds):
   - Each player is proposer in 5 rounds, responder in 5 rounds (randomly assigned)
   - Each round has equal number of proposers and responders
   - Proposers and responders are randomly matched each round
4. **Demographics**: After 10 rounds, players answer demographic questions
5. **Results**: Final screen shows total earnings and round results

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Supabase account and project

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor in your Supabase dashboard
3. Run the SQL script from `database/schema.sql` to create the necessary tables
4. Get your Supabase URL and anon key from Settings > API
5. Update `src/config/supabase.js` with your credentials:

```javascript
const SUPABASE_URL = 'your-project-url';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

### 3. Run the App

```bash
npm start
```

Then:
- Press `a` for Android
- Press `i` for iOS
- Press `w` for web
- Scan the QR code with Expo Go app on your phone

## Project Structure

```
project/
├── App.js                 # Main app component with navigation
├── src/
│   ├── config/
│   │   └── supabase.js    # Supabase client configuration
│   └── screens/
│       ├── WelcomeScreen.js      # Initial screen (optional)
│       ├── WaitingScreen.js      # Auto-joins lobby
│       ├── LobbyScreen.js        # Shows players, start button
│       ├── GameScreen.js         # Main game screen for 10 rounds
│       ├── DemographicScreen.js  # Demographic questions
│       └── ResultsScreen.js      # Final results display
├── database/
│   └── schema.sql         # Database schema for Supabase
└── package.json
```

## How the Game Works

### Lobby Phase
1. Players automatically join a lobby when they open the app
2. Players can see who else has joined
3. Any player can press "Start Game" (only works with even number of players)
4. Once started, the lobby is closed to new players

### Game Phase
1. System randomly assigns roles for all 10 rounds ensuring:
   - Each player is proposer exactly 5 times
   - Each player is responder exactly 5 times
   - Each round has equal proposers and responders
2. Each round:
   - Proposers and responders are randomly matched
   - Proposer offers how to split $10
   - Responder accepts or rejects
   - If accepted: Both get the proposed split
   - If rejected: Both get $0
3. After 10 rounds: Demographics questionnaire
4. Results screen shows total earnings

## Database Schema

- **sessions**: Tracks player sessions
- **games**: Tracks game lobbies (status: waiting/active/completed)
- **game_players**: Links players to games (many-to-many)
- **player_roles**: Stores role assignments for each player in each round
- **rounds**: Stores proposals, decisions, and payouts for each match
- **demographics**: Stores player demographic information

## Customization

### Change Number of Rounds

Edit `TOTAL_ROUNDS` in `src/screens/GameScreen.js`:

```javascript
const TOTAL_ROUNDS = 10; // Change to desired number (must be even)
```

Also update the role assignment logic in `LobbyScreen.js` to ensure each player gets equal proposer/responder rounds.

### Change Total Amount

Edit `TOTAL_AMOUNT` in `src/screens/GameScreen.js`:

```javascript
const TOTAL_AMOUNT = 10; // Change to desired amount
```

### Modify Demographic Questions

Edit the form fields in `src/screens/DemographicScreen.js`

## Testing with Multiple Players

To test the multiplayer functionality:

1. Open the app in multiple browsers/devices
2. All instances will join the same lobby
3. Start the game from any instance once you have an even number
4. Each player will see different roles and matchings each round

## Security Notes

The current RLS policies allow all operations for development. For production:

1. Implement proper authentication (Supabase Auth)
2. Create more restrictive RLS policies
3. Validate and sanitize all inputs
4. Add rate limiting
5. Verify game state transitions server-side

## Troubleshooting

- **Connection Issues**: Verify Supabase URL and anon key are correct
- **Odd Player Count**: Game won't start with odd number of players
- **Database Errors**: Ensure all tables were created correctly using schema.sql
- **Role Assignment Issues**: Check player_roles table for correct assignments

## Citation

If you use this software in your research, please cite:

```
Lee, M., Sadik, O., Gelrud, J., Lu, Y., & Martinez, A. (2024). 
Behavioral Assimilation in Social Preferences: Evidence from a Multi-Round Ultimatum Game with Immigrant Populations.
WashU ECON 4310.
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

This software was developed for educational and research purposes as part of ECON 4310 at Washington University in St. Louis.
