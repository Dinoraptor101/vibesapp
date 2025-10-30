import { faBell, faComments, faGrip, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getPermissionDirectMessage } from '../../services/userPermissions';
import type { NavLinkProps } from '../../types';
import './NavLink.css';

/**
 * A navigation link component that renders different icons based on the label.
 * Supports Posts, Create Post, Activities, and Conversations navigation items with visual
 * indicators for active state and unread notifications.
 * @param {NavLinkProps} props - The navigation link properties
 * @returns {React.ReactElement | null} A navigation link element or null for unknown labels
 */
const NavLink: React.FC<NavLinkProps> = ({ to, label, unread }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  const [hasDMPermission, setHasDMPermission] = useState(false);

  useEffect(() => {
    const checkPermission = async () => {
      const permission = await getPermissionDirectMessage();
      setHasDMPermission(permission);
    };
    checkPermission();
  }, []);

  const getButton = (label: string) => {
    switch (label) {
      case 'Posts':
        return (
          <Link to={to} className={`tab ${isActive ? 'active' : ''}`}>
            <FontAwesomeIcon icon={faGrip} />
          </Link>
        );
      case 'Create Post':
        return (
          <Link to={to} className={`tab ${isActive ? 'active' : ''}`} data-testid="tab-create-post">
            <FontAwesomeIcon icon={faPlus} />
          </Link>
        );
      case 'Activities':
        return (
          <Link to={to} className={`tab ${isActive ? 'active' : ''}`} data-testid="tab-activities">
            <span className={`activity ${unread ? 'unread' : ''}`}>
              <FontAwesomeIcon icon={faBell} />
            </span>
          </Link>
        );
      case 'Conversations':
        if (!hasDMPermission) return null;
        return (
          <Link
            to={to}
            className={`tab ${isActive ? 'active' : ''}`}
            data-testid="tab-conversations"
          >
            <span className={`activity ${unread ? 'unread' : ''}`}>
              <FontAwesomeIcon icon={faComments} />
            </span>
          </Link>
        );
      default:
        return null;
    }
  };

  return getButton(label);
};

export default NavLink;
