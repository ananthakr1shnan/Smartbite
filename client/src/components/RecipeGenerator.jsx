import React, { useState } from 'react';
import { generateRecipe } from '../api/PantryAPI';
import { Loader, X } from 'lucide-react';
import { Alert, AlertDescription } from './alert';

const RecipeGenerator = ({ selectedItems = [], items = [], onSelectItem }) => {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [buttonState, setButtonState] = useState(0);
  const [error, setError] = useState(null);
  const [showExtraItems, setShowExtraItems] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleGenerateRecipe = async () => {
    if (selectedItems.length === 0) {
      setError("Please select at least one ingredient to generate a recipe.");
      return;
    }
    setIsExpanded(true);
    setLoading(true);
    setError(null);
    try {
      const response = await generateRecipe(selectedItems.map(item => item.name), buttonState);
      const recipeData = typeof response === 'string' ? JSON.parse(response) : response;
      setRecipe(recipeData);
    } catch (error) {
      console.error("Error generating recipe:", error);
      setError("Failed to generate recipe. Please try again.");
    } finally {
      setLoading(false);
      setButtonState(prev => (prev + 1) % 10);
    }
  };

  const renderRecipeContent = () => {
    if (!recipe) return null;

    // Parse the recipe if it's a string
    const recipeData = typeof recipe === 'string' ? JSON.parse(recipe) : recipe;

    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Title and Meta Information */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-2xl font-bold text-indigo-900 mb-2">
            {recipeData.title}
          </h3>
          <div className="flex gap-4">
            {recipeData.rating && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                Rating: {recipeData.rating}/10
              </span>
            )}
            {recipeData.servings && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                Serves: {recipeData.servings}
              </span>
            )}
          </div>
        </div>

        {/* Ingredients Section */}
        {recipeData.ingredients?.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-900">Ingredients</h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {recipeData.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-center space-x-2 text-gray-700">
                  <span className="text-indigo-500">•</span>
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Instructions Section */}
        {recipeData.instructions?.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-900">Instructions</h4>
            <ol className="space-y-4">
              {recipeData.instructions.map((instruction, index) => (
                <li key={index} className="flex space-x-4">
                  <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 flex-1">{instruction}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Tips Section */}
        {recipeData.tips?.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Tips & Variations</h4>
            <ul className="space-y-2">
              {recipeData.tips.map((tip, index) => (
                <li key={index} className="flex items-start space-x-2 text-gray-700">
                  <span className="text-indigo-500">💡</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderItemsList = () => {
    const itemsToShow = showExtraItems ? (items || []) : (selectedItems || []);
    
    return itemsToShow.length > 0 ? (
      <div className="w-full p-4 bg-indigo-50 rounded-lg">
        <h4 className="text-sm font-medium text-indigo-900 mb-2">
          {showExtraItems ? 'All Available Items:' : 'Selected Expiring Items:'}
        </h4>
        <div className="flex flex-wrap gap-2">
          {itemsToShow.map(item => (
            <span 
              key={item._id} 
              onClick={() => onSelectItem && onSelectItem(item)}
              className={`px-3 py-1 bg-white rounded-full text-sm font-medium border cursor-pointer transition-colors
                ${selectedItems?.includes(item) 
                  ? 'border-indigo-500 text-indigo-600 bg-indigo-50' 
                  : 'border-gray-200 text-gray-600 hover:border-indigo-300'}`}
            >
              {item.name}
            </span>
          ))}
        </div>
      </div>
    ) : (
      <p className="text-center text-gray-500">
        {showExtraItems ? 'No items available' : 'Select ingredients from the list to generate a recipe'}
      </p>
    );
  };

  if (isExpanded) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
          <div className="flex-shrink-0 bg-white p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-indigo-900">Recipe Generator</h2>
            <button
              onClick={() => {
                setIsExpanded(false);
                setRecipe(null);
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-6">
              {/* Selected Items Display */}
              <div className="p-4 bg-indigo-50 rounded-lg">
                <h4 className="text-sm font-medium text-indigo-900 mb-2">
                  Selected Ingredients:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedItems.map(item => (
                    <span key={item._id} className="px-3 py-1 bg-white rounded-full text-sm font-medium text-indigo-600 border border-indigo-200">
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Loading or Recipe Content */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader className="w-12 h-12 animate-spin text-indigo-600" />
                  <p className="mt-4 text-gray-600">Creating your perfect recipe...</p>
                </div>
              ) : (
                renderRecipeContent()
              )}

              {/* Regenerate Button */}
              {recipe && !loading && (
                <button
                  onClick={handleGenerateRecipe}
                  className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-300 mt-6"
                >
                  Generate Another Recipe
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular non-expanded view
  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col items-center space-y-4">
        {/* Extra Items Button */}
        <div className="w-full flex justify-end mb-4">
          <button
            onClick={() => setShowExtraItems(!showExtraItems)}
            className={`text-sm px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 
              ${showExtraItems 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
              }`}
          >
            {showExtraItems ? '✕ Hide Extra Items' : '+ Add Extra Items'}
          </button>
        </div>

        {/* Items Display */}
        {renderItemsList()}

        {/* Generate Recipe Button */}
        <button
          onClick={handleGenerateRecipe}
          disabled={loading || selectedItems.length === 0}
          className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors duration-300"
        >
          Generate Recipe
        </button>
      </div>
    </div>
  );
};

export default RecipeGenerator;