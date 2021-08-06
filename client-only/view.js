function view() {
    "use strict"
    
    const messages = document.getElementById('messages'),
        table = document.getElementById('board'),
        tiles = [ new Array(3), new Array(3), new Array(3) ],
        reset = document.getElementById('reset')
    
    for (let i = 0; i < 3; i++) {
        let tr = table.appendChild(document.createElement('tr'))
        for (let j = 0; j < 3; j++) {
            tiles[i][j] = tr.appendChild(document.createElement('td'))
        }
    }

    function showMessage(message) {
        messages.textContent = message
    }
    
    function updateBoard(board) {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board(i, j)) {
                    tiles[i][j].style['background-image'] = 'url(' + board(i, j) + '.png)'
                } else {
                    tiles[i][j].style.background = 'white'
                }
            }
        }
    }

    function listen(listener) {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                tiles[i][j].onclick = listener.clickBoard.bind(listener, i, j)
            }
        }
        reset.onclick = listener.clickReset
    }

    return { showMessage, updateBoard, listen }
}