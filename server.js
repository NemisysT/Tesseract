const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const { handleAddTask, handleListTasks, handleUpdateTask } = require('./commands');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commands = [
    {
        name: 'addtask',
        description: 'Add a new task to your to-do list',
        options: [
            {
                name: 'task',
                type: 3, // STRING
                description: 'The task description',
                required: true,
            },
            {
                name: 'due_date',
                type: 3, // STRING
                description: 'The due date of the task (e.g., 2024-12-31)',
                required: false,
            },
            {
                name: 'priority',
                type: 3, // STRING
                description: 'The priority of the task (low, medium, high)',
                required: false,
            },
        ],
    },
    {
        name: 'listtasks',
        description: 'List all tasks with optional filters',
        options: [
            {
                name: 'filter',
                type: 3, // STRING
                description: 'Filter tasks (all, pending, completed, overdue, high)',
                required: false,
            },
        ],
    },
    {
        name: 'updatetask',
        description: 'Update the details of an existing task',
        options: [
            {
                name: 'task_id',
                type: 4, // INTEGER
                description: 'The ID of the task to update',
                required: true,
            },
            {
                name: 'new_details',
                type: 3, // STRING
                description: 'The new task description',
                required: false,
            },
            {
                name: 'new_due_date',
                type: 3, // STRING
                description: 'The new due date of the task (e.g., 2024-12-31)',
                required: false,
            },
            {
                name: 'new_priority',
                type: 3, // STRING
                description: 'The new priority of the task (low, medium, high)',
                required: false,
            },
        ],
    },
];

// Register commands
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
(async () => {
    try {
        console.log('Refreshing slash commands...');
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );
        console.log('Slash commands refreshed!');
    } catch (error) {
        console.error(error);
    }
})();

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'addtask') {
        await handleAddTask(interaction);
    } else if (interaction.commandName === 'listtasks') {
        await handleListTasks(interaction);
    } else if (interaction.commandName === 'updatetask') {
        await handleUpdateTask(interaction);
    }
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.login(process.env.DISCORD_TOKEN);
