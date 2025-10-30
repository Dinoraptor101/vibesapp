import { faHome } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import './PostNotFound.css';

/**
 * PostsNotFound component displays a 404-like error page when a post cannot be found.
 * It provides a user-friendly message and a button to return to the home page.
 *
 * @component
 */
const PostsNotFound = () => {
  return (
    <div className="posts-not-found">
      <h1>Post Not Found</h1>
      <p>Sorry, the post you are looking for has either been deleted or never existed.</p>
      <Link to="/" className="return-home-button" data-testid="return-home-button">
        <FontAwesomeIcon icon={faHome} />
        &nbsp;Return
      </Link>
    </div>
  );
};

export default PostsNotFound;
