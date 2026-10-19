import Image from 'next/image';
import type { ScoutPlayer } from '@/lib/scouts-duel/types';

export default function ScoutPlayerDetails({player}:{player:ScoutPlayer}) {
  return <span className="scout-player-details">
    <span className="scout-player-position" data-position={player.position} title={{FW:'Forward',MF:'Midfielder',DF:'Defender',GK:'Goalkeeper'}[player.position]}>{player.position}</span>
    <Image className="scout-player-flag" src={player.nationalityFlag} alt={`${player.nationality} flag`} title={player.nationality} width={23} height={15}/>
    {player.clubBadge ? <Image className="scout-player-club" src={player.clubBadge} alt={player.club} title={player.club} width={24} height={24}/> : <span className="scout-player-club-name" title={player.club}>{player.club}</span>}
  </span>;
}
