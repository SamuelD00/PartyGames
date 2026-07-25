import { useTheme } from '../theme/ThemeContext';
import { IconCloud, IconMoon, IconSun } from './icons';
import './MobSky.css';

interface MobSkyProps {
  mode: 'day' | 'night';
}

const CLOUDS = [
  { top: '14%', left: '6%', size: 130, opacity: 0.55, duration: 46 },
  { top: '32%', left: '52%', size: 96, opacity: 0.4, duration: 58 },
  { top: '9%', left: '66%', size: 74, opacity: 0.45, duration: 38 },
];

export function MobSky({ mode }: MobSkyProps) {
  const { theme } = useTheme();
  const cloudy = mode === 'day' && theme === 'dark';

  return (
    <div className={`mob-sky mob-sky--${mode}`} aria-hidden="true">
      {mode === 'night' && <div className="mob-stars" />}
      {cloudy &&
        CLOUDS.map((cloud, i) => (
          <IconCloud
            key={i}
            size={cloud.size}
            className="mob-cloud"
            style={{
              top: cloud.top,
              left: cloud.left,
              opacity: cloud.opacity,
              animationDuration: `${cloud.duration}s`,
            }}
          />
        ))}
      {mode === 'day' ? (
        <IconSun size={72} className="mob-celestial mob-sun" />
      ) : (
        <IconMoon size={64} className="mob-celestial mob-moon" />
      )}
    </div>
  );
}
