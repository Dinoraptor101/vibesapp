import React from 'react';
import './LocationRequest.css';
import { Link } from 'react-router-dom';

/**
 * Displays a location permission request to users.
 * Provides information about how location data is used and links to legal documentation.
 * @returns {React.ReactElement} A location request explanation element
 */
const LocationRequest = () => {
  return (
    <div className="location-request-container">
      <div className="location-request-content">
        <h2>
          <strong>Turn On Location</strong>
        </h2>
        <p>We use your location to make things better for you by:</p>
        <ul>
          <li>
            <strong>Adding your general location to your posts</strong>, so people near you see your
            post.
          </li>
          <li>
            <strong>Showing you posts from people nearby</strong>, so you see what’s happening
            around you.
          </li>
        </ul>
        <p>
          <em>
            Unlike others, we NEVER collect your exact location, or in real time, we don’t sell your
            info, and we only use your location for the reasons above!
          </em>
        </p>
        <p>
          For more information, please read our{' '}
          <Link to="/document#legal-stuff" className="profile-link">
            Legal Stuff
          </Link>{' '}
          .
        </p>
      </div>
    </div>
  );
};

export default LocationRequest;
