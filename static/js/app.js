// Global variables
let currentIngredients = [];
let selectedFile = null;

// DOM elements
const navButtons = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');
const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const previewImage = document.getElementById('previewImage');
const uploadPreview = document.getElementById('uploadPreview');
const uploadResult = document.getElementById('uploadResult');
const ingredientInput = document.getElementById('ingredientInput');
const ingredientsList = document.getElementById('ingredientsList');
const generateBtn = document.getElementById('generateBtn');
const generatedRecipe = document.getElementById('generatedRecipe');
const loadingOverlay = document.getElementById('loadingOverlay');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeUploadArea();
    initializeIngredientInput();
    loadRecipes();
});

// Navigation functionality
function initializeNavigation() {
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });
}

function switchTab(tabName) {
    // Update navigation buttons
    navButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab content
    tabContents.forEach(content => content.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
}

// Upload functionality
function initializeUploadArea() {
    uploadArea.addEventListener('click', () => {
        imageInput.click();
    });
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#667eea';
        uploadArea.style.background = '#f0f2ff';
    });
    
    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#ddd';
        uploadArea.style.background = '#f8f9fa';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#ddd';
        uploadArea.style.background = '#f8f9fa';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });
    
    imageInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });
}

function handleFileSelect(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
    }
    
    selectedFile = file;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        uploadPreview.style.display = 'block';
        uploadResult.style.display = 'none';
    };
    reader.readAsDataURL(file);
}

async function analyzeImage() {
    if (!selectedFile) {
        alert('Please select an image first.');
        return;
    }
    
    showLoading();
    
    try {
        const formData = new FormData();
        formData.append('image', selectedFile);
        
        const response = await fetch('/api/upload-image', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            displayUploadResult(result.recipe_data);
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error('Error analyzing image:', error);
        alert('Error analyzing image. Please try again.');
    } finally {
        hideLoading();
    }
}

function displayUploadResult(recipeData) {
    uploadResult.innerHTML = `
        <h3>Recipe Analysis Result</h3>
        <div class="recipe-detail">
            <h4>Title</h4>
            <p>${recipeData.title || 'Untitled Recipe'}</p>
            
            <h4>Description</h4>
            <p>${recipeData.description || 'No description available'}</p>
            
            <h4>Ingredients</h4>
            <ul>
                ${(recipeData.ingredients || []).map(ingredient => `<li>${ingredient}</li>`).join('')}
            </ul>
            
            <h4>Instructions</h4>
            <div class="instructions">${recipeData.instructions || 'No instructions available'}</div>
            
            <div style="margin-top: 20px;">
                <button class="btn btn-primary" onclick="saveAnalyzedRecipe()">
                    <i class="fas fa-save"></i> Save Recipe
                </button>
            </div>
        </div>
    `;
    
    uploadResult.style.display = 'block';
}

// Ingredient input functionality
function initializeIngredientInput() {
    ingredientInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addIngredient();
        }
    });
}

function addIngredient() {
    const ingredient = ingredientInput.value.trim();
    if (ingredient && !currentIngredients.includes(ingredient)) {
        currentIngredients.push(ingredient);
        updateIngredientsList();
        ingredientInput.value = '';
        updateGenerateButton();
    }
}

function removeIngredient(ingredient) {
    currentIngredients = currentIngredients.filter(item => item !== ingredient);
    updateIngredientsList();
    updateGenerateButton();
}

function updateIngredientsList() {
    ingredientsList.innerHTML = currentIngredients.map(ingredient => `
        <div class="ingredient-tag">
            ${ingredient}
            <span class="remove" onclick="removeIngredient('${ingredient}')">&times;</span>
        </div>
    `).join('');
}

function updateGenerateButton() {
    generateBtn.disabled = currentIngredients.length === 0;
}

