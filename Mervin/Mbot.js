const { EmbedBuilder } = require('discord.js');

// Function to handle /addtask
async function handleAddTask(interaction) {
    const task = interaction.options.getString('task');
    const dueDate = interaction.options.getString('due_date');
    const priority = interaction.options.getString('priority') || 'medium';

    // Priority emoji mapping
    const priorityEmoji = {
        low: '🟢',
        medium: '🟠',
        high: '🔴',
    };

    // Create embed
    const embed = new EmbedBuilder()
        .setColor(priority === 'high' ? '#FF0000' : priority === 'medium' ? '#FFA500' : '#00FF00')
        .setTitle('📝 New Task Added!')
        .addFields(
            { name: '📌 Task', value: `\`${task}\``, inline: false },
            { name: '📅 Due Date', value: dueDate ? `\`${dueDate}\`` : '`No due date provided`', inline: true },
            { name: '⚡ Priority', value: `${priorityEmoji[priority]} \`${priority.charAt(0).toUpperCase() + priority.slice(1)}\``, inline: true }
        )
        .setFooter({ text: 'Task successfully added to your to-do list!' })
        .setTimestamp();

    // Send embed as a reply
    await interaction.reply({ embeds: [embed] });

    // Store the task in your database or array (implement your logic here)
}

module.exports = { handleAddTask };


const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

const tasksFilePath = path.join(__dirname, 'tasks.json');

// Utility function to read tasks from tasks.json
function getTasks() {
    if (!fs.existsSync(tasksFilePath)) {
        fs.writeFileSync(tasksFilePath, JSON.stringify([]));
    }
    const rawData = fs.readFileSync(tasksFilePath);
    return JSON.parse(rawData);
}

// Utility function to save tasks to tasks.json
function saveTasks(tasks) {
    fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2));
}

// Function to handle /listtasks command
async function handleListTasks(interaction) {
    const filter = interaction.options.getString('filter') || 'all';

    // Load tasks from the JSON file
    const tasks = getTasks();

    // Filter tasks based on the selected filter
    const filteredTasks = filter === 'all' ? tasks : tasks.filter(task => task.status === filter || task.priority === filter);

    // Format tasks for display
    const taskDescriptions = filteredTasks.map(task => 
        `**[${task.id}]** ${task.task} - **${task.status.toUpperCase()}** (${task.priority.toUpperCase()} priority, Due: ${task.dueDate})`
    ).join('\n') || 'No tasks found for this filter.';

    // Create embed
    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('📋 Task List')
        .setDescription(taskDescriptions)
        .setFooter({ text: `Filter: ${filter.toUpperCase()}` })
        .setTimestamp();

    // Create buttons for interactive filtering
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('filter_all')
                .setLabel('All')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('filter_pending')
                .setLabel('Pending')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('filter_completed')
                .setLabel('Completed')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('filter_overdue')
                .setLabel('Overdue')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('filter_priority_high')
                .setLabel('High Priority')
                .setStyle(ButtonStyle.Danger)
        );

    // Send the embed with buttons
    await interaction.reply({ embeds: [embed], components: [row] });
}

// Function to handle button interactions
async function handleTaskButtonInteraction(interaction) {
    const customId = interaction.customId;

    // Load tasks from the JSON file
    const tasks = getTasks();

    // Determine the filter based on the button clicked
    let filter = 'all';
    if (customId.startsWith('filter_')) {
        filter = customId.replace('filter_', '');
    }

    // Reapply the filter and respond with an updated embed
    const filteredTasks = filter === 'all' ? tasks : tasks.filter(task => task.status === filter || task.priority === filter);
    const taskDescriptions = filteredTasks.map(task => 
        `**[${task.id}]** ${task.task} - **${task.status.toUpperCase()}** (${task.priority.toUpperCase()} priority, Due: ${task.dueDate})`
    ).join('\n') || 'No tasks found for this filter.';

    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('📋 Task List')
        .setDescription(taskDescriptions)
        .setFooter({ text: `Filter: ${filter.toUpperCase()}` })
        .setTimestamp();

    await interaction.update({ embeds: [embed], components: interaction.message.components }); // Update the original message
}

module.exports = { handleListTasks, handleTaskButtonInteraction };
