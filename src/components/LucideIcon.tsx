/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import * as icons from 'lucide-react';

interface LucideIconProps {
  name: string;
  className?: string;
  size?: number;
}

export function LucideIcon({ name, className = '', size = 20 }: LucideIconProps) {
  // Safe lookup for preloaded icons to prevent rendering crashes
  const IconComponent = (icons as Record<string, React.ComponentType<{ className?: string, size?: number }>>)[name];
  
  if (!IconComponent) {
    // Return a default icon like HelpCircle if key doesn't match
    const DefaultIcon = icons.HelpCircle;
    return <DefaultIcon className={className} size={size} />;
  }

  return <IconComponent className={className} size={size} />;
}
export default LucideIcon;
