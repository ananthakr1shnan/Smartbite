const cron = require('node-cron');
const { sendExpiryEmail } = require('./emailService');

// Run every day at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    // Get all users with their expiring items
    const users = await User.find({}).populate('expiringItems');
    
    for (const user of users) {
      const today = new Date();
      const expiringItems = user.expiringItems.filter(item => {
        const expiryDate = new Date(item.expiryDate);
        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        // Check for items expiring in 3 days or less
        return daysUntilExpiry <= 3 && daysUntilExpiry >= 0;
      });

      if (expiringItems.length > 0) {
        await sendExpiryEmail(user.email, expiringItems);
      }
    }
  } catch (error) {
    console.error('Error in expiry notification scheduler:', error);
  }
}); 