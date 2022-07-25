# SCUM game discord killfeed grab


![alt get this in config.json: chat_id to source_channel, auth-token to authorization and cookie](https://github.com/artskar/scum-killfeed/blob/main/data4bot.png)
1) Take a look on a picture and get the same way data and nicknames to [config.json](https://github.com/artskar/scum-killfeed/blob/main/config.json):
```
{
    ...
    source_channel: chat_id,
    authorization: auth-token,
    cookie: cookie,
    names: ["name1", "name2"]
}
```
2) You also have to find out how to make a bot with discord API. and get a token for the "**token**" field in [config.json](https://github.com/artskar/scum-killfeed/blob/main/config.json)
and get your own channel id to place it in "**target_channel**".

    [RU | Посмотреть как создать и добавить бота на сервер и узнать id канала](https://vc.ru/services/288966-bot-discord-kak-sozdat-i-dobavit-na-server)

    [EN | How to Create a Bot in Discord (1-3 step)](https://www.wikihow.com/Create-a-Bot-in-Discord)


```
{
    token: bot_token,
    target_channel: channel_id,
    ...
}
```

3) You can use **bot-hosting.net** to run this bot almost for free. 
