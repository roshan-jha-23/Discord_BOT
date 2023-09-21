# AI Discord Bot

This is a bot that allows users to generate Stable Diffusion images using [Prodia](https://prodia.com/) from a Discord bot. Users can also put their AI image generation skills to the test by playing a fun generation game.

## Technologies

- [Node.js v18.12.1](https://nodejs.org/en/about)
- [discord.js v14.13.0](https://discord.js.org/)
- [prodia v0.1.1](https://www.npmjs.com/package/prodia)
- [canvas v2.11.2](https://www.npmjs.com/package/canvas)

*(The Prodia site linked is for the npm package used. To learn more about Prodia itself, check out [this page](https://prodia.com/).)*

## Configuration

In order for the bot to work properly, there are a few steps necessary to configure it.

### Forking the Repl

Before setting up the bot, make sure you fork the Repl so that you can make changes.

To fork the Repl:

1. Click the Repl name in the top left from within the editor.
2. A dropdown should open. Click the three dots located in the top right of that dropdown menu.
3. Click "Fork."
4. Change the information as needed and then click "Fork Repl."

You should now be redirected to a Repl located on your own Replit account. Now it's time to configure the bot.

### Creating Secrets

1. First, [create a Discord application](https://discord.com/developers/applications) and create a bot user. If you've never done this before, [this article](https://discordjs.guide/preparations/setting-up-a-bot-application.html) outlines how to do so.
3. Generate a token for your Discord bot and [paste it into a Secret within your Repl](https://docs.replit.com/programming-ide/workspace-features/secrets). The Secret's key should be `DISCORD_TOKEN`.
4. Retrieve the Application ID from the Discord Developer Portal. The ID is located in the "General Information" tab of your application. Paste the Application ID into a Secret with a key of `DISCORD_APPLICATION_ID`.
5. [Find your Prodia API key](https://docs.prodia.com/reference/getting-started-guide) and paste it into a Secret with a key of `PRODIA_API_KEY`.

### Testing the Bot

Now let's test the bot to make sure it works. Before you click Run, however, you'll have to update the slash commands so that they show up within Discord. To do this, create a Secret with a key of `DISCORD_UPDATE_COMMANDS` and a value of `1`. This means that `registerCommands.js` will also run when you click the Run button. This script will then send the list of slash commands to Discord so that the commands can be used.

Now you can try clicking Run! **Once you do, and it logs "Successfully updated 2 application commands globally," remove the `DISCORD_UPDATE_COMMANDS` Secret** (or set its value to `0`). This is to avoid sending the list of slash commands to Discord every time you run it--this might result in being ratelimited.

Now you can add your bot to a server to test it out. [This guide](https://discordjs.guide/preparations/adding-your-bot-to-servers.html) details how to generate an invite link from within your application in the Discord Developer Portal. After you select the scopes, as the guide describes, you can select the permissions that your bot asks for. It's likely that the bot will work without any special permissions (@everyone probably already has enough permissions), but you can optionally add the "Send Messages," "Read Message History," "Embed Links," "Attach Files," and "Read Messages/View Channels" permissions just in case the @everyone role doesn't already have these enabled. When you add it to a server, your bot should be online and you should see the `/generate` and `/startgame` commands in the slash command menu. Once it's online, try testing out some of the commands to see how the bot works!

If your bot isn't online, make sure that the Repl is running (if it's running, it will say "Stop" at the top). Make sure that it also says "Discord client ready" in the terminal. If it doesn't, check for errors and make sure you have added all the necessary Secrets.

## Existing Features

The bot already contains a couple of features to help get you started with integrating Prodia and Discord together.

### Generate Command

The generate command is used to generate AI images from text using [Prodia's API](https://docs.prodia.com/reference/generate). If a game is currently running (using `/startgame`, as outlined below), the generate command will also display buttons that allow you to submit your image to be voted on by others.

### Generation Game

This bot also includes a game where users can generate images under a given topic and select their favorite image. Then, users can vote on which image is the best, and the bot will announce the winner. The game can be started with `/startgame` and images can be generated and submitted using `/generate`.

Each game lets users generate and submit images for 5 minutes before voting. Users can generate any amount of images, but only 1 can be submitted per user. However, if 10 images are submitted before the 5 minute period is over, the submission period will immediately end and the voting will start regardless of the time left on the 5 minute timer. (This 10 submission limit is because no more than 10 attachments can be added to a single Discord message. Additionally, it would probably be difficult for users to choose between lots of images when voting.) Each voting period then lasts for 1 minute before a winner is announced. A warning also gets sent 1 minute before each game ends so that users know time's almost up and they should submit their image generations to be included in the voting.

The `gameTopics.json` file contains a list of 100 topics used for the game. The list can also be extended or modified with your own interesting topics for the game!

In addition to the predefined list of topics, users can choose their own topic when using the `/startgame` command within Discord.

#### Generating Topics

You may find it beneficial to use ChatGPT to assist in generating topics, since it is capable of generating large handfuls of topics very quickly. In fact, [gpt-3.5-turbo](https://platform.openai.com/playground?model=gpt-3.5-turbo) was used to generate the 100 topics already listed.

To aid in your topic generations, below is the simple prompt used to generate the 100 existing topics. You may be able to achieve better tailored results with a little bit of prompt engineering. Feel free to play around with it!

> Give me a list of 100 themes to use for image generation games. Keep each one unique and original.

Alternatively, feel free to get creative and come up with some new and interesting themes yourself! It may even be a beneficial and fun activity to have a community of Discord users brainstorm topics together! It's as simple as adding the topics to the array found in `gameTopics.json`.

### Involved Files

Since multiple files are involved with handling various aspects of the game, here's a quick overview:
- `commands/startGame.js` - Handles starting the game via the `/startgame` command, voting, etc. Handles most of the user's interactions, which is then sent to the gameManager.
- `gameManager.js` - A variety of functions used to keep track of the state of the games. This makes it easy for multiple files to check whether games are running in a given channel, which images have been submitted, etc.
- `gameTopics.json` - A list of 100 preset topics to be randomly picked from for each game.
- `modifyImage.js` - Manages manipulating the images before sending them to be voted on. It resizes them so that their width and height are no more than 500px (to avoid reaching the Discord attachment file size limit) and adds number labels to each image so that they can be identified by the voters. This function is built on top of the [node-canvas](https://github.com/Automattic/node-canvas) library. (`commands/startGame.js` is the only file that makes use of the modifyImage function. The modifyImage function is in a separate file purely for modularity and readability.)

*Other files, e.g. `commands/generate.js` and `index.js`, do of course play a role in this game, but it is not their primary purpose and as such they are not listed here.*

## Extending the Bot

Now that you know the bot's features, I want to detail how the code is structured so that you can extend it yourself. This bot comes with a command handler so that you can easily extend the bot to add new and inspiring features!

To create a new command, it's as simple as creating a new .js file within the `commands` directory. I recommend using the `commands/ping.js` file as a template. The exported `execute` function is called whenever someone uses the command. The [Prodia object](https://www.npmjs.com/package/prodia#api) is passed as the first argument and the [ChatInputCommandInteraction](https://old.discordjs.dev/#/docs/discord.js/main/class/ChatInputCommandInteraction) is passed as the second argument. Optionally, you can export an `autocomplete` function which will be called whenever an autocomplete interaction is received. For this function, the [Prodia object](https://www.npmjs.com/package/prodia#api) is passed as the first argument and the [AutocompleteInteraction](https://old.discordjs.dev/#/docs/discord.js/main/class/AutocompleteInteraction) is passed as the second argument. As an example, this is utilized for the `model` parameter of the `/generate` command, which requests the list of models from Prodia's API rather than using a hardcoded list. You can learn more about using autocomplete with discord.js [here](https://discordjs.guide/slash-commands/autocomplete.html). The `data` export is used to tell Discord information about the command so that it can be displayed to the user (documentation on the SlashCommandBuilder class can be found [here](https://old.discordjs.dev/#/docs/builders/main/class/SlashCommandBuilder)). Lastly, `testGuildOnly` is an exported boolean that determines whether this command will only be added to a test Discord server (`true`) or if the command will be added to all of the servers that the bot is in (`false`). If you're still developing the command, I recommend setting this to `true` so that you can test it in an isolated server without interfering with other servers. However, if it's intended to be a public command, you can just delete the line that exports the variable (or set it to `false`).

To configure the test guild (aka server), simply create a Secret with a key of `DISCORD_TEST_GUILD_ID` and a value containing the [Discord server ID](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-).

The Client object, listeners, etc. are all managed within `index.js`. New intents, event listeners, and similar changes can be added there. I recommend treating this file as an "under-the-hood" file by "delegating" (if you will) all the important work to other files. Keeping everything modularized may prove helpful in the long run.

I have already detailed this earlier, but remember that you must set the `DISCORD_UPDATE_COMMANDS` Secret to `1` whenever you want to update the slash commands within Discord. Clicking "Run" will then update the commands (it should confirm this in the terminal), at which point you should set the variable to `0` again to avoid ratelimits.

Here are some additional resources that you may find helpful when extending the bot:
- [Prodia documentation](https://docs.prodia.com/reference/getting-started)
- [Official Prodia NPM package](https://www.npmjs.com/package/prodia)
- [discord.js documentation](https://old.discordjs.dev/#/docs/discord.js/main/general/welcome)
- [discord.js Guide](https://discordjs.guide/)

## Hosting

This bot could be hosted anywhere where you can run a Node.js app 24/7. However, this could require manually installing packages, more complex setup, etc., whereas I feel that it should be easy to extend and deploy this bot.

With that in mind, this project was designed with the intention of being able to easily host it on Replit. As such, you can easily make the bot run 24/7 by using a Reserved VM via Replit Deployments. The 0.25 vCPU / 1 GiB RAM option should work fine for this bot. You can learn more about setting up Replit Deployments via the [Replit Docs](https://docs.replit.com/hosting/deployments/deploying-your-repl).