import React, { useState, useEffect } from 'react';
import { fetchPantryItems, addPantryItem } from '../api/PantryAPI';
import ExpiringItems from './ExpiringItems';
import RecipeGenerator from './RecipeGenerator';
import { Alert, AlertDescription } from './alert';
import { Loader, PlusCircle, Scan, Trash2 } from 'lucide-react';
import ImageCapture from './ImageCapture';
// Add useNavigate import at the top
import { useNavigate } from 'react-router-dom';
export default function PantryPage() {
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showImageCapture, setShowImageCapture] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    expiryDays: 7,
    expiryUnit: 'days',
    category: 'Other'
  });
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');

  useEffect(() => {
    fetchPantryItems()
      .then(setItems)
      .catch(() => setError('Failed to load pantry items'))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectItem = (item) => {
    setSelectedItems(prevItems => 
      prevItems.includes(item)
        ? prevItems.filter(i => i !== item)
        : [...prevItems, item]
    );
  };
const navigate = useNavigate();

const handleLogout = () => {
    localStorage.removeItem('userEmail'); // Clear user data
    navigate('/'); // Redirect to login page
};
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Item name is required.');
      return;
    }

    setLoading(true);
    try {
      const expiryDate = calculateExpiryDate(formData.expiryDays, formData.expiryUnit);
      const newItem = {
        name: formData.name,
        expiry: expiryDate.toISOString().split('T')[0],
        category: formData.category,
        isExpired: false
      };
      const savedItem = await addPantryItem(newItem);
      setItems(prevItems => [...prevItems, savedItem]);
      setFormData({
        name: '',
        expiryDays: 7,
        expiryUnit: 'days',
        category: 'Other'
      });
    } catch {
      setError('Failed to add item.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    setLoading(true);
    try {
      await fetch(`${API_URL}/api/pantry-items/${itemId}?userEmail=${encodeURIComponent(userEmail)}`, {
        method: 'DELETE',
      });
      setItems(items.filter((item) => item._id !== itemId));
      setSelectedItems(selectedItems.filter(item => item._id !== itemId));
    } catch (error) {
      setError('Failed to delete item.');
    } finally {
      setLoading(false);
    }
  };

  const calculateExpiryDate = (days, unit) => {
    const date = new Date();
    switch (unit) {
      case 'days':
        date.setDate(date.getDate() + parseInt(days));
        break;
      case 'weeks':
        date.setDate(date.getDate() + parseInt(days) * 7);
        break;
      case 'months':
        date.setMonth(date.getMonth() + parseInt(days));
        break;
    }
    return date;
  };

  const handleItemsDetected = async (detectedItems) => {
    setLoading(true);
    try {
      for (const item of detectedItems) {
        const expiryDate = calculateExpiryDate(item.estimated_expiry_days, 'days');
        
        const newItem = {
          name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
          expiry: expiryDate.toISOString().split('T')[0],
          category: item.category.charAt(0).toUpperCase() + item.category.slice(1),
          isExpired: false
        };
        
        const savedItem = await addPantryItem(newItem);
        setItems(prevItems => [...prevItems, savedItem]);
      }
    } catch (error) {
      setError('Failed to add detected items to pantry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold text-center mb-12 text-indigo-900 tracking-tight">
          Smart Pantry Manager
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left sidebar */}
          <div className="lg:col-span-1 space-y-8">
            {!userEmail && (
              <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl border border-indigo-100">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-indigo-800">
                  <span className="mr-2">📧</span> Set Email for Notifications
                </h3>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                  onChange={(e) => {
                    setUserEmail(e.target.value);
                    localStorage.setItem('userEmail', e.target.value);
                  }}
                />
              </div>
            )}
            <ExpiringItems 
              items={items} 
              onSelectItem={handleSelectItem} 
              selectedItems={selectedItems}
              userEmail={userEmail}
            />
            <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl border border-indigo-100">
              <h3 className="text-lg font-semibold mb-4 text-indigo-800">Recipe Suggestions</h3>
              <RecipeGenerator 
                selectedItems={selectedItems} 
                items={items} 
                onSelectItem={handleSelectItem} 
              />
            </div>
          </div>

          {/* Main content area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl border border-indigo-100">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-indigo-900">Your Pantry</h2>
                <button
                  onClick={() => setShowImageCapture(!showImageCapture)}
                  className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-300 shadow-md hover:shadow-lg"
                >
                  {showImageCapture ? (
                    <>Hide Scanner</>
                  ) : (
                    <>
                      <Scan className="w-5 h-5 mr-2" />
                      Scan Items
                    </>
                  )}
                </button>
              </div>

              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {showImageCapture && (
                <div className="mb-8 transition-all duration-300">
                  <ImageCapture onItemsDetected={handleItemsDetected} />
                </div>
              )}

              <form onSubmit={handleAddItem} className="mb-8">
                <div className="grid grid-cols-12 gap-4">
                  {/* Item Name */}
                  <div className="col-span-12 sm:col-span-5">
                    <input
                      type="text"
                      name="name"
                      placeholder="Item Name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 text-sm"
                      required
                    />
                  </div>

                  {/* Expiry Days */}
                  <div className="col-span-4 sm:col-span-2">
                    <div className="flex">
                      <input
                        type="number"
                        name="expiryDays"
                        min="1"
                        max="365"
                        value={formData.expiryDays}
                        onChange={handleChange}
                        className="w-full p-2.5 border border-indigo-200 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 text-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* Expiry Unit */}
                  <div className="col-span-8 sm:col-span-2">
                    <select
                      name="expiryUnit"
                      value={formData.expiryUnit}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 text-sm bg-white"
                    >
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                      <option value="months">Months</option>
                    </select>
                  </div>

                  {/* Category */}
                  <div className="col-span-7 sm:col-span-2">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 text-sm bg-white"
                    >
                      <option value="Fruit">🍎 Fruit</option>
                      <option value="Vegetable">🥕 Vegetable</option>
                      <option value="Meat">🥩 Meat</option>
                      <option value="Dairy">🥛 Dairy</option>
                      <option value="Grain">🌾 Grain</option>
                      <option value="Other">📦 Other</option>
                    </select>
                  </div>

                  {/* Add Button */}
                  <div className="col-span-5 sm:col-span-1">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-full px-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-green-300 transition-colors duration-300 flex items-center justify-center text-sm"
                    >
                      {loading ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <PlusCircle className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {loading && items.length === 0 ? (
                <div className="flex justify-center items-center min-h-[200px]">
                  <Loader className="w-12 h-12 animate-spin text-indigo-600" />
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => (
                    <div
                      key={item._id}
                      className="flex flex-col justify-between p-6 border border-indigo-100 rounded-xl hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-indigo-50"
                    >
                      <div>
                        <h3 className="font-semibold text-xl mb-2 text-indigo-900">{item.name}</h3>
                        <p className="text-sm text-indigo-600">
                          Expires: {new Date(item.expiry).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-indigo-600">{item.category}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        className="mt-4 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors duration-300 text-sm flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}