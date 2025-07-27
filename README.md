# Ez Chef - AI-Powered Recipe Manager

A modern web application that helps you manage recipes with AI-powered features like image analysis and recipe generation.

## Features

- **Recipe Management**: Add, view, edit, and delete recipes
- **AI Image Analysis**: Upload photos of dishes and get recipe details automatically
- **Recipe Generation**: Generate recipes from available ingredients using OpenAI
- **Modern UI**: Beautiful, responsive interface with drag-and-drop functionality
- **Local Storage**: SQLite database for storing recipes locally

## Tech Stack

- **Backend**: Python Flask
- **Database**: SQLite with SQLAlchemy ORM
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **AI Integration**: OpenAI GPT-4 Vision API
- **Styling**: Custom CSS with Font Awesome icons

## Prerequisites

- Python 3.8 or higher
- OpenAI API key (for AI features)

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ez-chef
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   SECRET_KEY=your_secret_key_here
   ```
   
   Or set environment variables directly:
   ```bash
   # Windows
   set OPENAI_API_KEY=your_openai_api_key_here
   set SECRET_KEY=your_secret_key_here
   
   # Linux/Mac
   export OPENAI_API_KEY=your_openai_api_key_here
   export SECRET_KEY=your_secret_key_here
   ```

4. **Run the application**
   ```bash
   python app.py
   ```

5. **Access the application**
   Open your browser and go to `http://localhost:5000`

## Usage

### Adding Recipes Manually
1. Click "Add Recipe" button
2. Fill in the recipe details (title, ingredients, instructions, etc.)
3. Click "Save Recipe"

### Analyzing Recipe Photos
1. Go to the "Upload Photo" tab
2. Drag and drop or click to upload an image
3. Click "Analyze Image" to get recipe details from the photo
4. Review and save the generated recipe

### Generating Recipes from Ingredients
1. Go to the "Generate Recipe" tab
2. Add ingredients you have available
3. Click "Generate Recipe" to create a recipe using those ingredients
4. Review and save the generated recipe

## API Endpoints

- `GET /api/recipes` - Get all recipes
- `POST /api/recipes` - Create a new recipe
- `GET /api/recipes/<id>` - Get a specific recipe
- `PUT /api/recipes/<id>` - Update a recipe
- `DELETE /api/recipes/<id>` - Delete a recipe
- `POST /api/upload-image` - Upload and analyze recipe image
- `POST /api/generate-recipe` - Generate recipe from ingredients
- `POST /api/ai-chef` - AI cooking assistant
- `GET /api/health` - Health check endpoint

## Project Structure

```
ez-chef/
├── app.py                 # Main Flask application
├── config.py             # Configuration settings
├── database.py           # Database models and setup
├── routes.py             # API routes
├── openai_client.py      # OpenAI integration
├── requirements.txt      # Python dependencies
├── static/              # Static files (CSS, JS, uploads)
│   ├── css/
│   ├── js/
│   └── uploads/
├── env.example          # Environment variables template
└── README.md           # This file
```

## Configuration

The application uses the following configuration options (in `config.py`):

- `DATABASE_URL`: Database connection string (default: SQLite)
- `OPENAI_API_KEY`: OpenAI API key for AI features
- `UPLOAD_FOLDER`: Directory for uploaded images
- `MAX_CONTENT_LENGTH`: Maximum file upload size (16MB)
- `ALLOWED_EXTENSIONS`: Allowed image file types

## Development

### Running in Development Mode
```bash
python app.py
```

The application will run on `http://localhost:5000` with debug mode enabled.

### Database
The application uses SQLite by default. The database file (`ez_cooking.db`) will be created automatically when you first run the application.

### File Uploads
Uploaded images are stored in the `static/uploads/` directory and served statically.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 