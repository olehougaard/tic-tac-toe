const express = require('express')
const model = require('./model.js')

const games = []
const ongoing_games = {}

const create_game = () => {
    const game = {...model(games.length), version: 0, ongoing: false}
    games.push(game)
    return game
}

const send_data = (res, data) => {
    if (data) {
        res.send(data)
    } else {
        res.status(404).send()
    }
}

const game_data = game => ({
    board: game.board, 
    inTurn: game.inTurn, 
    winner: game.winner, 
    stalemate: game.stalemate, 
    gameNumber: game.gameNumber, 
    moves: game.moves,
    version: game.version,
    ongoing: game.ongoing})

const send_game_data = (res, gameNumber) => {
    const game = games[gameNumber]
    send_data(res, game_data(game))
}

const gameserver = express()

gameserver.use (function(req, _, next) {
    req.setEncoding('utf8')
    req.body = new Promise(resolve => {
        let data=''
        req.on('data', function(chunk) { 
            data += chunk
         })
     
         req.on('end', function() {
             resolve(data)
             next();
         })
    })
})

gameserver.use(function(_, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PATCH");
    next();
});

gameserver.use(express.static('static'))

gameserver.post('/games', (_, res) => {
    const game = create_game()
    send_data(res, game_data(game))
})

gameserver.get('/games', (_, res) => {
    res.send(games
        .filter(g => !g.ongoing)
        .map(game_data))
})

gameserver.get('/games/:gameNumber', (req, res) => {
    const baseline = req.query.baseline ?? -1
    const game = games[req.params.gameNumber]
    if (game?.version > baseline) {
        send_game_data(res, req.params.gameNumber)
    } else if (game) {
        res.status(204).send({})
    } else {
        res.status(404).send();
    }
})

gameserver.patch('/games/:gameNumber', (req, res) => {
    const gameNumber = req.params.gameNumber
    req.body
    .then(JSON.parse)
    .then( gamePatch => {
        if (!games[gameNumber])
            res.status(404).send()
        else {
            const game = games[gameNumber]
            if (gamePatch.hasOwnProperty('ongoing')) {
                if (!gamePatch.ongoing || game.ongoing)
                    res.status(403).send()
                else {
                    ongoing_games[gameNumber] = true
                    games[gameNumber] = {...game, version:game.version + 1, ongoing: true}
                    send_game_data(res, gameNumber)
                }
            } else if (gamePatch.hasOwnProperty('winner')) {
                if (!game.ongoing)
                    res.status(403).send()
                else {
                    const winner = gamePatch.winner
                    games[gameNumber] = { ...game.conceded(winner), version: game.version + 1, ongoing: game.ongoing}
                    send_game_data(res, gameNumber)
                }
            }
        }
    })
})

gameserver.post('/games/:gameNumber/moves', (req, res) => {
    const gameNumber = req.params.gameNumber
    req.body
    .then(JSON.parse)
    .then( ({ x, y, inTurn }) => {
        const game = games[gameNumber]
        if (!game?.ongoing)
            res.status(403).send()
        else if (inTurn === game.inTurn && game.legalMove(x,y)) {
            const afterMove = game.makeMove(x, y)
            games[gameNumber] = {... afterMove, ongoing: true, version: game.version + 1}
            send_game_data(res, gameNumber)
        } else {
            res.status(403).send()
        }
    })
})

gameserver.listen(8080, () => console.log('Gameserver listening on 8080'))
