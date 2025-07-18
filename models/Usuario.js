import mongoose from 'mongoose'

const Schema = mongoose.Schema

const UsuarioSchema = new Schema({ // Renamed to UsuarioSchema for clarity
    nome: {
        type: String,
        required: true
    }, 
    email: {
        type: String,
        required: true,
        unique: true, // Ensures email is unique
        index: true   // Improves query performance on email
    }, 
    senha: {
        type: String,
        required: true
    },
    eAdmin: {
        type: Number,
        default: 0
    }
})

// Define the model using the schema
const Usuario = mongoose.model("usuarios", UsuarioSchema)

// Export the model so it can be imported elsewhere
export default Usuario