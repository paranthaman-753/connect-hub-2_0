const express = require('express')
const path = require('path')
const { open } = require('sqlite')
const sqlite3 = require('sqlite3')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const swaggerUi = require('swagger-ui-express')
const YAML = require('yaml')
const fs = require('fs')

const jwtSecretToken = process.env.JWT_SECRET

const swaggerDocument = YAML.parse(
    fs.readFileSync(path.join(__dirname, 'openapi.yaml'), 'utf8')
)

// Creating object for express
const app = express()

// JSON Acceptance Middleware
app.use(express.json())

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// Creating dbPath
const dbPath = path.join(__dirname, 'twitterClone.db')

let db = null

// Creating a function to connect the database with backend
const initializeDBAndServer = async () => {
    db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    })

    app.listen(3000, () => {
        console.log('Server running at http://localhost:3000/')
        console.log('API Documentation at http://localhost:3000/api-docs/')
    })
}

// Calling the initializeDBAndServer Function
initializeDBAndServer()


// Middleware for Protected API by authenticationToken
const authenticationToken = (request, response, next) => {
    const authHeader = request.headers["authorization"]

    const jwtToken = authHeader && authHeader.split(" ")[1]

    if (!jwtToken) {
        return response.status(401).send("Invalid JWT Token")
    }

    try {
        const payload = jwt.verify(
            jwtToken,
            jwtSecretToken
        )

        request.username = payload.username
        next()
    } catch (error) {
        return response.status(401).send("Invalid JWT Token")
    }
}


