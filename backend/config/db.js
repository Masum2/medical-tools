const express = require('express');
const colors = require('colors');
const { default: mongoose, mongo } = require('mongoose');

const connectDB = async ()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log(`Mongo db connected ${mongoose.connection.host}`.bgCyan.white)
    } catch (error) {
        
        console.log(`Mongo DB issue ${error}`.bgCyan.red)
    }
}

module.exports = connectDB;