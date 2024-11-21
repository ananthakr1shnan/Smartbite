import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addPantryItem } from '../api/PantryAPI';
import { Alert, AlertDescription } from './alert';
import { Loader } from 'lucide-react';

const DetectedItemsReview = ({ items, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addedItems, setAddedItems] = useState(new Set());
  const navigate = useNavigate();

  const handleExpiryChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    setItems(updatedItems);
  };

  const addAllToPantry = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const promises = items.map(item => {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + parseInt(item.expiryDays));
        
        return addPantryItem({
          name: item.name,
          category: item.category,
          expiry: expiryDate.toISOString().split('T')[0]
        });
      });
      
      await Promise.all(promises);
      navigate('/home');
    } catch (error) {
      setError('Failed to add items to pantry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addSingleItem = async (item, index) => {
    setLoading(true);
    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + parseInt(item.expiryDays));
      
      await addPantryItem({
        name: item.name,
        category: item.category,
        expiry: expiryDate.toISOString().split('T')[0]
      });
      
      setAddedItems(prev => new Set([...prev, index]));
    } catch (error) {
      setError(`Failed to add ${item.name}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Review Detected Items</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 mb-6">
            {items.map((item, index) => (
              <div
                key={index}
                className={`p-4 border rounded-lg ${
                  addedItems.has(index) ? 'bg-green-50' : 'bg-white'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleExpiryChange(index, 'name', e.target.value)}
                        className="font-medium text-lg border-none focus:ring-0 bg-transparent"
                      />
                      <select
                        value={item.category}
                        onChange={(e) => handleExpiryChange(index, 'category', e.target.value)}
                        className="border rounded p-1"
                      >
                        <option value="Fruit">Fruit</option>
                        <option value="Vegetable">Vegetable</option>
                        <option value="Meat">Meat</option>
                        <option value="Dairy">Dairy</option>
                        <option value="Grain">Grain</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={item.expiryDays}
                        onChange={(e) => handleExpiryChange(index, 'expiryDays', e.target.value)}
                        className="w-20 border rounded p-1"
                      />
                      <span className="text-sm text-gray-600">days until expiry</span>
                    </div>
                  </div>
                  <button
                    onClick={() => addSingleItem(item, index)}
                    disabled={loading || addedItems.has(index)}
                    className={`px-4 py-2 rounded ${
                      addedItems.has(index)
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    } transition-colors`}
                  >
                    {addedItems.has(index) ? 'Added' : 'Add to Pantry'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={addAllToPantry}
              disabled={loading || items.length === addedItems.size}
              className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 transition-colors"
            >
              {loading ? (
                <span className="flex items-center">
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  Adding...
                </span>
              ) : (
                'Add All to Pantry'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetectedItemsReview;