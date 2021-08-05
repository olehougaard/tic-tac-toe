
function vm(el) {
    return {
        el,
        data: {
            game: new Model()
        },
        methods: {
            message() {
                let w = this.game.winner()
                if (w) 
                    return w.winner + ' won!'
                else if (this.game.stalemate())
                    return 'Stalemate'
                else
                  return 'Your turn, ' + this.game.playerInTurn()
            },
            tiles() {
                const tiles = new Array(3)
                for(let x = 0; x < 3; x++) {
                    tiles[x] = new Array(3)
                    for(let y = 0; y < 3; y++) {
                        tiles[x][y] = {x, y, piece: this.game.piece(x, y) }
                    }
                }
                return tiles
            },
            makeMove(x, y) {
                this.game.makeMove(x, y)
            },
            reset() {
                this.game.clear()
            }
        }
    }
}
