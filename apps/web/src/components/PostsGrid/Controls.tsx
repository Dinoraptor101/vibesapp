import type React from 'react';
import { type ChangeEvent, memo, useCallback, useEffect, useState } from 'react';
import './Controls.css';
import { getPermissionOmniverse } from '../../services/userPermissions';
import type { ControlsProps } from '../../types';
import { setCookie } from '../../utils/cookieUtils';

/** Minimum range value for post filtering */
const minRange = 20;

/**
 * Controls Component
 *
 * Provides UX Controls for filtering and customizing post display.
 * Features include:
 * - Range slider for distance-based filtering
 * - Toggle switch for including/excluding replies
 * - Cookie-based persistence of user preferences
 * - Dynamic maximum range based on user permissions
 *
 * @component
 * @param {ControlsProps} props - Props containing control states and setters
 */
const Controls: React.FC<ControlsProps> = memo(
  ({ withReplies, setWithReplies, range, setRange }) => {
    const [maxRange, setMaxRange] = useState(400);

    useEffect(() => {
      const fetchMaxRange = async () => {
        const permissionMaxRange = await getPermissionOmniverse();
        setMaxRange(permissionMaxRange ? 999 : 400);
      };

      fetchMaxRange();
    }, []);

    /**
     * Handles changes to the range slider value
     * Updates state and persists to cookie
     * @param event - Range input change event
     */
    const handleRangeChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(event.target.value, 10);
        setRange(value);
        setCookie('range', value.toString(), 365);
      },
      [setRange]
    );

    /**
     * Toggles the replies filter state
     * Updates state and persists to cookie
     */
    const handleRepliesToggle = useCallback(() => {
      setWithReplies((prev) => {
        const newWithReplies = !prev;
        setCookie('withReplies', newWithReplies.toString(), 365);
        return newWithReplies;
      });
    }, [setWithReplies]);

    const rangeValueClass = range > 400 ? 'range-value-darkblue' : 'range-value';
    const displayRange = range === 999 ? 'Omniverse' : `${range}Mi`;

    return (
      <div className="controls">
        <div className="control-item">
          <input
            type="range"
            min={minRange}
            max={maxRange}
            value={range === maxRange ? maxRange.toString() : range}
            onChange={handleRangeChange}
            className="slider"
            data-testid="range-slider"
          />
          <span className={`range-value ${rangeValueClass}`}>{displayRange}</span>
        </div>
        <div className="control-item">
          <label className="toggle-label">
            <span className="toggle-text">Replies</span>
            <div className="toggle-switch">
              <input
                type="checkbox"
                checked={withReplies}
                onChange={handleRepliesToggle}
                data-testid="replies-toggle"
              />
              <span className="slider round"></span>
            </div>
          </label>
        </div>
      </div>
    );
  }
);

Controls.displayName = 'Controls';

export default Controls;
