const axios = require('axios');

let isVerifying = false;

exports.verifyToken = async (req, res) => {
  const { token } = req.body;
  if (!token) {
    console.log('Recaptcha token is missing');
    return res.status(400).json({ success: false, message: 'Token is required' });
  }

  if (isVerifying) {
    console.log('Recaptcha verification is already in progress');
    return res.status(429).json({
      success: false,
      message: 'Recaptcha verification is already in progress',
    });
  }

  isVerifying = true;

  try {
    console.log('Verifying recaptcha token...');
    const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
      params: {
        secret: process.env.REACT_APP_RECAPTCHA_SECRET,
        response: token,
      },
      timeout: 5000,
    });

    isVerifying = false;

    if (response.data.success) {
      console.log('Recaptcha verification successful');
      return res.json({ success: true });
    } else {
      console.log('Recaptcha verification failed');
      console.log('Response from service (data):', response.data);
      return res.status(400).json({
        success: false,
        message: 'Recaptcha verification failed',
      });
    }
  } catch (error) {
    isVerifying = false;
    if (error.code === 'ECONNABORTED') {
      console.error('Recaptcha verification timed out');
      return res.status(408).json({ success: false, message: 'Recaptcha verification timed out' });
    }
    console.error('Recaptcha verification error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
