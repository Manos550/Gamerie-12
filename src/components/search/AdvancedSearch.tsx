// Previous imports remain the same...

export default function AdvancedSearch() {
  // Previous state declarations remain the same...

  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['advanced-search', searchType, searchTerm, filters],
    queryFn: async () => {
      // In demo mode, search through demo data
      if (import.meta.env.MODE === 'development') {
        if (searchType === 'players') {
          let results = demoUsers;

          // Apply filters with improved search logic
          if (filters.skillLevel) {
            results = results.filter(user => user.gameLevel === filters.skillLevel);
          }
          if (filters.region) {
            results = results.filter(user => 
              user.country?.toLowerCase().includes(filters.region!.toLowerCase())
            );
          }
          if (filters.game) {
            const searchGame = filters.game.toLowerCase();
            results = results.filter(user => 
              user.gamesPlayed.some(game => {
                const gameName = game.name.toLowerCase();
                // Check for exact match or partial match
                return gameName === searchGame || 
                       gameName.includes(searchGame) ||
                       searchGame.includes(gameName);
              })
            );
          }
          if (filters.platform) {
            results = results.filter(user => 
              user.platforms.some(platform => 
                platform.toLowerCase() === filters.platform!.toLowerCase()
              )
            );
          }

          // Apply search term with improved matching
          if (searchTerm) {
            const term = searchTerm.toLowerCase();
            results = results.filter(user =>
              user.username.toLowerCase().includes(term) ||
              user.gamerTitle.toLowerCase().includes(term) ||
              user.gamesPlayed.some(game => 
                game.name.toLowerCase().includes(term)
              )
            );
          }

          return { players: results, teams: [] };
        } else {
          let results = getDemoTeams();

          // Apply filters with improved search logic
          if (filters.skillLevel) {
            results = results.filter(team => team.level === filters.skillLevel);
          }
          if (filters.region) {
            results = results.filter(team => 
              team.region?.toLowerCase().includes(filters.region!.toLowerCase())
            );
          }
          if (filters.game) {
            const searchGame = filters.game.toLowerCase();
            results = results.filter(team => 
              team.games.some(game => {
                const gameName = game.name.toLowerCase();
                // Check for exact match or partial match
                return gameName === searchGame || 
                       gameName.includes(searchGame) ||
                       searchGame.includes(gameName);
              })
            );
          }
          if (filters.teamSize) {
            results = results.filter(team => team.members.length === filters.teamSize);
          }

          // Apply search term with improved matching
          if (searchTerm) {
            const term = searchTerm.toLowerCase();
            results = results.filter(team =>
              team.name.toLowerCase().includes(term) ||
              team.description.toLowerCase().includes(term) ||
              team.games.some(game => 
                game.name.toLowerCase().includes(term)
              )
            );
          }

          return { players: [], teams: results };
        }
      }

      // In production, implement Firebase search
      return { players: [], teams: [] };
    }
  });

  // Rest of the component remains the same...
}