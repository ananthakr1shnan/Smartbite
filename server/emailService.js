const emailjs = require('@emailjs/nodejs');

const sendExpiryEmail = async (userEmail, expiringItems) => {
  try {
    await emailjs.send(
      'YOUR_SERVICE_ID',
      'YOUR_TEMPLATE_ID',
      {
        to_email: userEmail,
        items: expiringItems.map(item => ({
          name: item.name,
          expiryDate: new Date(item.expiryDate).toLocaleDateString()
        }))
      },
      {
        publicKey: process.env.EMAILJS_PUBLIC_KEY,
        privateKey: process.env.EMAILJS_PRIVATE_KEY,
      }
    );
  } catch (error) {
    console.error('Error sending expiry notification:', error);
  }
};

module.exports = { sendExpiryEmail }; 