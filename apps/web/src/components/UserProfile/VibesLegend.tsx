import { useEffect, useState } from 'react';
import './VibesLegend.css';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  getPermissionControls,
  getPermissionDirectMessage,
  getPermissionGroupChat,
  getPermissionOmniverse,
} from '../../services/userPermissions';

/**
 * VibesLegend component displays an explanation of different vibe levels
 * and their associated permissions/features. It provides a color-coded guide
 * that helps users understand the vibes system and available features at each level.
 *
 * @component
 */
const VibesLegend = () => {
  const [permissions, setPermissions] = useState({
    controls: false,
    groupChat: false,
    directMessage: false,
    omniverse: false,
  });

  useEffect(() => {
    const fetchPermissions = async () => {
      const controls = await getPermissionControls();
      const groupChat = await getPermissionGroupChat();
      const directMessage = await getPermissionDirectMessage();
      const omniverse = await getPermissionOmniverse();

      setPermissions({
        controls,
        groupChat,
        directMessage,
        omniverse,
      });
    };

    fetchPermissions();
  }, []);

  return (
    <div className="vibes-legend">
      <h3 className="vibes-legend-title">Vibes Legend</h3>
      <table aria-label="Vibes level descriptions">
        <thead className="sr-only">
          <tr>
            <th scope="col">Level</th>
            <th scope="col">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row" style={{ textAlign: 'right' }}>
              <span className="vibes-legend-cool-grey">●</span>
            </th>
            <td
              style={{
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <strong>Naughty corner</strong>: <span className="vibes-perk">become positive</span>
              </div>
            </td>
          </tr>
          <tr>
            <th scope="row" style={{ textAlign: 'right' }}>
              <span className="vibes-legend-sunny-yellow">●</span>
            </th>
            <td
              style={{
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <strong>Carefree child</strong>: <span className="vibes-perk">View Controls</span>
              </div>
              {permissions.controls && (
                <FontAwesomeIcon icon={faCheck} className="permission-check-small" />
              )}
            </td>
          </tr>
          <tr>
            <th scope="row" style={{ textAlign: 'right' }}>
              <span className="vibes-legend-vibrant-green">●</span>
            </th>
            <td
              style={{
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <strong>Nurturing compassion</strong>:{' '}
                <span className="vibes-perk">Group chat</span>
              </div>
              {permissions.groupChat && (
                <FontAwesomeIcon icon={faCheck} className="permission-check-small" />
              )}
            </td>
          </tr>
          <tr>
            <th scope="row" style={{ textAlign: 'right' }}>
              <span className="vibes-legend-cool-blue">●</span>
            </th>
            <td
              style={{
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <strong>Positive guide</strong>:{' '}
                <span className="vibes-perk">Direct messaging</span>
              </div>
              {permissions.directMessage && (
                <FontAwesomeIcon icon={faCheck} className="permission-check-small" />
              )}
            </td>
          </tr>
          <tr>
            <th scope="row" style={{ textAlign: 'right' }}>
              <span className="vibes-legend-hero-red">●</span>
            </th>
            <td
              style={{
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <strong>One with the force</strong>:{' '}
                <span className="vibes-perk">Omniverse range</span>
              </div>
              {permissions.omniverse && (
                <FontAwesomeIcon icon={faCheck} className="permission-check-small" />
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default VibesLegend;
