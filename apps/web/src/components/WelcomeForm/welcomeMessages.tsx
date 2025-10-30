import { Link } from 'react-router-dom';

const welcomeMessages = [
  {
    message: (
      <>
        <p>
          <strong>Ahoy, matey! Welcome aboard!</strong>
        </p>
        <p>
          Share yer ideas and events with yer fellow pirates! Build connections on the high seas!
        </p>
        <p style={{ padding: '10px 0' }}>
          But mind yer manners! Yer reputation dictates yer privileges around here!&nbsp;
          <Link to="/document#what-is-vibes" className="link-icon">
            Learn more
          </Link>
          .
        </p>
      </>
    ),
  },
  {
    message: (
      <>
        <p>
          <strong>Greetings, esteemed guest!</strong>
        </p>
        <p>
          Connect with your community by sharing ideas and events. Build real-life connections in
          our elegant society!
        </p>
        <p style={{ padding: '10px 0' }}>
          Remember to be courteous! Your reputation affects your privileges here.&nbsp;
          <Link to="/document#what-is-vibes" className="link-icon">
            Learn more
          </Link>
          .
        </p>
      </>
    ),
  },
  {
    message: (
      <>
        <p>
          <strong>Howdy, partner! Welcome to the frontier!</strong>
        </p>
        <p>
          Share your thoughts and happenings with your neighbors! Foster real-world connections in
          the wild west.
        </p>
        <p style={{ padding: '10px 0' }}>
          Keep it respectful! Your reputation influences your privileges in this community.&nbsp;
          <Link to="/document#what-is-vibes" className="link-icon">
            Learn more
          </Link>
          .
        </p>
      </>
    ),
  },
  {
    message: (
      <>
        <p>
          <strong>Welcome, gamer!</strong>
        </p>
        <p>
          Level up by sharing your ideas and events with nearby players! Build epic connections!
        </p>
        <p style={{ padding: '10px 0' }}>
          Play fair! Your reputation affects your in-game privileges!&nbsp;
          <Link to="/document#what-is-vibes" className="link-icon">
            Learn more
          </Link>
          .
        </p>
      </>
    ),
  },
  {
    message: (
      <>
        <p>
          <strong>Yo! Welcome to the crew!</strong>
        </p>
        <p>Share your vibes and events with your squad! Build lit connections!</p>
        <p style={{ padding: '10px 0' }}>
          Stay respectful! Your reputation affects your privileges!&nbsp;
          <Link to="/document#what-is-vibes" className="link-icon">
            Learn more
          </Link>
          .
        </p>
      </>
    ),
  },
  {
    message: (
      <>
        <p>
          <strong>Hey there!</strong>
        </p>
        <p>Share your cool ideas and events with nearby friends! Build awesome connections!</p>
        <p style={{ padding: '10px 0' }}>
          Be kind! Your reputation affects your privileges!&nbsp;
          <Link to="/document#what-is-vibes" className="link-icon">
            Learn more
          </Link>
          .
        </p>
      </>
    ),
  },
];

export const getRandomWelcomeMessage = () => {
  const randomIndex = Math.floor(Math.random() * welcomeMessages.length);
  return welcomeMessages[randomIndex].message;
};
