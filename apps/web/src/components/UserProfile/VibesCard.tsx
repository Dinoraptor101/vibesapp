import type React from 'react';
import './VibesCard.css';
import { faYinYang } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getVibesColor } from '../../services/userService';
import type { VibesProps } from '../../types';

/**
 * VibesCard component displays a visual representation of user's vibes level.
 * It shows a vertical meter with different colors representing vibe levels,
 * and allows users to toggle the vibes legend display.
 *
 * @component
 * @param {number} userVibes - The user's current vibes level
 * @param {Function} toggleLegend - Function to toggle the vibes legend visibility
 */
const VibesCard: React.FC<VibesProps> = ({ userVibes, toggleLegend }) => {
  const renderVibesMeter = (vibes: number) => {
    const remainder = vibes % 100; // converting to percentage

    return (
      <div className="vibes-meter">
        <div
          className={`vibes-bar vibes-bar-${getVibesColor(vibes)}`}
          style={{
            height: `${100}%`,
            boxShadow:
              'inset 0 4px 6px rgba(0, 0, 0, 0.4), inset 0 -4px 6px rgba(255, 255, 255, 0.1)',
          }}
        ></div>
        {remainder > 0 && (
          <div
            className={`vibes-bar vibes-bar-${getVibesColor(vibes + 100)}`} // show the reminder in the next bar color
            style={{
              height: `${remainder}%`,
              position: 'absolute',
              bottom: 0,
              borderRadius: '15px 15px 0 0',
              boxShadow:
                'inset 0 4px 6px rgba(0, 0, 0, 0.4), inset 0 -4px 6px rgba(255, 255, 255, 0.1)',
            }}
          ></div>
        )}
      </div>
    );
  };

  return (
    <div className="vibes-card" onClick={toggleLegend} data-testid="vibes-card">
      <FontAwesomeIcon className="vibes-title" icon={faYinYang} />
      {renderVibesMeter(userVibes)}
    </div>
  );
};

export default VibesCard;
