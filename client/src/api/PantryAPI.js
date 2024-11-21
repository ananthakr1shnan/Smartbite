const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export const fetchPantryItems = async () => {
    const userEmail = localStorage.getItem('userEmail');
    const response = await fetch(`${API_URL}/api/pantry-items?userEmail=${userEmail}`);
    const data = await response.json();
    return data.items;
  };
  
  export const addPantryItem = async (item) => {
    const userEmail = localStorage.getItem('userEmail');
    const response = await fetch(`${API_URL}/api/pantry-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...item, userEmail }),
    });
    const data = await response.json();
    return data.newItem;
};
export const deletePantryItem = async (itemId, userEmail) => {
  const response = await fetch(`${API_URL}/api/pantry/${itemId}?userEmail=${encodeURIComponent(userEmail)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete item.');
  }

  return await response.json();
};

  export const fetchExpiringItems = async () => {
    const userEmail = localStorage.getItem('userEmail');
    const response = await fetch(`${API_URL}/api/expiring-items?userEmail=${userEmail}`);
    const data = await response.json();
    return data.expiringItems;
  };
  
  export const generateRecipe = async (selectedItems, buttonState) => {
    const response = await fetch(`${API_URL}/api/recipes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ selectedItems, buttonState }),
    });
    const data = await response.json();
    return data.recipe;
  };
  