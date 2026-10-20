export interface FootballerAvatar {
  id: string;
  name: string;
  avatarUrl: string;
  era: 'Legend' | 'Modern';
  role: 'Forward' | 'Midfielder' | 'Defender' | 'Goalkeeper';
}

export const FOOTBALLER_AVATARS: FootballerAvatar[] = [
  { id: 'messi', name: 'Lionel Messi', avatarUrl: '/img/players/messi.jpg', era: 'Modern', role: 'Forward' },
  { id: 'ronaldo', name: 'Cristiano Ronaldo', avatarUrl: '/img/players/ronaldo.jpg', era: 'Modern', role: 'Forward' },
  { id: 'zidane', name: 'Zinedine Zidane', avatarUrl: '/img/players/zidane.jpg', era: 'Legend', role: 'Midfielder' },
  { id: 'pele', name: 'Pelé', avatarUrl: '/img/players/pele.jpg', era: 'Legend', role: 'Forward' },
  { id: 'maradona', name: 'Diego Maradona', avatarUrl: '/img/players/maradona.jpg', era: 'Legend', role: 'Forward' },
  { id: 'cruyff', name: 'Johan Cruyff', avatarUrl: '/img/players/cruyff.jpg', era: 'Legend', role: 'Forward' },
  { id: 'ronaldinho', name: 'Ronaldinho', avatarUrl: '/img/players/ronaldinho.jpg', era: 'Legend', role: 'Forward' },
  { id: 'fenomeno', name: 'Ronaldo Nazário', avatarUrl: '/img/players/fenomeno.jpg', era: 'Legend', role: 'Forward' },
  { id: 'maldini', name: 'Paolo Maldini', avatarUrl: '/img/players/maldini.jpg', era: 'Legend', role: 'Defender' },
  { id: 'henry', name: 'Thierry Henry', avatarUrl: '/img/players/henry.jpg', era: 'Legend', role: 'Forward' },
  { id: 'iniesta', name: 'Andrés Iniesta', avatarUrl: '/img/players/iniesta.jpg', era: 'Legend', role: 'Midfielder' },
  { id: 'xavi', name: 'Xavi Hernández', avatarUrl: '/img/players/xavi.jpg', era: 'Legend', role: 'Midfielder' },
  { id: 'kaka', name: 'Kaká', avatarUrl: '/img/players/kaka.jpg', era: 'Legend', role: 'Midfielder' },
  { id: 'bellingham', name: 'Jude Bellingham', avatarUrl: '/img/players/bellingham.jpg', era: 'Modern', role: 'Midfielder' },
  { id: 'haaland', name: 'Erling Haaland', avatarUrl: '/img/players/haaland.jpg', era: 'Modern', role: 'Forward' },
  { id: 'mbappe', name: 'Kylian Mbappé', avatarUrl: '/img/players/mbappe.jpg', era: 'Modern', role: 'Forward' },
  { id: 'vinicius', name: 'Vinicius Jr.', avatarUrl: '/img/players/vinicius.jpg', era: 'Modern', role: 'Forward' },
  { id: 'bruyne', name: 'Kevin De Bruyne', avatarUrl: '/img/players/bruyne.jpg', era: 'Modern', role: 'Midfielder' },
  { id: 'salah', name: 'Mohamed Salah', avatarUrl: '/img/players/salah.jpg', era: 'Modern', role: 'Forward' },
  { id: 'neymar', name: 'Neymar Jr.', avatarUrl: '/img/players/neymar.jpg', era: 'Modern', role: 'Forward' },
  { id: 'modric', name: 'Luka Modrić', avatarUrl: '/img/players/modric.jpg', era: 'Modern', role: 'Midfielder' },
  { id: 'benzema', name: 'Karim Benzema', avatarUrl: '/img/players/benzema.jpg', era: 'Modern', role: 'Forward' },
  { id: 'lewandowski', name: 'Robert Lewandowski', avatarUrl: '/img/players/lewandowski.jpg', era: 'Modern', role: 'Forward' },
  { id: 'suarez', name: 'Luis Suárez', avatarUrl: '/img/players/suarez.jpg', era: 'Modern', role: 'Forward' },
  { id: 'kane', name: 'Harry Kane', avatarUrl: '/img/players/kane.jpg', era: 'Modern', role: 'Forward' },
  { id: 'kroos', name: 'Toni Kroos', avatarUrl: '/img/players/kroos.jpg', era: 'Legend', role: 'Midfielder' },
  { id: 'ramos', name: 'Sergio Ramos', avatarUrl: '/img/players/ramos.jpg', era: 'Legend', role: 'Defender' },
  { id: 'puyol', name: 'Carles Puyol', avatarUrl: '/img/players/puyol.jpg', era: 'Legend', role: 'Defender' },
  { id: 'roberto_carlos', name: 'Roberto Carlos', avatarUrl: '/img/players/roberto_carlos.jpg', era: 'Legend', role: 'Defender' },
  { id: 'cafu', name: 'Cafu', avatarUrl: '/img/players/cafu.jpg', era: 'Legend', role: 'Defender' },
  { id: 'pirlo', name: 'Andrea Pirlo', avatarUrl: '/img/players/pirlo.jpg', era: 'Legend', role: 'Midfielder' },
  { id: 'buffon', name: 'Gianluigi Buffon', avatarUrl: '/img/players/buffon.jpg', era: 'Legend', role: 'Goalkeeper' },
  { id: 'casillas', name: 'Iker Casillas', avatarUrl: '/img/players/casillas.jpg', era: 'Legend', role: 'Goalkeeper' },
  { id: 'neuer', name: 'Manuel Neuer', avatarUrl: '/img/players/neuer.jpg', era: 'Modern', role: 'Goalkeeper' },
  { id: 'drogba', name: 'Didier Drogba', avatarUrl: '/img/players/drogba.jpg', era: 'Legend', role: 'Forward' },
  { id: 'rooney', name: 'Wayne Rooney', avatarUrl: '/img/players/rooney.jpg', era: 'Legend', role: 'Forward' },
  { id: 'gerrard', name: 'Steven Gerrard', avatarUrl: '/img/players/gerrard.jpg', era: 'Legend', role: 'Midfielder' },
  { id: 'lampard', name: 'Frank Lampard', avatarUrl: '/img/players/lampard.jpg', era: 'Legend', role: 'Midfielder' },
  { id: 'scholes', name: 'Paul Scholes', avatarUrl: '/img/players/scholes.jpg', era: 'Legend', role: 'Midfielder' },
  { id: 'bale', name: 'Gareth Bale', avatarUrl: '/img/players/bale.jpg', era: 'Legend', role: 'Forward' },
  { id: 'zlatan', name: 'Zlatan Ibrahimović', avatarUrl: '/img/players/zlatan.jpg', era: 'Legend', role: 'Forward' },
  { id: 'robben', name: 'Arjen Robben', avatarUrl: '/img/players/robben.jpg', era: 'Legend', role: 'Forward' },
  { id: 'ribery', name: 'Franck Ribéry', avatarUrl: '/img/players/ribery.jpg', era: 'Legend', role: 'Forward' },
  { id: 'van_dijk', name: 'Virgil van Dijk', avatarUrl: '/img/players/van_dijk.jpg', era: 'Modern', role: 'Defender' },
  { id: 'rodri', name: 'Rodri', avatarUrl: '/img/players/rodri.jpg', era: 'Modern', role: 'Midfielder' },
  { id: 'saka', name: 'Bukayo Saka', avatarUrl: '/img/players/saka.jpg', era: 'Modern', role: 'Forward' },
  { id: 'foden', name: 'Phil Foden', avatarUrl: '/img/players/foden.jpg', era: 'Modern', role: 'Midfielder' },
  { id: 'musiala', name: 'Jamal Musiala', avatarUrl: '/img/players/musiala.jpg', era: 'Modern', role: 'Midfielder' },
  { id: 'wirtz', name: 'Florian Wirtz', avatarUrl: '/img/players/wirtz.jpg', era: 'Modern', role: 'Midfielder' },
  { id: 'yamal', name: 'Lamine Yamal', avatarUrl: '/img/players/yamal.jpg', era: 'Modern', role: 'Forward' },
];

export function findAvatarByUrl(url?: string | null): FootballerAvatar | undefined {
  if (!url) return undefined;
  return FOOTBALLER_AVATARS.find(avatar => avatar.avatarUrl === url.trim());
}

export function getAvatarLabel(url?: string | null): string | null {
  const match = findAvatarByUrl(url);
  return match ? match.name : null;
}

