import { useState, useEffect } from 'react';
import { useLongPress } from 'use-long-press';
import './App.css';

// var seedrandom = require('seedrandom');
// var today = new Date();
// var rng = seedrandom(today.getFullYear + '-' + today.getMonth() + '-' + today.getDate());

// TODO list:
//      - Store if it has been completed or lost on the current
//        day so that they can't play more than once a day
//      - Store array of whether it was won or lost for stats,
//        maybe include time taken in those too (time since first
//        open to time of completion)
//      - Store today's board and reveal status so that it can be
//        recreated if the user leaves and comes back on the same day.
//        Store the date along with this so that it can be invalidated
//        past midnight. Maybe use the bomb position to do this since that
//        will change for a given day?

// board[i].value:
//  -1 = mine
// 0-8 = number of mines surrounding

function App() {
    const [board, setBoard] = useState(new Array<Tile>(100));
    var longIndex = 0;

    useEffect(() => {
        var temp = new Array<Tile>(100);

        // Initialize array
        for (var i = 0; i < temp.length; i++) {
            temp[i] = {value: 0, revealed: false, flagged: false};
        }

        // TODO Find a way to make this deterministic and based on the current date
        // Place mines randomly
        for (var r = 0; r < 10; r++) {
            var x = Math.round(Math.random() * 99);
            if (temp[x].value !== -1) {
                temp[x].value = -1;
            } else {
                r--;
            }
        }

        // Get surrounding mine values.
        for (i = 0; i < temp.length; i++) {
            if (temp[i].value === -1) { continue; }

            var mines = 0;

            // Fix this so that it doesn't loop around. For example, 0 + 9 should not exist (be null) according to the board but it does eixst because that's just index 9.
            if (i % 10 !== 0) {
                try { if (temp[i + 9].value === -1) mines++; } catch (e) {}
                try { if (temp[i - 11].value === -1) mines++; } catch (e) {}
                try { if (temp[i - 1].value === -1) mines++; } catch (e) {}
            }
            if (i % 10 !== 9) {
                try { if (temp[i - 9].value === -1) mines++; } catch (e) {}
                try { if (temp[i + 11].value === -1) mines++; } catch (e) {}
                try { if (temp[i + 1].value === -1) mines++; } catch (e) {}
            }
            try { if (temp[i - 10].value === -1) mines++; } catch (e) {}
            try { if (temp[i + 10].value === -1) mines++; } catch (e) {}

            temp[i].value = mines;
        }

        setBoard(temp);
    }, []);

    const longPress = useLongPress(() => flag(longIndex) );
    const timer = (ms: number) => new Promise(res => setTimeout(res, ms));

    return (
        <div className="App">
            <header className="App-header">
                <h1>MINE</h1>
            </header>
            <div className="App-body">
                <div className="board">
                    {board.map((tile, index) => {
                        if (tile.flagged) {
                            return <div key={index} className="tile flagged" {...longPress} onClick={() => flag(index)} onContextMenu={(e) => {flag(index); e.preventDefault();}} onMouseDown={() => {longIndex = index;}}>🚩</div>
                        } else if (!tile.revealed) {
                            return <div key={index} className="tile" {...longPress} onClick={() => click(index)} onContextMenu={(e) => {flag(index); e.preventDefault();}} onMouseDown={() => {longIndex = index;}}>⠀</div>
                        } else {
                            if (tile.value === 0) {
                                return <div key={index} className="tile empty" onClick={() => click(index)}>⠀</div>;
                            } else if (tile.value === -1) {
                                return <div key={index} className="tile bomb" onClick={() => click(index)}>⏺</div>;
                            } else {
                                return <div key={index} className="tile number" onClick={() => click(index)}>{tile.value}</div>;
                            }
                        }
                    })}
                </div>
            </div>
        </div>
    );

    async function endGame(won: boolean) {
        const animationDelay = 400;
        if (won) {
            console.log("Won!");
        } else {
            console.log("Lost!");
            await timer(animationDelay);
            for (var i = 0; i < board.length; i++) {
                if (board[i].value === -1 && !board[i].revealed) {
                    const temp = [...board];
                    temp[i].revealed = true;
                    setBoard(temp);
                    if (!board[i].flagged) {
                        await timer(animationDelay);
                    }
                }
            }
        }
    }

    function checkWinCondition() {
        for (var i = 0; i < board.length; i++) {
            if (board[i].value === -1 && !board[i].flagged) {
                return false;
            }
        }

        return true;
    }

    function flag(index: number) {
        console.log('flagged');

        const temp = [...board];
        temp[index].flagged = !temp[index].flagged;
        setBoard(temp);

        if (checkWinCondition()) {
            endGame(true);
        }
    }

    function click(index: number) {
        if (board[index].value === -1) {
            setBoard((prevState) => {
                prevState[index].revealed = true;
                return [...prevState];
            });
            endGame(false);
        } else {
            reveal(index);
        }
    }

    function reveal(index: number) {
        var temp = [...board];

        if (temp[index].revealed === true) {
            return
        }
        if (temp[index].value === 0) {
            temp[index].revealed = true;
            temp[index].flagged = false;

            if (index % 10 !== 0) {
                try { reveal(index - 1) } catch (e) {}
                try { reveal(index - 11) } catch (e) {}
                try { reveal(index + 9) } catch (e) {}
            }
            if (index % 10 !== 9) {
                try { reveal(index + 1) } catch (e) {}
                try { reveal(index - 9) } catch (e) {}
                try { reveal(index + 11) } catch (e) {}
            }
            try { reveal(index - 10) } catch (e) {}
            try { reveal(index + 10) } catch (e) {}

        } else {
            temp[index].revealed = true;
            temp[index].flagged = false;
        }

        setBoard(temp);
    }
}

interface Tile {
    value: number;
    revealed: boolean;
    flagged: boolean;
}

export default App;
