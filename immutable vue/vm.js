
function vm(el) {
    const positions = range(3).map(x => range(3).map(y => ({x, y})))
    return {
        el,
        data: {
            game: model()
        },
        computed: {
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
                return positions.map(r => r.map(({x, y}) => ({x, y, piece: this.game.piece(x, y)})))
            }
        },
        methods: {
            makeMove(x, y) {
                this.game = this.game.makeMove(x, y)
            },
            reset() {
                this.game = this.game.clear()
            }
        }
    }
}
