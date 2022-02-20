import { useState, useEffect } from 'react';
import './App.css';

var seedrandom = require('seedrandom');
var today = new Date();
var rng = seedrandom(today.getFullYear + '-' + today.getMonth() + '-' + today.getDate());

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
//  -2 = flag
// 0-8 = number of mines surrounding

function App() {
    const [board, setBoard] = useState(new Array<Tile>(100));

    if (typeof board === 'undefined') {
        setBoard((prevState) => {
            for (var i = 0; i < prevState.length; i++) {
                prevState[i] = {value: 0, revealed: false};
            }
            return prevState
        })
    }

    useEffect(() => {
        console.log("board changed");
    }, [board])


    useEffect(() => {
        var temp = [...board];

        // Initialize array
        for (var i = 0; i < temp.length; i++) {
            temp[i] = {value: 0, revealed: false};
        }

        // TODO find a consistant way to get the right number of mines
        //      The current code is generating practially a random number
        //      of mines.
        //      Actually, this seems to be working fine. For some reason't it's
        //      not running on refresh, but only on code compilation. It just adds
        //      10 each time it is refreshed. This should be able to be fixed after
        //      determinism is added
        //
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

    return (
        <div className="App">
            <header className="App-header">
                <h1>MINE</h1>
            </header>
            <div className="App-body">
                <div className="board">
                    {board.map((tile, index) => {
                        if (tile.revealed === false) {
                            return <div className="tile" onClick={() => click(index)}>⠀</div>
                        } else {
                            if (tile.value === 0) {
                                return <div className="tile empty" onClick={() => click(index)}>⠀</div>;
                            } else if (tile.value === -1) {
                                return <div className="tile bomb" onClick={() => click(index)}>{tile.value}</div>;
                            } else {
                                return <div className="tile number" onClick={() => click(index)}>{tile.value}</div>;
                            }
                        }
                    })}
                </div>
            </div>
        </div>
    );

    function click(index: number) {
        console.log("clicked: " + index);
        console.log("revealed: " + board[index].revealed);

        if (board[index].value === -1) {
            // Game over
            // } else if (board[index].value === 0) {
            //     reveal(index);
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
            console.log("recurse");
            temp[index].revealed = true;

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
            console.log("break");
            temp[index].revealed = true;
        }

        setBoard(temp);
    }
}

interface Tile {
    value: number;
    revealed: boolean;
}

export default App;
