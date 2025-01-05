const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

const tasksFilePath = path.join(__dirname, 'tasks.json');

// Utility function to read tasks from tasks.json
function getTasks() {
    try {
        if (!fs.existsSync(tasksFilePath)) {
            fs.writeFileSync(tasksFilePath, JSON.stringify([]));
        }
        const rawData = fs.readFileSync(tasksFilePath);
        return JSON.parse(rawData);
    } catch (err) {
        console.error('Error reading tasks file:', err);
        return [];
    }
}

// Utility function to save tasks to tasks.json
function saveTasks(tasks) {
    fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2));
}

// Function to handle /addtask
async function handleAddTask(interaction) {
    const task = interaction.options.getString('task');
    const dueDate = interaction.options.getString('due_date');
    const priority = interaction.options.getString('priority') || 'medium';

    const priorityEmoji = {
        low: '🟢',
        medium: '🟠',
        high: '🔴',
    };

    const tasks = getTasks();
    const newTask = {
        id: tasks.length + 1,
        task: task,
        dueDate: dueDate || 'No due date',
        priority: priority,
        status: 'pending',
    };
    tasks.push(newTask);
    saveTasks(tasks);

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

    await interaction.reply({ embeds: [embed] });
}

// Function to handle /listtasks
async function handleListTasks(interaction) {
    const filter = interaction.options.getString('filter') || 'all';
    const now = new Date();
    const tasks = getTasks();

    const filteredTasks = filter === 'all'
        ? tasks
        : filter === 'overdue'
        ? tasks.filter(task => new Date(task.dueDate) < now && task.status !== 'completed')
        : tasks.filter(task => task.status === filter || task.priority === filter);

    const taskDescriptions = filteredTasks.length
        ? filteredTasks.map(task => `**[${task.id}]** ${task.task} - **${task.status.toUpperCase()}** (${task.priority.toUpperCase()} priority, Due: ${task.dueDate})`).join('\n')
        : 'No tasks found for this filter.';

    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('📋 Task List')
        .setDescription(taskDescriptions)
        .setFooter({ text: `Filter: ${filter.toUpperCase()}` })
        .setTimestamp();

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

    await interaction.reply({ embeds: [embed], components: [row] });
}

// Function to handle /updatetask
async function handleUpdateTask(interaction) {
    const taskId = interaction.options.getInteger('task_id');
    const newDetails = interaction.options.getString('new_details');
    const newDueDate = interaction.options.getString('new_due_date');
    const newPriority = interaction.options.getString('new_priority');

    const tasks = getTasks();
    const taskIndex = tasks.findIndex(task => task.id === taskId);

    if (taskIndex === -1) {
        await interaction.reply({ content: `❌ Task with ID \`${taskId}\` not found.`, ephemeral: true });
        return;
    }

    // Update task details
    if (newDetails) tasks[taskIndex].task = newDetails;
    if (newDueDate) tasks[taskIndex].dueDate = newDueDate;
    if (newPriority) tasks[taskIndex].priority = newPriority;

    saveTasks(tasks);

    const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Task Updated Successfully!')
        .addFields(
            { name: '📌 Updated Task', value: `\`${tasks[taskIndex].task}\``, inline: false },
            { name: '📅 Due Date', value: newDueDate || tasks[taskIndex].dueDate, inline: true },
            { name: '⚡ Priority', value: newPriority ? `\`${newPriority.toUpperCase()}\`` : tasks[taskIndex].priority.toUpperCase(), inline: true }
        )
        .setFooter({ text: `Task ID: ${taskId}` })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}
//Update the task and test the git pushings
module.exports = { handleAddTask, handleListTasks, handleUpdateTask };
