// import express from 'express';
// import mysql from 'mysql2';

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 5173;

// Crear una conexión a la base de datos
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Cambia esto si tienes otro usuario
  password: 'comenius12', // Ingresa tu contraseña si la tienes
  database: 'test'
});

// Asegurarse de que la conexión esté establecida
connection.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos: ' + err.stack);
    return;
  }
  console.log('Conectado a la base de datos con ID ' + connection.threadId);
});

// Middleware para procesar JSON

app.use(cors({
  origin: 'http://localhost:5174', // Dirección del frontend
  methods: ['GET', 'POST'], // Métodos permitidos
  allowedHeaders: ['Content-Type'], // Encabezados permitidos
}));

app.use(express.json());

// Ruta para agregar un nuevo resultado
app.post('/api/jugadores', (req, res) => {
  const { jugador } = req.body;
  const query = 'INSERT INTO buscaminas1 (jugador) VALUES (?)';
  connection.query(query, [jugador], (err, results) => {
    if (err) {
      console.error('Error al insertar en la base de datos:', err);
      res.status(500).send('Error al guardar el jugador.');
      return;
    }
    res.status(201).send('Jugador guardado con éxito.');
  });
});

// Ruta para obtener todos los resultados
app.get('/api/jugadores', (req, res) => {
  const query = 'SELECT * FROM buscaminas1 ORDER BY id DESC';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error al consultar la base de datos:', err);
      res.status(500).send('Error al obtener los jugadores.');
      return;
    }
    res.json(results);
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});