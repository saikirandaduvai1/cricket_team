const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())

const dbaPath = path.join(__dirname, 'cricketTeam.db')

let db = null

const initializaDBServer = async () => {
  try {
    db = await open({
      filename: dbaPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB error ${e.message}`)
    process.exit(1)
  }
}

initializaDBServer()

const convetDBObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.playerId,
    playerName: dbObject.playerName,
    jerseyNumber: dbObject.jerseyNumber,
    role: dbObject.role,
  }
}

app.get('/players/', async (request, response) => {
  const getPlayerQuery = `
    SELECT *
    FROM cricket_team
    ORDER BY 
    playerId;
    `
  const playerArray = await db.all(getPlayerQuery)
  response.send(
    playerArray.map(eachplayer => convetDBObjectToResponseObject(eachplayer)),
  )
})
// ass api
app.post('/players/', async (request, response) => {
  const playersDetails = request.body
  const {playerName, jerseyNumber, role} = playersDetails
  const addPlayersQuery = `
  INSERT INFO
    cricket_team (playerName, jerseyNumber, role)
  VALUES 
  (
    '${playerName}',
    '${jerseyNumber}',
    '${role}'
  );
  `
  const dbResponse = await db.run(addPlayersQuery)
  const player_id = dbResponse.lastID
  response.send({player_id: player_id})
})
// get player id
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getplayerIdQuery = `
  SELECT *
  FROM cricket_team
  WHERE player_id = ${playerId};
  `
  const playerArray = await db.all(getplayerIdQuery)
  response.send(playerArray)
})
// update api

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playersDetails = request.body
  const {playerName, jerseyNumber, role} = playersDetails
  const updateplayerQuery = `
  UPDATE
    cricket_team
  SET 
     playerName='${playerName}',
     jerseyNumber='${jerseyNumber}',
     role='${role}'
  WHERE
    player_id = ${playerId};
  `
  await db.run(updateplayerQuery)
  response.send('Player Update successfully')
})

//delete api

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `
  DELETE FROM
  cricket_team
  WHERE 
  player_id = ${playerId};
  `
  await db.run(deletePlayerQuery)
  response.send('player delete successfully')
})
