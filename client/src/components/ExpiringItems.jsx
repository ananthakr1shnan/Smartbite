import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import { Alert, AlertDescription } from './alert';
import { Loader } from 'lucide-react';

const ExpiringItems = ({ items, onSelectItem, selectedItems, userEmail }) => {
  const [emailStatus, setEmailStatus] = useState({ loading: false, error: null, success: false });
  const [lastNotifiedItems, setLastNotifiedItems] = useState(() => {
    // Initialize from localStorage to persist across sessions
    const saved = localStorage.getItem('lastNotifiedItems');
    return saved ? JSON.parse(saved) : [];
  });
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  // Initialize EmailJS
  useEffect(() => {
    emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
  }, []);

  const daysToExpire = (expiryDate) => {
    const today = new Date();
    const expDate = new Date(expiryDate);
    const timeDiff = expDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  const isExpired = (expiryDate) => {
    const today = new Date();
    const expDate = new Date(expiryDate);
    return expDate < today;
  };

  const handleSelectItem = (item) => {
    onSelectItem(item);
  };

  const expiringItems = items.filter(item =>
    daysToExpire(item.expiry) <= 3 && !isExpired(item.expiry)
  );

  const nonExpiringItems = items.filter(item =>
    daysToExpire(item.expiry) > 3 && !isExpired(item.expiry)
  );

  // Format items for email
  const formatItemsForEmail = (items) => {
    return items.map(item => ({
      name: item.name,
      daysLeft: daysToExpire(item.expiry),
      category: item.category,
      expiry: new Date(item.expiry).toLocaleDateString()
    }));
  };

  // Send email notification
  const sendExpiryNotification = async (items) => {
    if (!userEmail || items.length === 0) return;

    setEmailStatus({ loading: true, error: null, success: false });

    try {
      const formattedItems = formatItemsForEmail(items);

      // Create HTML table for items
      const itemsTable = formattedItems
        .map(item => `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">${item.name}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${item.daysLeft} days</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${item.category}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${item.expiry}</td>
          </tr>
        `)
        .join('');

      const emailContent = `
        <div style="font-family: Arial, sans-serif;">
          <h2 style="color: #e53e3e;">⚠️ Food Items Expiring Soon</h2>
          <p>The following items in your pantry are expiring soon:</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 8px; border: 1px solid #ddd;">Item Name</th>
                <th style="padding: 8px; border: 1px solid #ddd;">Days Left</th>
                <th style="padding: 8px; border: 1px solid #ddd;">Category</th>
                <th style="padding: 8px; border: 1px solid #ddd;">Expiry Date</th>
              </tr>
            </thead>
            <tbody>
              ${itemsTable}
            </tbody>
          </table>
          <p style="margin-top: 16px;">Please use these items soon to avoid food waste!</p>
        </div>
      `;

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          to_email: userEmail,
          html_content: emailContent,
          subject: `🚨 ${items.length} items expiring soon in your pantry!`
        }
      );

      // Update lastNotifiedItems in both state and localStorage
      const newNotifiedItems = [...lastNotifiedItems, ...items.map(item => item._id)];
      setLastNotifiedItems(newNotifiedItems);
      localStorage.setItem('lastNotifiedItems', JSON.stringify(newNotifiedItems));

      setEmailStatus({ loading: false, error: null, success: true });

      // Clear success message after 5 seconds
      setTimeout(() => {
        setEmailStatus(prev => ({ ...prev, success: false }));
      }, 5000);

    } catch (error) {
      console.error('Failed to send email notification:', error);
      setEmailStatus({
        loading: false,
        error: 'Failed to send email notification. Please try again later.',
        success: false
      });
    }
  };

  // Check for new expiring items and send notification
  useEffect(() => {
    // Get only the newly expiring items (items that weren't previously notified)
    const newExpiringItems = expiringItems.filter(
      item => !lastNotifiedItems.includes(item._id)
    );

    // Only send notification if there are new items expiring
    if (newExpiringItems.length > 0 && userEmail) {
      sendExpiryNotification(newExpiringItems);
    }
  }, [expiringItems.map(item => item._id).join(',')]); // Only trigger when expiring items list changes

  const handleEmailUpdate = (e) => {
    e.preventDefault();
    if (newEmail) {
      localStorage.setItem('userEmail', newEmail);
      window.location.reload();
    }
  };

  // Add this function to handle email change click
  const handleChangeEmailClick = () => {
    setIsEditingEmail(true);
    setNewEmail(userEmail); // Initialize with current email
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 transition-all duration-300 hover:shadow-xl border border-indigo-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-indigo-900 flex items-center">
          <span className="text-2xl mr-2">🚨</span> 
          Expiring Soon
        </h3>
        <div className="flex gap-3 items-center">
          {userEmail ? (
            <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
              {isEditingEmail ? (
                <form onSubmit={handleEmailUpdate} className="flex items-center gap-2">
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="px-2 py-1 border rounded"
                    placeholder="Enter new email"
                  />
                  <button
                    type="submit"
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Save
                  </button>
                </form>
              ) : (
                <>
                  <span className="opacity-75">📧</span> {userEmail}
                  <button
                    onClick={handleChangeEmailClick}
                    className="ml-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200"
                  >
                    Change
                  </button>
                </>
              )}
            </div>
          ) : (
            <span className="text-sm text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-200">
              ⚠️ Set email for notifications
            </span>
          )}
        </div>
      </div>

      {/* Expiring Items Section */}
      {expiringItems.length > 0 ? (
        <div className="space-y-3">
          {expiringItems.map(item => (
            <div 
              key={item._id}
              className={`group flex items-center justify-between p-4 rounded-xl transition-all duration-300 
                ${selectedItems.includes(item) 
                  ? 'bg-indigo-50 border-indigo-200 shadow-md' 
                  : 'border border-gray-100 hover:border-indigo-200 hover:shadow-md'
                }`}
            >
              <div className="flex items-center flex-1">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item)}
                    onChange={() => handleSelectItem(item)}
                    className="w-5 h-5 rounded border-gray-300 text-indigo-600 
                             focus:ring-indigo-500 transition-all duration-200
                             group-hover:border-indigo-400"
                  />
                  <div className={`absolute w-10 h-10 -inset-2.5 rounded-full transition-all duration-300 
                    ${selectedItems.includes(item) ? 'bg-indigo-100' : 'bg-transparent'} 
                    group-hover:bg-indigo-50 -z-10`}
                  />
                </div>
                <div className="ml-4">
                  <h4 className="font-medium text-gray-900 group-hover:text-indigo-700 transition-colors duration-200">
                    {item.name}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Expires in: <span className="font-medium text-red-600">{daysToExpire(item.expiry)} days</span>
                  </p>
                  <span className="inline-block mt-1 text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    {item.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-gray-500">No items expiring soon.</p>
        </div>
      )}

      {/* Extra Items Section */}
      {/* {showExtraItems && (
        <div className="mt-8 animate-fadeIn">
          <h4 className="text-lg font-semibold mb-4 text-indigo-900 flex items-center">
            <span className="text-xl mr-2">🔍</span> Additional Items
          </h4>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {nonExpiringItems.map(item => (
              <div
                key={item._id}
                className={`group flex items-center justify-between p-4 rounded-xl transition-all duration-300 
                  ${selectedItems.includes(item) 
                    ? 'bg-indigo-50 border-indigo-200 shadow-md' 
                    : 'border border-gray-100 hover:border-indigo-200 hover:shadow-md'
                  }`}
              >
                <div className="flex items-center flex-1">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item)}
                      onChange={() => handleSelectItem(item)}
                      className="w-5 h-5 rounded border-gray-300 text-indigo-600 
                               focus:ring-indigo-500 transition-all duration-200
                               group-hover:border-indigo-400"
                    />
                    <div className={`absolute w-10 h-10 -inset-2.5 rounded-full transition-all duration-300 
                      ${selectedItems.includes(item) ? 'bg-indigo-100' : 'bg-transparent'} 
                      group-hover:bg-indigo-50 -z-10`}
                    />
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium text-gray-900 group-hover:text-indigo-700 transition-colors duration-200">
                      {item.name}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Expires in: <span className="font-medium text-green-600">{daysToExpire(item.expiry)} days</span>
                    </p>
                    <span className="inline-block mt-1 text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                      {item.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )} */}
    </div>
  );
};

// Add these styles to your global CSS file
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
  }

  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #818CF8 #EEF2FF;
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: #EEF2FF;
    border-radius: 10px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #818CF8;
    border-radius: 10px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #6366F1;
  }
`;

export default ExpiringItems;