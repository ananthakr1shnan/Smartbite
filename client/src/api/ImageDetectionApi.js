const API_URL = import.meta.env.VITE_API_URL;
export const analyzeImage = async (base64Data) => {
  try {
    // Make the API request with JSON body instead of FormData
    const response = await fetch(`${API_URL}/api/analyze-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Data  // Send base64 string directly
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Server Error Response:', errorData || await response.text());
      
      // Provide more specific error messages based on status
      if (response.status === 400) {
        throw new Error('Invalid image format. Please try again with a different image.');
      } else if (response.status === 413) {
        throw new Error('Image size too large. Please try a smaller image.');
      } else {
        throw new Error(`Server error (${response.status}). Please try again.`);
      }
    }

    const data = await response.json();
    
    // Validate the response data
    if (!Array.isArray(data)) {
      console.error('Unexpected response format:', data);
      throw new Error('Invalid response from server. Please try again.');
    }

    return data;
  } catch (error) {
    console.error('Error in analyzeImage:', error);
    // Preserve the original error message if it's one we created
    if (error.message.includes('Invalid image') || 
        error.message.includes('Image size') ||
        error.message.includes('Server error')) {
      throw error;
    }
    throw new Error('Failed to analyze image. Please try again.');
  }
};