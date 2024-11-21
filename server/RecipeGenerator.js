const axios = require('axios');
require('dotenv').config(); // Load environment variables

class RecipeGenerator {
  constructor() {
    this.apiKey = process.env.SAMBANOVA_API_KEY;
    this.validateConfig();
    this.setupPrompts();
    this.cache = new Map();
  }

  validateConfig() {
    if (!this.apiKey) {
      throw new Error('SAMBANOVA_API_KEY environment variable not set');
    }
  }

  setupPrompts() {
    this.promptStyles = [
      {
        type: 'standard',
        template: "Create a unique recipe using these ingredients: {ingredients}. Provide a catchy title, full ingredients list, and detailed instructions. Rate its tastiness from 1-10.",
        temperature: 0.7,
      },
      {
        type: 'fusion',
        template: "Invent a fusion dish combining cuisines, using these ingredients: {ingredients}. Include a creative name, all ingredients needed, step-by-step guide, and taste rating (1-10).",
        temperature: 0.8,
      },
      {
        type: 'gourmet',
        template: "Design a gourmet meal featuring these ingredients: {ingredients}. Give it an elegant name, list all components, provide a chef's guide to preparation, and rate its flavor profile (1-10).",
        temperature: 0.6,
      },
      {
        type: 'quick',
        template: "Craft a quick and easy recipe with these items: {ingredients}. Choose a simple name, list ingredients with amounts, write clear instructions, and score its taste appeal (1-10).",
        temperature: 0.5,
      },
    ];
  }

  getCacheKey(ingredients, buttonState) {
    return `${ingredients.sort().join(',')}-${buttonState}`;
  }

  async generateRecipe(ingredients, buttonState) {
    try {
      const cacheKey = this.getCacheKey(ingredients, buttonState);
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const promptStyle = this.selectPromptStyle(buttonState);
      const prompt = this.formatPrompt(promptStyle, ingredients);
      const recipe = await this.callSambaNovaAPI(prompt, promptStyle.temperature);
      const parsedRecipe = this.parseRecipe(recipe);

      this.cache.set(cacheKey, parsedRecipe);
      return parsedRecipe;
    } catch (error) {
      console.error('Recipe generation error:', error.message);
      throw new Error('Failed to generate recipe');
    }
  }

  selectPromptStyle(buttonState) {
    if (typeof buttonState !== 'number' || buttonState < 0) {
      throw new Error('Invalid buttonState value');
    }

    const index = Math.min(
      Math.floor(buttonState / 2.5),
      this.promptStyles.length - 1
    );
    return this.promptStyles[index];
  }

  formatPrompt(promptStyle, ingredients) {
    return promptStyle.template.replace('{ingredients}', ingredients.join(', '));
  }

  async callSambaNovaAPI(prompt, temperature) {
    try {
      const response = await axios.post(
        'https://api.sambanova.ai/v1/chat/completions',
        {
          model: 'Meta-Llama-3.1-70B-Instruct',
          messages: [{ role: 'user', content: prompt }],
          temperature,
          top_p: 0.1,
          max_tokens: 1000,
          presence_penalty: 0.6,
          frequency_penalty: 0.3,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );
      console.log(response.data?.choices?.[0]?.message?.content);
      return response.data?.choices?.[0]?.message?.content || 'Recipe generation failed.';
    } catch (error) {
      const errorMessage = error.response?.data || error.message;
      console.error('SambaNova API error:', errorMessage);
      throw new Error('Failed to call SambaNova API: ' + errorMessage);
    }
  }

  parseRecipe(recipeText) {
    try {
      // Remove markdown formatting but preserve line breaks
      const cleanText = recipeText.replace(/\*\*/g, '').trim();
      
      // Extract title (now handles "Recipe:" prefix)
      const titlePattern = /^(?:Recipe:\s*)?([^\n]+)/;
      const titleMatch = cleanText.match(titlePattern);
      const title = titleMatch ? titleMatch[1].trim() : 'Untitled Recipe';

      // Extract rating (now handles decimal ratings)
      const ratingPattern = /(?:Tastiness Rating:|Rating:|Taste Rating:)\s*(\d+(?:\.\d+)?)\s*\/\s*10/i;
      const ratingMatch = cleanText.match(ratingPattern);
      const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 5;

      // Split content into sections
      const sections = {
        ingredients: '',
        instructions: '',
        tips: ''
      };

      // Extract sections using indexOf to handle exact text matches
      const ingredientsStart = cleanText.indexOf('Ingredients:');
      const instructionsStart = cleanText.indexOf('Instructions:');
      const tipsStart = cleanText.indexOf('Tips and Variations:');
      const textEnd = cleanText.length;

      if (ingredientsStart !== -1) {
        sections.ingredients = cleanText.slice(
          ingredientsStart + 'Ingredients:'.length,
          instructionsStart !== -1 ? instructionsStart : textEnd
        ).trim();
      }

      if (instructionsStart !== -1) {
        sections.instructions = cleanText.slice(
          instructionsStart + 'Instructions:'.length,
          tipsStart !== -1 ? tipsStart : textEnd
        ).trim();
      }

      if (tipsStart !== -1) {
        sections.tips = cleanText.slice(
          tipsStart + 'Tips and Variations:'.length,
          textEnd
        ).trim();
      }

      // Parse individual sections
      const ingredients = this.parseIngredients(sections.ingredients);
      const instructions = this.parseInstructions(sections.instructions);
      const tips = this.parseTips(sections.tips);

      return {
        title,
        rating,
        servings: '4-6 servings', // Default value since servings aren't specified
        ingredients,
        instructions,
        tips,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Recipe parsing error:', error);
      return {
        title: 'Recipe Parser Error',
        rating: 5,
        servings: '4-6 servings',
        ingredients: [],
        instructions: ['Error parsing recipe. Please try again.'],
        tips: [],
        generatedAt: new Date().toISOString(),
        error: error.message
      };
    }
  }

  parseIngredients(ingredientsText) {
    if (!ingredientsText) return [];
    
    return ingredientsText
      .split('\n')
      .map(line => line.trim())
      .map(line => line.replace(/^[*•-]\s*/, '')) // Remove bullet points
      .filter(line => line.length > 0);
  }

  parseInstructions(instructionsText) {
    if (!instructionsText) return [];

    return instructionsText
      .split('\n')
      .map(line => line.trim())
      .map(line => {
        // Remove numbering and any text within brackets
        return line
          .replace(/^\d+\.\s*/, '')
          .replace(/^[*•-]\s*/, '')
          .replace(/^[^:]+:\s*/, ''); // Remove prefixes like "Roast the beetroot: "
      })
      .filter(line => line.length > 0);
  }

  parseTips(tipsText) {
    if (!tipsText) return [];

    return tipsText
      .split('\n')
      .map(line => line.trim())
      .map(line => line.replace(/^[*•-]\s*/, '')) // Remove bullet points
      .filter(line => line.length > 0)
      .filter(line => !line.includes('This recipe combines')); // Remove the closing paragraph
  }
}


// Singleton instance
const recipeGenerator = new RecipeGenerator();

module.exports = {
  RecipeGenerator,
  generateRecipe: (ingredients, buttonState) =>
    recipeGenerator.generateRecipe(ingredients, buttonState),
};
