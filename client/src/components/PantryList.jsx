import React, { useState, useEffect } from 'react';
import { fetchPantryItems, addPantryItem } from '../api/PantryAPI';
import { Alert, AlertDescription } from './alert';
import { Loader } from 'lucide-react';

const PantryList = ({ onItemAdded }) => {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    expiryDays: 7, 
    expiryUnit: 'days',
    category: 'Other'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPantryItems()
      .then(setItems)
      .catch(() => setError('Failed to load pantry items'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const isExpired = (expiryDate) => {
    const today = new Date();
    const expDate = new Date(expiryDate);
    return expDate < today;
  };
  const handleDeleteItem = async (itemId) => {
    setLoading(true);
    try {
      await fetch(`http://localhost:3001/api/pantry-items/${itemId}`, {
        method: 'DELETE',
      });
      setItems(items.filter((item) => item._id !== itemId));
    } catch (error) {
      setError('Failed to delete item.');
    } finally {
      setLoading(false);
    }
  };
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Item name is required.');
      return;
    }
  
    let expiryDate;
    switch (formData.expiryUnit) {
      case 'days':
        expiryDate = new Date(Date.now() + formData.expiryDays * 24 * 60 * 60 * 1000);
        break;
      case 'weeks':
        expiryDate = new Date(Date.now() + formData.expiryDays * 7 * 24 * 60 * 60 * 1000);
        break;
      case 'months':
        expiryDate = new Date(new Date().getFullYear(), new Date().getMonth() + formData.expiryDays, 0);
        break;
      default:
        expiryDate = new Date(Date.now() + formData.expiryDays * 24 * 60 * 60 * 1000);
    }
  
    const newItem = { 
      name: formData.name,
      expiry: expiryDate.toISOString().split('T')[0],
      category: formData.category,
      isExpired: isExpired(expiryDate.toISOString().split('T')[0])
    };
  
    setLoading(true);
    try {
      const savedItem = await addPantryItem(newItem);
      setItems([...items, savedItem]);
      onItemAdded(savedItem);
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
  if (loading && items.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Your Pantry</h2>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleAddItem} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            name="name"
            placeholder="Item Name"
            value={formData.name}
            onChange={handleChange}
            className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <input
  type="number"
  name="expiryDays"
  min="1"
  max="365"
  value={formData.expiryDays}
  onChange={handleChange}
  className="p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  required
/>
<select
  name="expiryUnit"
  value={formData.expiryUnit}
  onChange={handleChange}
  className="p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
>
  <option value="days">Days</option>
  <option value="weeks">Weeks</option>
  <option value="months">Months</option>
</select>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Fruit">Fruit</option>
            <option value="Vegetable">Vegetable</option>
            <option value="Meat">Meat</option>
            <option value="Dairy">Dairy</option>
            <option value="Grain">Grain</option>
            <option value="Other">Other</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
          >
            {loading ? (
              <span className="flex items-center">
                <Loader className="w-4 h-4 animate-spin mr-2" />
                Adding...
              </span>
            ) : (
              'Add Item'
            )}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {items.map((item) => (
          <div
          key={item._id}
          className="flex justify-between items-center p-4 border rounded hover:bg-gray-50 transition-colors"
        >
          <div>
            <h3 className="font-medium">{item.name}</h3>
            <p className="text-sm text-gray-600">
              Expires: {new Date(item.expiry).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600">{item.category}</p>
          </div>
          <button
            onClick={() => handleDeleteItem(item._id)}
            className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
        ))}
      </div>
    </div>
  );
};

export default PantryList;