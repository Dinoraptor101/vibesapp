import './Spinner.css';
import logo from '../../logo.svg'; // Ensure the correct path to your logo

/**
 * Spinner component displays an animated loading indicator using the app logo.
 * Used during loading states throughout the application.
 *
 * @component
 * @returns {JSX.Element} A spinning logo animation
 */
const Spinner = () => {
  return (
    <div className="logo-spinner">
      <img src={logo} alt="Loading..." className="logo-image" />
    </div>
  );
};

export default Spinner;
