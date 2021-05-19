document.addEventListener('DOMContentLoaded', () => {
    const gridCtr = document.querySelector('.grid-ctr');
    const bombsLeftCtr = document.querySelector('.bombs-left');
    const timeCtr = document.querySelector('.time');
    const resultCtr = document.querySelector('.result-ctr');

    let shuffledArray = [];
    let isGameOver = false;
    let startTimeFlag = false;
    let clickedBoxCount = 0;
    let cancelAnimId;

    class Minesweeper {

        constructor(rowsCount, columnsCount, bombsCount) {
            this.rowsCount = rowsCount;
            this.columnsCount = columnsCount;
            this.bombsCount = bombsCount;
            this.remainingBombs = bombsCount;
            this.flagCount = bombsCount;
        }

        createMineBoard() {
            bombsLeftCtr.textContent = this.remainingBombs;
            let emptyArray = Array((this.rowsCount * this.columnsCount) - this.bombsCount).fill(null).map(()=> ({state: 'empty', bombCount: 0}));
            let bombsArray = Array(this.bombsCount).fill(null).map(()=> ({state: 'bomb'}));
            let allBoxArray = bombsArray.concat(emptyArray);
            shuffledArray = allBoxArray.sort(() => Math.random() - 0.5);
    
            for(let i = 0; i < shuffledArray.length; i++){
                let box = document.createElement('div');
                box.setAttribute('data-id', i);
                box.classList.add('box', i, shuffledArray[i].state);
                box.addEventListener('click', this.handleLeftClick.bind(this));
                box.addEventListener('contextmenu', this.handleRightClick.bind(this));
                gridCtr.appendChild(box);
            }
    
            gridCtr.style.width = `${this.columnsCount * 4}rem`;
            gridCtr.style.height = `${this.rowsCount * 4}rem`;
            this.setNumbers();
        }
    
        setNumbers() {
            document.querySelectorAll('.bomb').forEach((box) => {
                let i = parseInt(box.dataset.id);
                let leftMostBox = i % this.columnsCount === 0;
                let rightMostBox = i % this.columnsCount === this.columnsCount - 1;
                if(!leftMostBox) shuffledArray[i - 1].bombCount++;
                if(!rightMostBox) shuffledArray[i + 1].bombCount++;
                if(i > this.columnsCount - 1) shuffledArray[i - this.columnsCount].bombCount++;
                if(i < shuffledArray.length - this.columnsCount) shuffledArray[i + this.columnsCount].bombCount++;
                if(!leftMostBox && i > this.columnsCount - 1) shuffledArray[i - this.columnsCount - 1].bombCount++;
                if(!leftMostBox && i < shuffledArray.length - this.columnsCount) shuffledArray[i + this.columnsCount - 1].bombCount++;
                if(!rightMostBox && i > this.columnsCount - 1) shuffledArray[i - this.columnsCount + 1].bombCount++;
                if(!rightMostBox && i < shuffledArray.length - this.columnsCount) shuffledArray[i + this.columnsCount + 1].bombCount++;
            });
        }
    
        handleLeftClick(grid){
            if(!startTimeFlag){
                this.setTimer();
                startTimeFlag = true;
            }
            grid = grid.target ? grid.target : grid;
            if(isGameOver || grid.classList.contains('clicked') || grid.classList.contains('flag')) return;
            if(grid.classList.contains('bomb')){
                this.gameOver('fail');
            } else {
                if(shuffledArray[grid.dataset.id].bombCount !== 0){
                    grid.innerHTML = shuffledArray[grid.dataset.id].bombCount;
                    grid.classList.add('clicked');
                    clickedBoxCount++;
                    this.gameOver();
                    return;
                }
                grid.classList.add('clicked');
                clickedBoxCount++;
                this.checkNeighbours(grid.dataset.id);
                this.gameOver();
            }
        }
    
        handleRightClick(grid){
            if(!startTimeFlag){
                this.setTimer();
                startTimeFlag = true;
            }
            event.preventDefault();
            grid = grid.target ? grid.target : grid;

            if(isGameOver || grid.classList.contains('clicked') || this.remainingBombs < 0) return;
            let isBombBox = grid.classList.contains('bomb');
            if(grid.classList.contains('flag')){
                grid.classList.remove('flag');
                bombsLeftCtr.textContent = ++this.flagCount;;
                if(isBombBox){ ++this.remainingBombs; } 
            } else {
                grid.classList.add('flag');
                bombsLeftCtr.textContent = --this.flagCount;
                if(isBombBox){ 
                    --this.remainingBombs;
                    this.gameOver();
                }
            }
        }
    
        checkNeighbours(gridId){
            let leftMostBox = gridId % this.columnsCount === 0;
            let rightMostBox = gridId % this.columnsCount === this.columnsCount - 1;
            setTimeout(() => {
                if(gridId < shuffledArray.length && !rightMostBox){
                    let newGrid = document.getElementsByClassName(parseInt(gridId)+1)[0];
                    this.handleLeftClick(newGrid);
                }
                if(!leftMostBox && gridId > 0){
                    let newGrid = document.getElementsByClassName(parseInt(gridId)-1)[0];
                    this.handleLeftClick(newGrid);
                }
                if(gridId < (shuffledArray.length - this.columnsCount)){
                    let newGrid = document.getElementsByClassName(parseInt(gridId)+this.columnsCount)[0];
                    this.handleLeftClick(newGrid);
                }
                if(gridId > this.columnsCount){
                    let newGrid = document.getElementsByClassName(parseInt(gridId)-this.columnsCount)[0];
                    this.handleLeftClick(newGrid);
                }
                if((!rightMostBox && gridId < (shuffledArray.length - this.columnsCount))){
                    let newGrid = document.getElementsByClassName(parseInt(gridId)+ this.columnsCount + 1)[0];
                    this.handleLeftClick(newGrid);
                }
                if((!leftMostBox && gridId < (shuffledArray.length - this.columnsCount))){
                    let newGrid = document.getElementsByClassName(parseInt(gridId)+ this.columnsCount - 1)[0];
                    this.handleLeftClick(newGrid);
                }
                if(!leftMostBox && gridId > this.columnsCount){
                    let newGrid = document.getElementsByClassName(parseInt(gridId) - this.columnsCount - 1)[0];
                    this.handleLeftClick(newGrid);
                }
                if(!rightMostBox && gridId > this.columnsCount){
                    let newGrid = document.getElementsByClassName(parseInt(gridId) - this.columnsCount + 1)[0];
                    this.handleLeftClick(newGrid);
                }
            }, 50);
        }
    
        setTimer(){
            let count = 0;
            let time = 0;
            if(isGameOver){
                cancelAnimationFrame(cancelAnimId);
            } else {
                function repeatOften() {
                    count++;
                    console.log(count);
                    if(count === 60){
                        time++;
                        count = 0;
                    }
                    timeCtr.textContent = time;
                    cancelAnimId = requestAnimationFrame(repeatOften);
                }
                cancelAnimId = requestAnimationFrame(repeatOften);
            }
        }
    
        gameOver(status){
            if(status === 'fail'){
                shuffledArray.forEach((box, i) => {
                    if(box.state === 'bomb'){
                        document.getElementsByClassName(i)[0].classList.add('clicked');
                    }
                });
                resultCtr.textContent = `Game ended in ${timeCtr.textContent} secs... Better luck next time!!!`;
                isGameOver = true;
                this.setTimer();
            } else {
                if(this.remainingBombs === 0 && clickedBoxCount === (shuffledArray.length - this.bombsCount)){
                    resultCtr.textContent = `Congratulations Buddy!!!... You have won the game in ${timeCtr.textContent} secs`;
                    isGameOver = true;
                    this.setTimer();
                }
            }
        }
    }
      
    let minesGame = new Minesweeper(10, 10, 10);
    minesGame.createMineBoard();
});