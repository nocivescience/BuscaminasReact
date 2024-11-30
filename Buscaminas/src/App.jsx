import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Jugador from './components/Form';
import Lista from './components/List';

const Minesweeper = () => {
  const [board, setBoard] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [flagMode, setFlagMode] = useState(false);
  const [mineCount, setMineCount] = useState(10);
  const [flagCount, setFlagCount] = useState(0);
  const [gameData, setGameData] = useState(null);
  const rows = 8;
  const cols = 8;
  const mines = 10;

  // Cargar datos del servidor con Axios
  useEffect(() => {
    axios.get('/api/game-configuration') // URL del servidor que devuelve la configuración del juego
      .then(response => {
        const data = response.data;
        // Configura el juego con los datos obtenidos (esto depende de cómo esté estructurada la respuesta)
        setGameData(data);
        setMineCount(data.mineCount);
        // Puedes establecer más configuraciones si es necesario
        resetGame(data);
      })
      .catch(error => {
        console.error("Error al cargar la configuración del juego:", error);
        // Establecer valores predeterminados si ocurre un error
        resetGame();
      });
  }, []);

  // Inicializar tablero
  const initializeBoard = () => {
    let newBoard = Array(rows).fill().map(() =>
      Array(cols).fill().map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0
      }))
    );

    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const randomRow = Math.floor(Math.random() * rows);
      const randomCol = Math.floor(Math.random() * cols);

      if (!newBoard[randomRow][randomCol].isMine) {
        newBoard[randomRow][randomCol].isMine = true;
        minesPlaced++;
      }
    }

    // Calcular números para cada celda
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (!newBoard[i][j].isMine) {
          let count = 0;
          for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
              if (i + di >= 0 && i + di < rows && j + dj >= 0 && j + dj < cols) {
                if (newBoard[i + di][j + dj].isMine) count++;
              }
            }
          }
          newBoard[i][j].neighborMines = count;
        }
      }
    }

    return newBoard;
  };

  // Revelar celdas vacías recursivamente
  const revealEmpty = (board, row, col) => {
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];

    for (let [dx, dy] of directions) {
      const newRow = row + dx;
      const newCol = col + dy;

      if (
        newRow >= 0 && newRow < rows &&
        newCol >= 0 && newCol < cols &&
        !board[newRow][newCol].isRevealed &&
        !board[newRow][newCol].isFlagged
      ) {
        board[newRow][newCol].isRevealed = true;
        if (board[newRow][newCol].neighborMines === 0) {
          revealEmpty(board, newRow, newCol);
        }
      }
    }
  };

  // Manejar click en celda
  const handleCellClick = (row, col) => {
    if (gameOver || win) return;

    const newBoard = [...board];
    const cell = newBoard[row][col];

    if (cell.isRevealed || (cell.isFlagged && !flagMode)) return;

    if (flagMode) {
      if (!cell.isRevealed) {
        cell.isFlagged = !cell.isFlagged;
        setFlagCount(flagCount + (cell.isFlagged ? 1 : -1));
      }
    } else {
      if (cell.isFlagged) return;

      cell.isRevealed = true;

      if (cell.isMine) {
        setGameOver(true);
        // Revelar todas las minas
        newBoard.forEach(row =>
          row.forEach(cell => {
            if (cell.isMine) cell.isRevealed = true;
          })
        );
      } else if (cell.neighborMines === 0) {
        revealEmpty(newBoard, row, col);
      }
    }

    setBoard(newBoard);

    // Verificar victoria
    const unrevealed = newBoard.flat().filter(cell => !cell.isRevealed).length;
    if (unrevealed === mines) {
      setWin(true);
    }
  };

  // Reiniciar juego
  const resetGame = (data = null) => {
    setBoard(initializeBoard());
    setGameOver(false);
    setWin(false);
    setFlagMode(false);
    setFlagCount(0);

    // Si hay datos del servidor, configúralos
    if (data) {
      setMineCount(data.mineCount);
      // Agregar más configuraciones si es necesario
    }
  };

  const getCellContent = (cell) => {
    if (cell.isFlagged) return '🚩';
    if (!cell.isRevealed) return '';
    if (cell.isMine) return '💣';
    if (cell.neighborMines === 0) return '';
    return cell.neighborMines;
  };

  if (!gameData) {
    return <div>Cargando...</div>; // Puedes mostrar un loader mientras se cargan los datos
  }

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <div style={{ 
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0 }}>Buscaminas</h1>
        <div>
          <span style={{ marginRight: '20px' }}>
            Minas: {mineCount - flagCount}
          </span>
          {gameOver ? '😵' : win ? '😎' : '🙂'}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setFlagMode(!flagMode)}
          style={{
            marginRight: '10px',
            padding: '8px 16px',
            backgroundColor: flagMode ? '#4CAF50' : '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {flagMode ? '🚩 Modo Bandera' : 'Modo Normal'}
        </button>
        <button 
          onClick={resetGame}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Nuevo Juego
        </button>
      </div>

      <div style={{
        display: 'inline-block',
        backgroundColor: '#f0f0f0',
        padding: '10px',
        borderRadius: '8px'
      }}>
        {board.map((row, i) => (
          <div key={i} style={{ display: 'flex' }}>
            {row.map((cell, j) => (
              <button
                key={`${i}-${j}`}
                onClick={() => handleCellClick(i, j)}
                style={{
                  width: '40px',
                  height: '40px',
                  margin: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: cell.isRevealed 
                    ? (cell.isMine ? '#ff9999' : '#fff')
                    : '#ddd',
                  border: '1px solid #999',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  color: cell.isRevealed && cell.neighborMines === 0 ? '#000' : '#333'
                }}
              >
                {getCellContent(cell)}
              </button>
            ))}
          </div>
        ))}
      </div>
      <Jugador />
      <Lista />
    </div>
  );
};

export default Minesweeper;
