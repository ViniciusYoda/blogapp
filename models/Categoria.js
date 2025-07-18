import mongoose from 'mongoose';

const CategoriaSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true, // Ensures slugs are unique
        index: true   // Improves query performance on slug
    },
    date: {
        type: Date,
        default: Date.now()
    }
});

// Export the model directly
const Categoria = mongoose.model("categorias", CategoriaSchema);

export default Categoria;