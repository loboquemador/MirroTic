// Initialize the game board
  const grids = {
    'A': Array.from({ length: 3 }, () => Array(3).fill(null)),
    'B': Array.from({ length: 3 }, () => Array(3).fill(null)),
    'C': Array.from({ length: 3 }, () => Array(3).fill(null)),
    'D': Array.from({ length: 3 }, () => Array(3).fill(null)),
  };
  
  //Initialize score variables
  let scoreX = 0;
  let scoreO = 0;

  const gridCells = [];

  // Create the game board HTML elements
  for (const gridId in grids) {
    const gridContainer = document.createElement('div');
    gridContainer.classList.add('grid-container');

    const gridDiv = document.createElement('div');
    gridDiv.classList.add('grid');

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const cell = document.createElement('div');
        cell.classList.add('grid-cell');
        cell.dataset.grid = gridId;
        cell.dataset.row = i;
        cell.dataset.col = j;
        cell.addEventListener('click', () => handleCellClick(gridId, i, j));
        gridCells.push(cell);
        gridDiv.appendChild(cell);
      }
    }

    gridContainer.appendChild(gridDiv);
    document.getElementById('game-board').appendChild(gridContainer);
  }

  // Example: Determine random grid pairs
  const allGridPairs = [['AC', 'BD'], ['AB', 'CD'], ['AD', 'BC']];
  const connectedGrids = getRandomConnectedGrids(allGridPairs);
  console.log('Connected Grids:', connectedGrids);

  // Example mirroring ruleset
  const mirroringRuleset = generateMirroringRuleset(connectedGrids);
  console.log('Mirroring Ruleset:', mirroringRuleset);

  // Track current player (X or O)
  let currentPlayer = 'X';

  // Handle cell click event
  function handleCellClick(gridId, row, col) {
    // Check if the cell is empty
    if (!grids[gridId][row][col]) {
	
	  // Remove existing X or O classes
	  //cell.classList.remove('X', 'O');
      // Place the token in the selected cell
      grids[gridId][row][col] = currentPlayer;
      gridCells.find(cell => cell.dataset.grid === gridId && cell.dataset.row == row && cell.dataset.col == col).textContent = currentPlayer;
   
	  // Add class based on current player
	  gridCells.find(cell => cell.dataset.grid === gridId && cell.dataset.row == row && cell.dataset.col == col).classList.add(currentPlayer);

	  // Apply mirroring rules
      applyMirroring(gridId, row, col);
	  
	  
 
	// Calculate and update score
	calculateAndUpdateScore();
    
      
	currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
	// Update turn indicator
	const turnIndicator = document.getElementById('turn-indicator');
	turnIndicator.textContent = currentPlayer;
	turnIndicator.classList.remove('X', 'O');
	turnIndicator.classList.add(currentPlayer);
  

    }
  }

// Function to calculate and update score
function calculateAndUpdateScore() {
  const combinedGrid = combineGrids();
  let scoreX = 0;
  let scoreO = 0;

  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 6; j++) {
      const lineScore = calculateLineScore(combinedGrid, i, j);
      scoreX += lineScore.X;
      scoreO += lineScore.O;
    }
  }

  updateScoreDisplay(scoreX, scoreO);
}

// Function to calculate score for a specific line
function calculateLineScore(grid, row, col) {
  let score = { X: 0, O: 0 };
  
  // Check all directions
  ['horizontal', 'vertical', 'diagonalRight', 'diagonalLeft'].forEach(direction => {
    const count = countConsecutive(grid, row, col, direction);
    if (count >= 3) {
      const player = grid[row][col];
      const points = (count === 3) ? 1 : (count === 4) ? 2 : (count === 5) ? 3 : 4;
	  
      score[player] += points;
    }
  });
  return score;
}

// Function to count consecutive tokens
function countConsecutive(grid, row, col, direction) {
  if (!grid[row][col]) return 0;

  let count = 1;
  let deltaRow = 0;
  let deltaCol = 0;

  if (direction === 'horizontal') deltaCol = 1;
  else if (direction === 'vertical') deltaRow = 1;
  else if (direction === 'diagonalRight') { deltaRow = 1; deltaCol = 1; }
  else if (direction === 'diagonalLeft') { deltaRow = 1; deltaCol = -1; }

  // Count in positive direction
  count += countDirection(grid, row, col, deltaRow, deltaCol);

  // Count in negative direction
  count += countDirection(grid, row, col, -deltaRow, -deltaCol);

  return count;
}

// Helper function to count in a specific direction
function countDirection(grid, row, col, deltaRow, deltaCol) {
  let count = 0;
  let r = row + deltaRow;
  let c = col + deltaCol;
  const player = grid[row][col];

  while (r >= 0 && r < 6 && c >= 0 && c < 6 && grid[r][c] === player) {
    count++;
    r += deltaRow;
    c += deltaCol;
  }

  return count;
}


