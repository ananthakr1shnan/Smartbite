const OpenAI = require('openai');

class ImageAnalysisService {
  constructor() {
    this.client = new OpenAI({
      apiKey: 'a0edc695-6753-400a-9513-cd5decb09793',
      baseURL: "https://api.sambanova.ai/v1",
    });
    this.cache = new Map();
  }

  async analyzeImage(base64Image) {
    try {
      if (!base64Image) {
        throw new Error('Image data is required');
      }

      const cacheKey = base64Image.slice(-32);
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }
      const response = await this.client.chat.completions.create({
        model: "Llama-3.2-90B-Vision-Instruct",
        messages: [{
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": "Carefully identify ALL food items in this image. Your ENTIRE response must be a strict, valid JSON array with NO additional text. Each item in the array must be an object with these EXACT fields: 'name' (string), 'category' (one of: 'fruit', 'vegetable', 'meat', 'dairy', 'grain', 'other'), 'estimated_expiry_days' (positive integer). NO markdown, NO explanations, ONLY valid JSON.",
            },
            {
              "type": "image_url",
              "image_url": {
                "url": base64Image
              },
            },
          ],
        }]
      });

      const responseContent = response.choices[0].message.content;
      console.log('Raw Response:', responseContent);

      let items;
      try {
        items = JSON.parse(responseContent);
        
        // Validate items
        if (!Array.isArray(items)) {
          throw new Error('Response is not an array');
        }

        // Additional validation of item structure
        items.forEach(item => {
          if (!item.name || !item.category || !item.estimated_expiry_days) {
            throw new Error('Invalid item structure');
          }
        });
      } catch (parseError) {
        console.error('Parsing Error:', parseError);
        throw new Error('Failed to parse image analysis response');
      }

      this.cache.set(cacheKey, items);
      return items;

    } catch (error) {
      console.error('Image Analysis Error:', error);
      throw new Error(`Image analysis failed: ${error.message}`);
    }
  }
}

const imageAnalysisService = new ImageAnalysisService();

module.exports = {
  ImageAnalysisService,
  analyzeImage: (base64Image) => imageAnalysisService.analyzeImage(base64Image)
};