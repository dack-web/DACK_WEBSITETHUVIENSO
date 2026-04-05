try {
    const authorRoutes = require('./routes/authorRoutes');
    console.log('✅ authorRoutes.js loaded successfully!');
} catch (error) {
    console.error('❌ Failed to load authorRoutes.js:');
    console.error(error);
}
