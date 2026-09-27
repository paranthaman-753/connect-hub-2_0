# 📚 API Documentation — Twitter Clone REST API

Detailed documentation for all 11 API endpoints implemented in this project.

> **Base URL:** `http://localhost:3000`

---

## Table of Contents

1. [Register User](#1-register-user)
2. [Login User](#2-login-user)
3. [Get User Tweet Feed](#3-get-user-tweet-feed)
4. [Get Following List](#4-get-following-list)
5. [Get Followers List](#5-get-followers-list)
6. [Get Tweet by ID](#6-get-tweet-by-id)
7. [Get Tweet Likes](#7-get-tweet-likes)
8. [Get Tweet Replies](#8-get-tweet-replies)
9. [Get User's Tweets](#9-get-users-tweets)
10. [Create a Tweet](#10-create-a-tweet)
11. [Delete a Tweet](#11-delete-a-tweet)

---

## Authentication Overview

All endpoints except **Register** and **Login** require a valid JWT Bearer token in the `Authorization` header.

### How to Authenticate

1. Call `POST /login/` with valid credentials.
2. Copy the `jwtToken` from the response.
3. Include it in subsequent requests:

```http
Authorization: Bearer <your_jwt_token>
```

### Authentication Errors

If the JWT token is missing or invalid, all protected endpoints return:

- **Status Code:** `401`
- **Response Body:**

```
Invalid JWT Token
```

---

## 1. Register User

**Method:** `POST`

**Endpoint:** `/register/`

**Authentication:** Not Required

**Description:**

Registers a new user. The password is hashed using bcrypt (salt rounds: 10) before being stored in the database. The endpoint validates that:
- The username does not already exist in the database
- The password is at least 6 characters long

### Request Headers

```http
Content-Type: application/json
```

### Request Body

```json
{
  "username": "adam_richard",
  "password": "richard_567",
  "name": "Adam Richard",
  "gender": "male"
}
```

| Field    | Type   | Required | Description                      |
| -------- | ------ | -------- | -------------------------------- |
| username | string | Yes      | Unique username for the account  |
| password | string | Yes      | Password (minimum 6 characters)  |
| name     | string | Yes      | Display name of the user         |
| gender   | string | Yes      | Gender of the user               |

### Success Response

- **Status Code:** `200`
- **Response Body:**

```
User created successfully
```

### Error Responses

| Status Code | Condition                     | Response Body            |
| ----------- | ----------------------------- | ------------------------ |
| 400         | Username already exists        | `User already exists`    |
| 400         | Password shorter than 6 chars  | `Password is too short`  |

### Example

**Request:**

```bash
curl -X POST http://localhost:3000/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "adam_richard",
    "password": "richard_567",
    "name": "Adam Richard",
    "gender": "male"
  }'
```

**Response (Success):**

```
User created successfully
```

**Response (Duplicate Username):**

```
User already exists
```

---

## 2. Login User

**Method:** `POST`

**Endpoint:** `/login/`

**Authentication:** Not Required

**Description:**

Authenticates a user by comparing the provided password against the bcrypt-hashed password stored in the database. On successful authentication, a JWT token is generated with the payload `{ username }` and returned to the client.

### Request Headers

```http
Content-Type: application/json
```

### Request Body

```json
{
  "username": "JoeBiden",
  "password": "biden@123"
}
```

| Field    | Type   | Required | Description               |
| -------- | ------ | -------- | ------------------------- |
| username | string | Yes      | Registered username       |
| password | string | Yes      | Password for the account  |

### Success Response

- **Status Code:** `200`
- **Response Body:**

```json
{
  "jwtToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

| Field    | Type   | Description                              |
| -------- | ------ | ---------------------------------------- |
| jwtToken | string | JWT token for authenticating future requests |

### Error Responses

| Status Code | Condition                      | Response Body       |
| ----------- | ------------------------------ | ------------------- |
| 400         | Username does not exist         | `Invalid user`      |
| 400         | Password does not match         | `Invalid password`  |

### Example

**Request:**

```bash
curl -X POST http://localhost:3000/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "JoeBiden",
    "password": "biden@123"
  }'
```

**Response (Success):**

```json
{
  "jwtToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkpvZUJpZGVuIiwiaWF0IjoxNjE..."
}
```

---

## 3. Get User Tweet Feed

**Method:** `GET`

**Endpoint:** `/user/tweets/feed/`

**Authentication:** Required

**Description:**

Returns the latest **4 tweets** from users that the authenticated user follows, ordered by `date_time` in descending order (newest first).

### Request Headers

```http
Authorization: Bearer <JWT_TOKEN>
```

### Success Response

- **Status Code:** `200`
- **Response Body:**

```json
[
  {
    "username": "SrBachchan",
    "tweet": "T 3859 - do something wonderful, people may imitate it ..",
    "dateTime": "2021-04-07 14:50:19"
  },
  {
    "username": "naaborumoodi",
    "tweet": "India has immense potential for renewable energy...",
    "dateTime": "2021-04-06 12:30:00"
  }
]
```

| Field    | Type   | Description                       |
| -------- | ------ | --------------------------------- |
| username | string | Username of the tweet author      |
| tweet    | string | Content of the tweet              |
| dateTime | string | Timestamp of the tweet creation   |

> **Note:** Returns an empty array `[]` if the user does not follow anyone or if followed users have no tweets.

### Example

**Request:**

```bash
curl http://localhost:3000/user/tweets/feed/ \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

---

## 4. Get Following List

**Method:** `GET`

**Endpoint:** `/user/following/`

**Authentication:** Required

**Description:**

Returns the list of distinct names of users that the authenticated user follows.

### Request Headers

```http
Authorization: Bearer <JWT_TOKEN>
```

### Success Response

- **Status Code:** `200`
- **Response Body:**

```json
[
  {
    "name": "Narendra Modi"
  },
  {
    "name": "Amitabh Bachchan"
  }
]
```

| Field | Type   | Description                      |
| ----- | ------ | -------------------------------- |
| name  | string | Display name of the followed user |

> **Note:** Returns an empty array `[]` if the user does not follow anyone.

### Example

**Request:**

```bash
curl http://localhost:3000/user/following/ \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

---

## 5. Get Followers List

**Method:** `GET`

**Endpoint:** `/user/followers/`

**Authentication:** Required

**Description:**

Returns the list of distinct names of users who follow the authenticated user.

### Request Headers

```http
Authorization: Bearer <JWT_TOKEN>
```

### Success Response

- **Status Code:** `200`
- **Response Body:**

```json
[
  {
    "name": "Narendra Modi"
  },
  {
    "name": "Albert Einstein"
  }
]
```

| Field | Type   | Description                     |
| ----- | ------ | ------------------------------- |
| name  | string | Display name of the follower    |

> **Note:** Returns an empty array `[]` if no one follows the user.

### Example

**Request:**

```bash
curl http://localhost:3000/user/followers/ \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

---

## 6. Get Tweet by ID

**Method:** `GET`

**Endpoint:** `/tweets/:tweetId/`

**Authentication:** Required

**Description:**

Returns a specific tweet along with its like count and reply count. The tweet must belong to a user that the authenticated user follows. If the tweet does not belong to a followed user (or does not exist), the request is rejected.

### Request Headers

```http
Authorization: Bearer <JWT_TOKEN>
```

### Request Parameters

| Parameter | Type    | Location | Description              |
| --------- | ------- | -------- | ------------------------ |
| tweetId   | integer | path     | The ID of the tweet      |

### Success Response

- **Status Code:** `200`
- **Response Body:**

```json
{
  "tweet": "T 3859 - do something wonderful, people may imitate it ..",
  "likes": 3,
  "replies": 1,
  "dateTime": "2021-04-07 14:50:19"
}
```

| Field    | Type    | Description                    |
| -------- | ------- | ------------------------------ |
| tweet    | string  | Content of the tweet           |
| likes    | integer | Total number of likes          |
| replies  | integer | Total number of replies        |
| dateTime | string  | Timestamp of tweet creation    |

### Error Responses

| Status Code | Condition                                                 | Response Body      |
| ----------- | --------------------------------------------------------- | ------------------ |
| 401         | Tweet does not belong to a user the authenticated user follows, or tweet does not exist | `Invalid Request`  |

### Example

**Request:**

```bash
curl http://localhost:3000/tweets/1/ \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Response (Success):**

```json
{
  "tweet": "T 3859 - do something wonderful, people may imitate it ..",
  "likes": 3,
  "replies": 1,
  "dateTime": "2021-04-07 14:50:19"
}
```

**Response (Not a followed user's tweet):**

```
Invalid Request
```

---

## 7. Get Tweet Likes

**Method:** `GET`

**Endpoint:** `/tweets/:tweetId/likes/`

**Authentication:** Required

**Description:**

Returns the list of usernames of users who liked a specific tweet. The tweet must belong to a user that the authenticated user follows.

### Request Headers

```http
Authorization: Bearer <JWT_TOKEN>
```

### Request Parameters

| Parameter | Type    | Location | Description              |
| --------- | ------- | -------- | ------------------------ |
| tweetId   | integer | path     | The ID of the tweet      |

### Success Response

- **Status Code:** `200`
- **Response Body:**

```json
{
  "likes": ["albert", "johndoe", "janedoe"]
}
```

| Field | Type     | Description                                |
| ----- | -------- | ------------------------------------------ |
| likes | string[] | Array of usernames who liked the tweet     |

> **Note:** If the tweet has no likes but belongs to a followed user, the response will be `{ "likes": [] }`.

### Error Responses

| Status Code | Condition                                                 | Response Body      |
| ----------- | --------------------------------------------------------- | ------------------ |
| 401         | Tweet does not belong to a user the authenticated user follows, or tweet does not exist | `Invalid Request`  |

### Example

**Request:**

```bash
curl http://localhost:3000/tweets/1/likes/ \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Response (Success):**

```json
{
  "likes": ["albert"]
}
```

---

## 8. Get Tweet Replies

**Method:** `GET`

**Endpoint:** `/tweets/:tweetId/replies/`

**Authentication:** Required

**Description:**

Returns the list of replies on a specific tweet, including the replier's name and the reply content. The tweet must belong to a user that the authenticated user follows.

### Request Headers

```http
Authorization: Bearer <JWT_TOKEN>
```

### Request Parameters

| Parameter | Type    | Location | Description              |
| --------- | ------- | -------- | ------------------------ |
| tweetId   | integer | path     | The ID of the tweet      |

### Success Response

- **Status Code:** `200`
- **Response Body:**

```json
{
  "replies": [
    {
      "name": "Narendra Modi",
      "reply": "When you see it.."
    },
    {
      "name": "Albert Einstein",
      "reply": "Brilliant thought!"
    }
  ]
}
```

| Field          | Type   | Description                     |
| -------------- | ------ | ------------------------------- |
| replies        | array  | Array of reply objects          |
| replies[].name | string | Display name of the replier     |
| replies[].reply| string | Content of the reply            |

### Error Responses

| Status Code | Condition                                                 | Response Body      |
| ----------- | --------------------------------------------------------- | ------------------ |
| 401         | Tweet does not belong to a user the authenticated user follows | `Invalid Request`  |

### Example

**Request:**

```bash
curl http://localhost:3000/tweets/1/replies/ \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Response (Success):**

```json
{
  "replies": [
    {
      "name": "Narendra Modi",
      "reply": "When you see it.."
    }
  ]
}
```

---

## 9. Get User's Tweets

**Method:** `GET`

**Endpoint:** `/user/tweets/`

**Authentication:** Required

**Description:**

Returns all tweets posted by the authenticated user, along with the like count and reply count for each tweet.

### Request Headers

```http
Authorization: Bearer <JWT_TOKEN>
```

### Success Response

- **Status Code:** `200`
- **Response Body:**

```json
[
  {
    "tweet": "Ready to don the Blue and Gold",
    "likes": 3,
    "replies": 4,
    "dateTime": "2021-04-03 08:32:44"
  },
  {
    "tweet": "The Mornings...",
    "likes": 1,
    "replies": 0,
    "dateTime": "2021-04-05 10:15:30"
  }
]
```

| Field    | Type    | Description                    |
| -------- | ------- | ------------------------------ |
| tweet    | string  | Content of the tweet           |
| likes    | integer | Total number of likes          |
| replies  | integer | Total number of replies        |
| dateTime | string  | Timestamp of tweet creation    |

> **Note:** Returns an empty array `[]` if the user has no tweets.

### Example

**Request:**

```bash
curl http://localhost:3000/user/tweets/ \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

---

## 10. Create a Tweet

**Method:** `POST`

**Endpoint:** `/user/tweets/`

**Authentication:** Required

**Description:**

Creates a new tweet for the authenticated user. The server looks up the user's `user_id` from the `user` table using `request.username` and inserts the tweet into the `tweet` table.

### Request Headers

```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Request Body

```json
{
  "tweet": "The Mornings..."
}
```

| Field | Type   | Required | Description               |
| ----- | ------ | -------- | ------------------------- |
| tweet | string | Yes      | Content of the new tweet  |

### Success Response

- **Status Code:** `200`
- **Response Body:**

```
Created a Tweet
```

> **Note:** The `date_time` is automatically set to the current UTC timestamp using SQLite's `datetime('now')` function.

### Example

**Request:**

```bash
curl -X POST http://localhost:3000/user/tweets/ \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "tweet": "Hello Twitter Clone!"
  }'
```

**Response:**

```
Created a Tweet
```

---

## 11. Delete a Tweet

**Method:** `DELETE`

**Endpoint:** `/tweets/:tweetId/`

**Authentication:** Required

**Description:**

Deletes a tweet by its ID. The authenticated user can only delete their own tweets. The endpoint first verifies that the tweet belongs to the authenticated user by checking the `user_id` in the `tweet` table against the logged-in user's `user_id`.

### Request Headers

```http
Authorization: Bearer <JWT_TOKEN>
```

### Request Parameters

| Parameter | Type    | Location | Description              |
| --------- | ------- | -------- | ------------------------ |
| tweetId   | integer | path     | The ID of the tweet to delete |

### Success Response

- **Status Code:** `200`
- **Response Body:**

```
Tweet Removed
```

### Error Responses

| Status Code | Condition                                          | Response Body      |
| ----------- | -------------------------------------------------- | ------------------ |
| 401         | Tweet does not belong to the authenticated user, or tweet does not exist | `Invalid Request`  |

### Example

**Request:**

```bash
curl -X DELETE http://localhost:3000/tweets/5/ \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Response (Success):**

```
Tweet Removed
```

**Response (Not the owner):**

```
Invalid Request
```

---

## Error Response Summary

| Status Code | Message              | When                                                        |
| ----------- | -------------------- | ----------------------------------------------------------- |
| 400         | `User already exists`  | Registration with an existing username                     |
| 400         | `Password is too short`| Registration with a password shorter than 6 characters     |
| 400         | `Invalid user`         | Login with a non-existent username                         |
| 400         | `Invalid password`     | Login with an incorrect password                           |
| 401         | `Invalid JWT Token`    | Missing or invalid JWT in the Authorization header         |
| 401         | `Invalid Request`      | Accessing a tweet not belonging to a followed user, or attempting to delete another user's tweet |
