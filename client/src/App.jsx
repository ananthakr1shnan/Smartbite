import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Signup from './Signup';
import Login from './Login';
import RecipeGenerator from './components/RecipeGenerator';
import ExpiringItems from './components/ExpiringItems';
import PantryPage from './components/PantryPage';
import './index.css';

function App() {
  const [selectedItems, setSelectedItems] = useState([]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/register" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/home" element={<PantryPage />} />
            <Route path="/recipe-generator" element={
              <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-extrabold text-center mb-8 text-indigo-900">
                  Smart Recipe Generator
                </h1>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <h2 className="text-2xl font-bold text-indigo-900 mb-4">
                        Select Ingredients
                      </h2>
                      <ExpiringItems
                        onSelectItem={(items) => setSelectedItems(items)}
                        selectedItems={selectedItems}
                      />
                    </div>
                  </div>
                  
                  <div className="lg:sticky lg:top-8 space-y-6">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <h2 className="text-2xl font-bold text-indigo-900 mb-4">
                        Generated Recipe
                      </h2>
                      <RecipeGenerator selectedItems={selectedItems} />
                    </div>
                  </div>
                </div>
              </div>
            } />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;