// API-1
// Register User
app.post('/register/', async (request, response) => {

    const newUserData = request.body

    const { username, password, name, gender } = newUserData

    const selectUserQ = `
        SELECT *
        FROM user
        WHERE username = ?;
    `

    const dbUser = await db.get(selectUserQ, [username])

    if (dbUser !== undefined) {
        return response.status(400).send("User already exists")
    }

    if (password.length < 6) {
        return response.status(400).send("Password is too short")
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const addNewUserQ = `
        INSERT INTO user
        (username, password, name, gender)
        VALUES (?, ?, ?, ?);
    `

    await db.run(
        addNewUserQ,
        [username, hashedPassword, name, gender]
    )

    return response.status(200).send("User created successfully")
})


// API-2
// Login User
app.post('/login/', async (request, response) => {

    const loginCred = request.body

    const { username, password } = loginCred

    const selectUserQ = `
        SELECT *
        FROM user
        WHERE username = ?;
    `

    const dbUser = await db.get(selectUserQ, [username])

    if (dbUser === undefined) {
        return response.status(400).send("Invalid user")
    }

    const isPasswordMatched = await bcrypt.compare(
        password,
        dbUser.password
    )

    if (isPasswordMatched === false) {
        return response.status(400).send("Invalid password")
    }

    const payload = {
        username: username
    }

    const jwtToken = jwt.sign(
        payload,
        jwtSecretToken
    )

    return response.send({
        jwtToken: jwtToken
    })
})


// API-3
// Get User Tweet Feed
app.get(
    '/user/tweets/feed/',
    authenticationToken,
    async (request, response) => {

        const feedForUserQ = `
            SELECT
                user.username,
                tweet.tweet,
                tweet.date_time AS dateTime
            FROM tweet
            JOIN user
            ON user.user_id = tweet.user_id
            WHERE tweet.user_id IN (
                SELECT following_user_id
                FROM follower
                WHERE follower_user_id = (
                    SELECT user_id
                    FROM user
                    WHERE username = ?
                )
            )
            ORDER BY tweet.date_time DESC
            LIMIT 4;
        `

        const feedForUser = await db.all(
            feedForUserQ,
            [request.username]
        )

        response.send(feedForUser)
    }
)


// API-4
// Get Following List
app.get(
    '/user/following/',
    authenticationToken,
    async (request, response) => {

        const followingListQ = `
            SELECT DISTINCT user.name
            FROM user
            JOIN follower
            ON user.user_id = follower.following_user_id
            WHERE follower.follower_user_id = (
                SELECT user_id
                FROM user
                WHERE username = ?
            );
        `

        const followingList = await db.all(
            followingListQ,
            [request.username]
        )

        response.send(followingList)
    }
)


// API-5
// Get Followers List
app.get(
    '/user/followers/',
    authenticationToken,
    async (request, response) => {

        const followersListQ = `
            SELECT DISTINCT user.name
            FROM user
            JOIN follower
            ON user.user_id = follower.follower_user_id
            WHERE follower.following_user_id = (
                SELECT user_id
                FROM user
                WHERE username = ?
            );
        `

        const followersList = await db.all(
            followersListQ,
            [request.username]
        )

        response.send(followersList)
    }
)

//API-6
app.get('/tweets/:tweetId/', authenticationToken, async (request, response) => {
    const { tweetId } = request.params
    const tweetsQ = `SELECT tweet.tweet,
                    (SELECT COUNT(*) FROM like WHERE like.tweet_id = tweet.tweet_id) AS likes,
                    (SELECT COUNT(*) FROM reply WHERE reply.tweet_id = tweet.tweet_id) AS replies,
                    tweet.date_time AS dateTime
                    FROM tweet
                    WHERE tweet_id = ?
                    AND tweet.user_id IN (
                        SELECT following_user_id 
                        FROM follower
                        WHERE follower_user_id = (
                            SELECT user_id FROM user
                            WHERE username = ?
                        )
                    );`
    const tweets = await db.get(tweetsQ, [tweetId, request.username])
    if (tweets === undefined) {
        return response.status(401).send("Invalid Request")
    }
    response.send(tweets)
})

// API-7
app.get('/tweets/:tweetId/likes/', authenticationToken, async (request, response) => {
    const { tweetId } = request.params
    const tweetCheckQ = `SELECT tweet_id FROM tweet
                    WHERE tweet_id = ?
                    AND user_id IN (
                        SELECT following_user_id
                        FROM follower
                        WHERE follower_user_id = (
                            SELECT user_id
                            FROM user
                            WHERE username = ?
                        )
                    );`
    const tweetCheck = await db.get(tweetCheckQ, [tweetId, request.username])
    if (tweetCheck === undefined) {
        return response.status(401).send("Invalid Request")
    }
    const likesQ = `SELECT user.username
                    FROM user
                    JOIN like
                    ON user.user_id = like.user_id
                    WHERE like.tweet_id = ?;`
    const likesList = await db.all(likesQ, [tweetId])
    const likeArray = likesList.map(eachArray => eachArray.username)
    response.send({
        likes: likeArray
    })
})

//API-8
app.get('/tweets/:tweetId/replies/', authenticationToken, async (request, response) => {
    const { tweetId } = request.params
    const tweetCheckQ = `SELECT tweet_id FROM tweet
                        WHERE tweet_id = ?
                        AND user_id IN (
                            SELECT following_user_id FROM follower
                        WHERE follower_user_id = (
                            SELECT user_id FROM user
                                WHERE username = ?));`
    const tweetCheck = await db.get(tweetCheckQ, [tweetId, request.username])
    if (tweetCheck === undefined) {
        return response.status(401).send("Invalid Request")
    }
    const repliesQ = `SELECT user.name, reply.reply FROM user
                        JOIN reply 
                        ON user.user_id = reply.user_id
                        WHERE reply.tweet_id = ?;`
    const replies = await db.all(repliesQ, [tweetId])
    response.send({
        replies: replies
    })
})

//API-9 
app.get('/user/tweets/', authenticationToken, async (request, response) => {
    const userTweetQ = `SELECT tweet.tweet, 
                        (SELECT COUNT(*) FROM like WHERE like.tweet_id = tweet.tweet_id) AS likes,
                        (SELECT COUNT(*) FROM reply WHERE reply.tweet_id = tweet.tweet_id) AS replies,
                        tweet.date_time AS dateTime
                        FROM tweet
                            WHERE tweet.user_id IN (
                            SELECT user_id  FROM user 
                                WHERE username = ?
                            );`
    const userTweet = await db.all(userTweetQ, [request.username])
    response.send(userTweet)
})

//API-10 
app.post('/user/tweets/', authenticationToken, async (request, response) => {
    const tweetContent = request.body
    const { tweet } = tweetContent
    const dbUserIdQ = `SELECT user_id FROM user WHERE username = ?;`
    const dbUserId = await db.get(dbUserIdQ, [request.username])
    const createTweetQ = `INSERT INTO tweet (tweet, user_id, date_time) VALUES (?, ?, datetime('now'));`
    await db.run(createTweetQ, [tweet, dbUserId.user_id])
    response.send('Created a Tweet')
})

//API-11
app.delete('/tweets/:tweetId/', authenticationToken, async (request, response) => {
    const { tweetId } = request.params
    const checkTweetQ = `SELECT tweet_id
                            FROM tweet
                            WHERE tweet_id = ?
                            AND user_id = (
                            SELECT user_id
                                FROM user
                                WHERE username = ?
                                );`
    const checkTweet = await db.get(checkTweetQ, [tweetId, request.username])
    if (checkTweet === undefined) {
        return response.status(401).send("Invalid Request")
    }
    const deleteTweetQ = `DELETE FROM tweet WHERE tweet_id = ?`
    await db.run(deleteTweetQ, [tweetId])
    response.send("Tweet Removed")
})

module.exports = app