async function generateRecipe() {
    if (currentIngredients.length === 0) {
        alert('Please add at least one ingredient.');
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch('/api/generate-recipe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ingredients: currentIngredients
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            displayGeneratedRecipe(result.recipe_data);
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error('Error generating recipe:', error);
        alert('Error generating recipe. Please try again.');
    } finally {
        hideLoading();
    }
}

function displayGeneratedRecipe(recipeData) {
    generatedRecipe.innerHTML = `
        <h3>Generated Recipe</h3>
        <div class="recipe-detail">
            <h4>Title</h4>
            <p>${recipeData.title || 'Generated Recipe'}</p>
            
            <h4>Description</h4>
            <p>${recipeData.description || 'No description available'}</p>
            
            <h4>Ingredients</h4>
            <ul>
                ${(recipeData.ingredients || []).map(ingredient => `<li>${ingredient}</li>`).join('')}
            </ul>
            
            <h4>Instructions</h4>
            <div class="instructions">${recipeData.instructions || 'No instructions available'}</div>
            
            <div style="margin-top: 20px;">
                <button class="btn btn-primary" onclick="saveGeneratedRecipe()">
                    <i class="fas fa-save"></i> Save Recipe
                </button>
            </div>
        </div>
    `;
    
    generatedRecipe.style.display = 'block';
}

// Recipe management
async function loadRecipes() {
    try {
        const response = await fetch('/api/recipes');
        const data = await response.json();
        
        if (response.ok) {
            displayRecipes(data.recipes);
        } else {
            console.error('Error loading recipes:', data.error);
        }
    } catch (error) {
        console.error('Error loading recipes:', error);
    }
}

function displayRecipes(recipes) {
    const recipesGrid = document.getElementById('recipes-grid');
    
    if (recipes.length === 0) {
        recipesGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">
                <i class="fas fa-book-open" style="font-size: 3rem; margin-bottom: 20px; color: #ddd;"></i>
                <h3>No recipes yet</h3>
                <p>Start by adding your first recipe or uploading a photo!</p>
            </div>
        `;
        return;
    }
    
    recipesGrid.innerHTML = recipes.map(recipe => `
        <div class="recipe-card" onclick="showRecipeDetail(${recipe.id})">
            <h3>${recipe.title}</h3>
            <p>${recipe.description || 'No description'}</p>
            <div class="recipe-meta">
                ${recipe.cooking_time ? `<span><i class="fas fa-clock"></i> ${recipe.cooking_time} min</span>` : ''}
                ${recipe.servings ? `<span><i class="fas fa-users"></i> ${recipe.servings} servings</span>` : ''}
                ${recipe.difficulty ? `<span><i class="fas fa-star"></i> ${recipe.difficulty}</span>` : ''}
            </div>
        </div>
    `).join('');
}

async function showRecipeDetail(recipeId) {
    try {
        const response = await fetch(`/api/recipes/${recipeId}`);
        const recipe = await response.json();
        
        if (response.ok) {
            document.getElementById('detailTitle').textContent = recipe.title;
            document.getElementById('recipeDetailContent').innerHTML = `
                <div class="recipe-detail">
                    <h4>Description</h4>
                    <p>${recipe.description || 'No description available'}</p>
                    
                    <h4>Ingredients</h4>
                    <ul>
                        ${(recipe.ingredients || []).map(ingredient => `<li>${ingredient}</li>`).join('')}
                    </ul>
                    
                    <h4>Instructions</h4>
                    <div class="instructions">${recipe.instructions}</div>
                    
                    <div class="recipe-meta" style="margin-top: 20px;">
                        ${recipe.cooking_time ? `<span><i class="fas fa-clock"></i> ${recipe.cooking_time} minutes</span>` : ''}
                        ${recipe.servings ? `<span><i class="fas fa-users"></i> ${recipe.servings} servings</span>` : ''}
                        ${recipe.difficulty ? `<span><i class="fas fa-star"></i> ${recipe.difficulty}</span>` : ''}
                        ${recipe.cuisine ? `<span><i class="fas fa-globe"></i> ${recipe.cuisine}</span>` : ''}
                    </div>
                </div>
            `;
            
            document.getElementById('recipeDetailModal').style.display = 'flex';
        } else {
            alert('Error loading recipe details.');
        }
    } catch (error) {
        console.error('Error loading recipe details:', error);
        alert('Error loading recipe details.');
    }
}

// Modal functions
function showAddRecipeModal() {
    document.getElementById('recipeModal').style.display = 'flex';
}

function closeRecipeModal() {
    document.getElementById('recipeModal').style.display = 'none';
    document.getElementById('recipeForm').reset();
}

function closeRecipeDetailModal() {
    document.getElementById('recipeDetailModal').style.display = 'none';
}

// Form submission
document.getElementById('recipeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        title: document.getElementById('recipeTitle').value,
        description: document.getElementById('recipeDescription').value,
        ingredients: document.getElementById('recipeIngredients').value.split('\n').filter(item => item.trim()),
        instructions: document.getElementById('recipeInstructions').value,
        cooking_time: parseInt(document.getElementById('recipeCookingTime').value) || null,
        servings: parseInt(document.getElementById('recipeServings').value) || null,
        difficulty: document.getElementById('recipeDifficulty').value,
        cuisine: document.getElementById('recipeCuisine').value
    };
    
    try {
        const response = await fetch('/api/recipes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            closeRecipeModal();
            loadRecipes();
            alert('Recipe saved successfully!');
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error('Error saving recipe:', error);
        alert('Error saving recipe. Please try again.');
    }
});

// Save functions for analyzed/generated recipes
async function saveAnalyzedRecipe() {
    const recipeData = JSON.parse(uploadResult.querySelector('.recipe-detail').dataset.recipe || '{}');
    await saveRecipe(recipeData);
}

async function saveGeneratedRecipe() {
    const recipeData = JSON.parse(generatedRecipe.querySelector('.recipe-detail').dataset.recipe || '{}');
    await saveRecipe(recipeData);
}

async function saveRecipe(recipeData) {
    try {
        const response = await fetch('/api/recipes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(recipeData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            loadRecipes();
            alert('Recipe saved successfully!');
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error('Error saving recipe:', error);
        alert('Error saving recipe. Please try again.');
    }
}

// Utility functions
function showLoading() {
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    loadingOverlay.style.display = 'none';
}

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    const recipeModal = document.getElementById('recipeModal');
    const recipeDetailModal = document.getElementById('recipeDetailModal');
    
    if (e.target === recipeModal) {
        closeRecipeModal();
    }
    
    if (e.target === recipeDetailModal) {
        closeRecipeDetailModal();
    }
}); 

// --- AI Chef Tab Functionality ---
function setAIChefPrompt(prompt) {
    document.getElementById('aiChefInput').value = prompt;
    switchTab('ai-chef');
}

async function askAIChef() {
    const input = document.getElementById('aiChefInput').value.trim();
    const responseDiv = document.getElementById('aiChefResponse');
    if (!input) {
        responseDiv.innerHTML = '<span style="color:#888">Please enter a question or prompt for the AI Chef.</span>';
        return;
    }
    showLoading();
    responseDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Thinking...';
    try {
        // Call backend endpoint (to be implemented)
        const response = await fetch('/api/ai-chef', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: input })
        });
        const result = await response.json();
        if (response.ok && result && result.markdown) {
            responseDiv.innerHTML = renderMarkdown(result.markdown);
        } else {
            responseDiv.innerHTML = '<span style="color:#c00">' + (result.error || 'AI Chef could not answer. Please try again.') + '</span>';
        }
    } catch (err) {
        responseDiv.innerHTML = '<span style="color:#c00">Error contacting AI Chef. Please try again.</span>';
    } finally {
        hideLoading();
    }
}

// Simple markdown-to-HTML renderer (for basic formatting)
function renderMarkdown(md) {
    // Headings
    md = md.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    md = md.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    md = md.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    // Bold/italic
    md = md.replace(/\*\*(.*?)\*\*/gim, '<b>$1</b>');
    md = md.replace(/\*(.*?)\*/gim, '<i>$1</i>');
    // Lists
    md = md.replace(/^\s*\* (.*$)/gim, '<ul><li>$1</li></ul>');
    md = md.replace(/^\s*\d+\. (.*$)/gim, '<ol><li>$1</li></ol>');
    // Inline code
    md = md.replace(/`([^`]+)`/gim, '<code>$1</code>');
    // Line breaks
    md = md.replace(/\n/g, '<br>');
    // Remove multiple ul/ol
    md = md.replace(/(<\/ul>)(<ul>)+/gim, '');
    md = md.replace(/(<\/ol>)(<ol>)+/gim, '');
    return md;
} 