// Combine all four grids into a single 6x6 grid
function combineGrids() {
  const combinedGrid = Array.from({ length: 6 }, () => Array(6).fill(null));

  // Copy values from each grid to the combined grid
  for (const gridId in grids) {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        combinedGrid[i + getGridRowOffset(gridId)][j + getGridColOffset(gridId)] = grids[gridId][i][j];
      }
    }
  }
  //console.log(combinedGrid)

  return combinedGrid;
}

// Get the row offset for a specific grid
function getGridRowOffset(gridId) {
  return gridId === 'C' || gridId === 'D' ? 3 : 0;
}

// Get the column offset for a specific grid
function getGridColOffset(gridId) {
  return gridId === 'B' || gridId === 'D' ? 3 : 0;
}


// Apply mirroring based on the ruleset for the selected grid
function applyMirroring(gridId, row, col) {
  for (const connectedGrid of connectedGrids) {
    const [grid1, grid2] = connectedGrid.split('');
    if (gridId === grid1 || gridId === grid2) {
      const targetGrid = (gridId === grid1) ? grid2 : grid1;
      const mirroredRowCol = getMirroredRowCol(row, col, mirroringRuleset[connectedGrid]);
      mirrorCell(mirroredRowCol.row, mirroredRowCol.col, targetGrid, row, col, gridId);
	  console.log(`${currentPlayer} placed a token in ${gridId}${row}${col}, mirrored in ${targetGrid}${mirroredRowCol.row}${mirroredRowCol.col}`);
    }
  }
}

  // Get mirrored row and column based on the mirroring ruleset
  function getMirroredRowCol(row, col, ruleset) {
    let mirroredRow, mirroredCol;

    switch (ruleset) {
      case 'both':
        // Mirroring both dimensions
        mirroredRow = 2-row;
        mirroredCol = 2-col;
        break;
      case 'x-axis':
        // Mirroring only x-axis
        mirroredRow = row;
        mirroredCol = 2-col;
        break;
      case 'y-axis':
        // Mirroring only y-axis
        mirroredRow = 2-row
        mirroredCol = col;
        break;
    }

    return { row: mirroredRow, col: mirroredCol};
  }

  // Mirror a cell to another grid
  function mirrorCell(trow, tcol, tgrid, srow, scol, sgrid) {
     const targetCell = gridCells.find(cell => (cell.dataset.grid === tgrid && cell.dataset.row == trow && cell.dataset.col == tcol));
	 const sourceCell = gridCells.find(cell => cell.dataset.grid === sgrid && cell.dataset.row == srow && cell.dataset.col == scol);

    // Log the mirroring action

    targetCell.textContent = sourceCell.textContent;
    targetCell.classList.add(currentPlayer);
    grids[tgrid][trow][tcol] = grids[sgrid][srow][scol];
  }

  // Reset the game
  function resetGame() {
    for (const gridId in grids) {
      grids[gridId].forEach(row => row.fill(null));
    }
	gridCells.forEach(cell => cell.textContent = '');
	gridCells.forEach(cell => cell.classList.remove('X', 'O'));
    currentPlayer = 'X';
	const turnIndicator = document.getElementById('turn-indicator');
	turnIndicator.textContent = '_';
	turnIndicator.classList.remove('X', 'O');
	scoreX = 0;
	scoreO = 0;
	updateScoreDisplay(scoreX,scoreO);
  }

  // Function to determine random connected grid pairs
  function getRandomConnectedGrids(allGridPairs) {
    // Shuffle the array to randomize grid pairs
    for (let i = allGridPairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allGridPairs[i], allGridPairs[j]] = [allGridPairs[j], allGridPairs[i]];
    }

    // Return one of the complete sets
    return allGridPairs[0];
  }
  
// Function to update the score display  
function updateScoreDisplay(scoreX,scoreO) {
  document.getElementById('score-x').textContent = scoreX;
  document.getElementById('score-o').textContent = scoreO;
}

// Function to generate mirroring ruleset for each connected grid pair
function generateMirroringRuleset(connectedGrids) {
  const ruleset = {};

  // Create a copy of the rules array to ensure the original isn't modified
  const availableRules = ['both', 'x-axis', 'y-axis'];
  
  // Shuffle the available rules to randomize their order
  for (let i = availableRules.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableRules[i], availableRules[j]] = [availableRules[j], availableRules[i]];
  }

  // Select two rules randomly for the connected grids
  for (let i = 0; i < 2; i++) {
    ruleset[connectedGrids[i]] = availableRules[i];
  }

  return ruleset;
}
