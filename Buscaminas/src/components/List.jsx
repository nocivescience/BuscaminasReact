import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ListaJugadores = () => {
  const [jugadores, setJugadores] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5173/api/jugadores')
      .then(response => setJugadores(response.data))
      .catch(error => console.error('Error al obtener jugadores:', error));
  }, []);

  return (
    <div>
      <h2>Lista de Jugadores</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Jugador</th>
          </tr>
        </thead>
        <tbody>
          {jugadores.map(jugador => (
            <tr key={jugador.id}>
              <td>{jugador.id}</td>
              <td>{jugador.jugador}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListaJugadores;