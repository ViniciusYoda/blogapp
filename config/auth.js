import localStrategy from 'passport-local'

import mongoose from 'mongoose'

import bcrypt from 'bcryptjs'

import Usuario from '../models/Usuario'

export default function(passport) {
    passport.use(new localStrategy({usernameField: 'email', passwordField: 'senha'}, (email, senha, done) => {
        Usuario.findOne({email: email}).then((usuario) => {
            if(!usuario) {
                return done(null, false, {message: "Esta conta não existe"})
            }

            bcrypt.compare(senha, usuario.senha, (erro, batem) => {
                if(batem) {
                    return done(null, usuario)
                } else {
                    return (done(null, falsse, {message: "Senha incorreta"}))
                }
            })
        })
    }))

    passport.serializerUser((user, done) => {
        done(null, user.id)
    })

    passport.deserializerUser((id, done) => {
        Usuario.findById(id, (err, usuario) => {
            done(err, user)
        })
    })
}

