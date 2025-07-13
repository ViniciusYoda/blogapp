import mongoose from 'mongoose';

const PostagemSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    descricao: {
        type: String,
        required: true
    },
    conteudo: {
        type: String,
        required: true
    },
    categoria: {
        type: mongoose.Schema.Types.ObjectId, // Use mongoose.Schema.Types.ObjectId for clarity
        ref: "categorias",
        required: true
    },
    data: {
        type: Date,
        default: Date.now()
    }
});

// Export the Mongoose model directly
const Postagem = mongoose.model("postagens", PostagemSchema);

export default Postagem;