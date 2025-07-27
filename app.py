from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_session import Session
import os
from dotenv import load_dotenv
import logging
from datetime import datetime
import json

# Import our modules
from database import init_db, get_db
from routes import api_bp
from config import Config

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_app():
    app = Flask(__name__, static_folder='static')
    
    # Configure the app
    app.config.from_object(Config)
    
    # Initialize extensions
    CORS(app)
    Session(app)
    
    # Initialize database
    with app.app_context():
        init_db()
    
    # Register blueprints
    app.register_blueprint(api_bp, url_prefix='/api')
    
    # Serve static files
    @app.route('/')
    def index():
        return send_from_directory('static', 'index.html')
    
    @app.route('/<path:path>')
    def static_files(path):
        return send_from_directory('static', path)
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
    
    # Request logging middleware
    @app.before_request
    def log_request():
        if request.path.startswith('/api'):
            logger.info(f"{request.method} {request.path}")
    
    @app.after_request
    def log_response(response):
        if request.path.startswith('/api'):
            logger.info(f"Response: {response.status_code}")
        return response
    
    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True) 