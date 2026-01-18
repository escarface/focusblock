// FocusBlocks - Native SF Symbols Icons
// Using expo-symbols for native iOS iconography

import React from 'react';
import { SymbolView } from 'expo-symbols';
import { Platform } from 'react-native';
import { Icon as FallbackIcon } from './Icons';

// Map of icon names to SF Symbol names
const SYMBOL_MAP = {
  // Tab icons
  timer: 'timer',
  tasks: 'list.bullet.rectangle',
  history: 'calendar',
  settings: 'gearshape',

  // Action icons
  play: 'play.fill',
  pause: 'pause.fill',
  reset: 'arrow.clockwise',
  skip: 'forward.end.fill',
  plus: 'plus',
  close: 'xmark',
  back: 'chevron.left',
  'chevron-right': 'chevron.right',
  'chevron-left': 'chevron.left',
  check: 'checkmark',
  checkCircle: 'checkmark.circle',
  edit: 'pencil',
  trash: 'trash',
  mail: 'envelope',
  briefcase: 'briefcase',
  restaurant: 'fork.knife',
  list: 'list.bullet',
  bell: 'bell',
  globe: 'globe',
  moon: 'moon',
  user: 'person',
  creditCard: 'creditcard',
  logout: 'rectangle.portrait.and.arrow.right',
  filter: 'line.3.horizontal.decrease',
  up: 'chevron.up',
  down: 'chevron.down',
  google: 'g.circle.fill',
  github: 'link.circle.fill',
};

export function SymbolIcon({ name, color = '#000', size = 24, weight = 'regular' }) {
  // On iOS, use native SF Symbols
  if (Platform.OS === 'ios' && SYMBOL_MAP[name]) {
    return (
      <SymbolView
        name={SYMBOL_MAP[name]}
        size={size}
        type="monochrome"
        tintColor={color}
        weight={weight}
        style={{ width: size, height: size }}
      />
    );
  }

  // Fallback to custom SVG icons on Android/Web
  return <FallbackIcon name={name} color={color} size={size} />;
}

export function TabSymbolIcon({ name, color, size = 24 }) {
  return <SymbolIcon name={name} color={color} size={size} weight="medium" />;
}

export default { SymbolIcon, TabSymbolIcon };
