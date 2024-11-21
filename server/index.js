const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const UserModel = require("./model/user");
const { RecipeGenerator, generateRecipe } = require('./RecipeGenerator');
const { analyzeImage } = require('./ImageAnalysisService');
const Food = require('./model/food');
const bodyParser = require('body-parser');
const app = express();
app.use(express.json());
app.use(cors());
require('dotenv').config();
require('./scheduler');  
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB Atlas"))
.catch((err) => console.error("MongoDB connection error:", err));

app.post("/login", (req, res) => {
  const {email, password} = req.body;
  UserModel.findOne({email : email})
  .then(user => {
    if(user) {
      if(user.password === password){
        res.json("Success")
      }else{
        res.json("The password is incorrect")
      }
    }else{
      res.json("No record existed")
    }
  })
  
});

app.post("/register", (req, res) => {
  UserModel.create(req.body)
  .then(employees => res.json(employees))
  .catch(err => res.json(err))
});

app.get('/api/pantry-items', async (req, res) => {
  try {
    const { userEmail } = req.query;
    const items = await Food.find({ userEmail });
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/pantry-items', async (req, res) => {
  try {
    const newItem = await Food.create(req.body);
    res.json({ newItem });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/pantry-items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userEmail } = req.query;
    const deletedItem = await Food.deleteOne({ _id: id, userEmail });
    if (deletedItem.deletedCount === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/expiring-items', async (req, res) => {
  try {
    const { userEmail } = req.query;
    // Find all food items expiring within the next 7 days for the specific user
    const expiringItems = await Food.find({
      userEmail,  // Add user filter
      expiry: { 
        $gte: new Date(), 
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
      }
    });
    res.json({ expiringItems });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/recipes', (req, res) => {
  const { selectedItems, buttonState } = req.body;
  generateRecipe(selectedItems, buttonState)
    .then(recipe => res.json({ recipe }))
    .catch(error => res.status(500).json({ error: error.message }));
});

app.use(bodyParser.json({ limit: "50mb" }))
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }))

app.post('/api/analyze-image', async (req, res) => {
  try {
    const { image } = req.body;  // The image will be base64-encoded string

    if (!image) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Call the image analysis service with the base64 image string
    const detectedItems = await analyzeImage(image);

    // Return the detected items as a JSON response
    res.json(detectedItems);
    
  } catch (error) {
    console.error('Image analysis error:', error);
    res.status(500).json({ error: `Failed to analyze image: ${error.message}` });
  }
});


app.listen(3001, () => {
  console.log("server is running");
});