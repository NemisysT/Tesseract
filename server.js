const { Client, GatewayIntentBits } = require('discord.js');
const { handleListTasks, handleTaskButtonInteraction } = require('./Mbot.js'); // Import functions from Mbot.js
require('dotenv').config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isCommand()) {
        const { commandName } = interaction;

        if (commandName === 'listtasks') {
            await handleListTasks(interaction); // Call the function for /listtasks
        }
    } else if (interaction.isButton()) {
        // Handle button interactions
        await handleTaskButtonInteraction(interaction);
    }
});

client.login(process.env.BOT_TOKEN);
