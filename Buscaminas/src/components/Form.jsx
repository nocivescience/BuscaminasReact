import React, { useState } from 'react';
import axios from 'axios';

const IngresarJugador = () => {
  const [jugador, setJugador] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5173/api/jugadores', { jugador });
      alert('Jugador guardado con éxito.');
      setJugador('');
    } catch (error) {
      console.error('Error al guardar el jugador:', error);
      alert('Hubo un problema al guardar el jugador.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Nombre del Jugador:
        <input
          type="text"
          value={jugador}
          onChange={(e) => setJugador(e.target.value)}
          required
        />
      </label>
      <button type="submit">Guardar</button>
    </form>
  );
};

export default IngresarJugador;
