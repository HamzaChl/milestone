interface Filters {
  name?: string;
  league?: string;
  club?: string;
  country?: string;
}

export function filterPlayers(players: any[], filters: Filters): any[] {
  let filteredPlayers = players;

  if (filters.name && filters.name.trim() !== "") {
    filteredPlayers = filteredPlayers.filter((player) =>
      player.name.toLowerCase().includes(filters.name!.toLowerCase())
    );
  }

  if (filters.league && filters.league.trim() !== "") {
    filteredPlayers = filteredPlayers.filter((player) =>
      player.league.toLowerCase().includes(filters.league!.toLowerCase())
    );
  }

  if (filters.club && filters.club.trim() !== "") {
    filteredPlayers = filteredPlayers.filter((player) =>
      player.club.toLowerCase().includes(filters.club!.toLowerCase())
    );
  }

  if (filters.country && filters.country.trim() !== "") {
    filteredPlayers = filteredPlayers.filter((player) =>
      player.country.toLowerCase().includes(filters.country!.toLowerCase())
    );
  }

  return filteredPlayers;
}
