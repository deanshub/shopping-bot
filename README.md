# Shopping Telegram Bot

## Features

- [x] Add items to shopping list
- [x] Remove items from shopping list
- [x] List shopping list
- [x] Clear shopping list
- [x] Schedule list to be sent

## Local setup

create `.env` file (you can also copy from .env.example)

```
BOT_TOKEN=...
SHOPPING_LISTS_DIR=where the shopping lists are stored
```

To install dependencies:

```bash
bun install
```

To run:

```bash
bun start
```

## Prebuilt docker image

[The docker images are hosted on GitHub packages](https://github.com/deanshub/shopping-bot/pkgs/container/shopping-bot). You can use them by pulling the image:

```bash
docker pull ghcr.io/deanshub/gpt-bot:main
```

## Docker compose example

```
version: '3'
services:
    shopping-bot:
        image: ghcr.io/deanshub/shopping-bot:main
        restart: unless-stopped
        environment:
            BOT_TOKEN: 'TOKEN_HERE'
            SHOPPING_LISTS_DIR: '/path/to/shopping/lists'
        volumes:
            - '/path/to/shopping/lists:/shopping-lists'
```
