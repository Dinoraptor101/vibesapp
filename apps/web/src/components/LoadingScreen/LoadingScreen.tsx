import type React from 'react';
import Spinner from '../Spinner/Spinner';

interface LoadingScreenProps {
  showQuote: boolean;
  quote: string;
}

/**
 * A loading screen component that displays a spinner and a quote.
 * Used during initial applicaiton loading when backend server is resuming operations.
 * @param {LoadingScreenProps} props - The loading screen properties
 * @param {boolean} props.showQuote - Whether to display the quote
 * @param {string} props.quote - The quote text to display
 * @returns {React.ReactElement} A loading screen element
 */
const LoadingScreen: React.FC<LoadingScreenProps> = ({ showQuote, quote }) => (
  <div className="loading-container">
    <Spinner />
    {showQuote ? <p>{quote}</p> : null}
  </div>
);

export default LoadingScreen;
