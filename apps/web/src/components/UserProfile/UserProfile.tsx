import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Spinner from '../Spinner/Spinner';
import './UserProfile.css';
import { faCopy, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  getUserAge,
  getUserId,
  getUserMBTIPersonality,
  getUserName,
  getUserPolarity,
  getUserSex,
  getUserVibes,
  logout,
  updateUserMBTIPersonality,
  updateUserPolarity,
} from '../../services/userService';
import './UserProfile.css';
import type { UserProfileProps } from '../../types';
import { getCookie } from '../../utils/cookieUtils';
import { mbtiOptions } from '../../utils/mbtiUtils';
import CustomSelector from '../WelcomeForm/CustomSelector/CustomSelector';
import VibesCard from './VibesCard';
import VibesLegend from './VibesLegend';

/**
 * UserProfile component displays user information and vibes status.
 * It shows basic user details like name, age, sex, and a unique pigeon tag,
 * along with a vibes visualization and navigation links.
 *
 * @component
 * @param {string} userId - The unique identifier for the user
 * @param {string} version - The current version of the application
 * @param {Function} setNotification - Function to display notifications
 */
const UserProfile: React.FC<UserProfileProps> = ({ version, setNotification }) => {
  const pigeonId = getCookie('pigeonId');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [userAge, setUserAge] = useState(0);
  const [userSex, setUserSex] = useState('');
  const [userVibes, setUserVibes] = useState(0);
  const [userPolarity, setUserPolarity] = useState('');
  const [userMBTIPersonality, setUserMBTIPersonality] = useState('');
  const [showLegend, setShowLegend] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [polarityOptions] = useState([
    { value: 'yang', label: 'Yang (Masculine)' },
    { value: 'yin', label: 'Yin (Feminine)' },
  ]);

  useEffect(() => {
    if (showLegend && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showLegend]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setUserId(await getUserId());
        setUserName(await getUserName());
        setUserAge(await getUserAge());
        setUserSex(await getUserSex());
        setUserVibes(await getUserVibes());
        setUserPolarity(await getUserPolarity());
        setUserMBTIPersonality(await getUserMBTIPersonality());
        setLoading(false);
      } catch (_err) {
        setError('Failed to load user data');
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  /**
   * When the legend is displayed the body expands and auto-scrolls.
   */
  useEffect(() => {
    if (showLegend) {
      document.body.classList.add('show-legend');
      if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      document.body.classList.remove('show-legend');
    }
  }, [showLegend]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pigeonId).then(() => {
      setNotification({
        message: 'Copied',
        type: 'success',
      });
    });
  };

  const toggleLegend = () => {
    setShowLegend(!showLegend);
  };

  const handleLogout = () => {
    logout();
  };

  const handlePolarityChange = async (newPolarity: string) => {
    if (newPolarity !== 'yin' && newPolarity !== 'yang') {
      setNotification({ message: 'Invalid polarity value. Must be Yin or Yang.', type: 'error' });
      return;
    }

    try {
      await updateUserPolarity(userId, newPolarity);
      setUserPolarity(newPolarity);
      //setNotification({ message: 'Polarity updated!', type: 'success' });
    } catch (_error) {
      setNotification({ message: 'Failed to update polarity.', type: 'error' });
    }
  };

  const handleMBTIChange = async (newMBTI: string) => {
    try {
      await updateUserMBTIPersonality(userId, newMBTI);
      setUserMBTIPersonality(newMBTI);
      // setNotification({ message: 'Updated!', type: 'success' });
    } catch (_error) {
      setNotification({ message: 'Failed to update MBTI.', type: 'error' });
    }
  };

  if (loading) return <Spinner />;
  if (error) return <div>{error}</div>;

  return (
    <div className="user-profile">
      <div className="profile-card">
        <div className="profile-content">
          <div className="user-info">
            <table>
              <tbody>
                <tr>
                  <td>
                    <strong>Name:</strong>
                  </td>
                  <td>{userName}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Age:</strong>
                  </td>
                  <td>{userAge}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Sex:</strong>
                  </td>
                  <td>{userSex}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Polarity:</strong>
                  </td>
                  <td>
                    <CustomSelector
                      id="polarity-selector"
                      value={userPolarity || ''}
                      options={polarityOptions}
                      onChange={handlePolarityChange}
                      placeholder="Your Polarity"
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>MBTI:</strong>
                  </td>
                  <td>
                    <CustomSelector
                      id="mbti-selector"
                      value={userMBTIPersonality || ''}
                      options={mbtiOptions}
                      onChange={handleMBTIChange}
                      placeholder="Your MBTI"
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Pigeon:</strong>
                  </td>
                  <td className="pigeon-tag" onClick={copyToClipboard} data-testid="pigeon-tag">
                    ******
                    <FontAwesomeIcon icon={faCopy} className="copy-icon" />
                  </td>
                </tr>
                <tr>
                  <td colSpan={2}>
                    <button type="button" onClick={handleLogout} className="logout-button">
                      <FontAwesomeIcon icon={faSignOutAlt} className="logout-icon" />
                      Logout
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="vibes-section">
            <VibesCard userVibes={userVibes} toggleLegend={toggleLegend} />
          </div>
        </div>
        <div className="profile-links">
          <table>
            <tbody>
              <tr>
                <td>
                  <Link to="/document" className="profile-link">
                    Documentation
                  </Link>
                </td>
              </tr>
              <tr>
                <td>
                  <Link to="/issue" className="profile-link">
                    Report an Issue
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      {showLegend && <VibesLegend />}
      <div className="development-version">Version: {version} beta</div>
      <div ref={bottomRef}></div>
    </div>
  );
};

export default UserProfile;
