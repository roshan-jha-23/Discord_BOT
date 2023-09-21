const { Client, Collection, GatewayIntentBits, Events } = require("discord.js");
const { createProdia } = require("prodia");
const { join: joinPath } = require("path");
const { readdirSync } = require("fs");

if (!process.env.DISCORD_TOKEN) throw new Error("DISCORD_CLIENT_ID required");
if (!process.env.PRODIA_API_KEY) throw new Error("PRODIA_API_KEY required");

// create Discord client
const client = new Client({ intents: [
	GatewayIntentBits.Guilds,
] });

// create Prodia object
const prodia = createProdia({
  apiKey: process.env.PRODIA_API_KEY
});

const commands = new Collection();

client.once(Events.ClientReady, async (c) => {
  console.log(`Discord client ready as ${c.user.tag}`);

  // cache the commands so that they can be executed when an interaction is received
  const commandFiles = readdirSync((joinPath(__dirname), "commands"));

  for (const file of commandFiles) {
    const { execute, autocomplete, data } = require(`./commands/${file}`);
    commands.set(data.name, { execute, autocomplete, data });
  }

  console.log(`Cached ${commands.size} commands`);

  // check if Discord slash commands should be updated
  if (process.env.DISCORD_UPDATE_COMMANDS === "1") {
    console.log("DISCORD_UPDATE_COMMANDS is set to 1. Updating Discord commands...");
    await require("./registerCommands.js")(client);
    console.log("Successfully updated Discord commands");
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isChatInputCommand()) {
    // find command from the cache
    const command = commands.get(interaction.commandName);
    
    if (!command) return await interaction.reply({
      content: "That command cannot be found.",
      ephemeral: true,
    });
  
    try {
      // execute the command, if it exists
      await command.execute(prodia, interaction);
    } catch (error) {
      console.error(error);
    }
  } else if (interaction.isAutocomplete()) {
    // find command from the cache
    const command = commands.get(interaction.commandName);

    if (!command)
      return console.error(`Command ${interaction.commandName} cannot be found`);

    if (!command.autocomplete)
      return console.error(`Command ${interaction.commandName} does not have autocomplete`);
    
    try {
      // execute the command's autocomplete function, if it exists
      await command.autocomplete(prodia, interaction);
    } catch (error) {
      console.error(error);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);