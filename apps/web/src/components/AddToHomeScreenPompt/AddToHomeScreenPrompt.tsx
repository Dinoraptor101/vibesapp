/**
 * @component AddToHomeScreenPrompt
 * @description Displays a prompt for iOS users to add the web application
 * to their home screen. The prompt is shown only for iOS devices that are not in standalone mode,
 * and includes a "Remind me later" option that sets a cookie to prevent showing the prompt for 14 days.
 */
import React, { useCallback, useEffect, useState } from 'react';
import './AddToHomeScreenPrompt.css';
import { faArrowUpFromBracket } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getCookie, setCookie } from '../../utils/cookieUtils';
import { isIosDevice, isStandaloneMode } from '../../utils/deviceUtils';

const COOKIE_EXPIRATION_DAYS = 14;
const PROMPT_POSTPONED_COOKIE = 'promptPostponed';

const AddToHomeScreenPrompt = () => {
  const [isIos, setIsIos] = useState(false);
  const [isInStandaloneMode, setIsInStandaloneMode] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);

  useEffect(() => {
    setIsInStandaloneMode(isStandaloneMode());
    setIsIos(isIosDevice());

    const isPromptPostponed = getCookie(PROMPT_POSTPONED_COOKIE);
    if (isPromptPostponed === 'true') {
      setShowPrompt(false);
    }
  }, []);

  const handlePostponePrompt = useCallback(() => {
    setCookie(PROMPT_POSTPONED_COOKIE, 'true', COOKIE_EXPIRATION_DAYS);
    setShowPrompt(false);
  }, []);

  if (isIos && !isInStandaloneMode && showPrompt) {
    return (
      <>
        <div
          className="add-to-home-screen-overlay overlay"
          role="dialog"
          aria-label="Install application prompt"
        ></div>
        <div className="add-to-home-screen-prompt">
          <div className="prompt-content">
            <p style={{ fontSize: 'larger' }}>
              <strong>Vibes</strong> works best if you install it
            </p>
            <p>
              Tap share <FontAwesomeIcon icon={faArrowUpFromBracket} /> then{' '}
              <strong>Add to Home Screen</strong>.
            </p>
            <div className="button-group">
              <button
                type="button"
                className="never-show-button"
                onClick={handlePostponePrompt}
                data-testid="never-show-button"
              >
                Remind me later
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
};

export default React.memo(AddToHomeScreenPrompt);
