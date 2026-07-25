import type { ComponentType } from 'react';
import type { IconProps } from '../components/icons';
import { IconDisguise, IconMob } from '../components/icons';

export interface GameDescriptor {
  id: string;
  nameKey: string;
  icon: ComponentType<IconProps>;
}

export const GAMES: GameDescriptor[] = [
  { id: 'impostor', nameKey: 'games.impostor', icon: IconDisguise },
  { id: 'mob', nameKey: 'games.mob', icon: IconMob },
];
