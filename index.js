// 1. CLIENT SETUP
const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// bruh
client.login(process.env.MTQ4MTEyMzkyODQxMDk0NzczOA.GngoBg.pYY8eKFYZpRlXtcRh8Abu6hE1zQ5ELyt8UZ2Cw);

// 2. COLOR SYSTEM
const userColors = new Map();
const colorList = [
    "green", "blue", "yellow", "purple", "orange",
    "pink", "cyan", "red", "lime", "teal",
    "magenta", "gold", "silver", "brown"
];

// 3. TICKET NUMBERING + LOG STORAGE
// channelId -> internal ticket number (50, 51, 52, ...)
const ticketNumbers = new Map();
// ticketNumber -> history message
const ticketLogs = new Map();

// start counting at 50
let nextTicketNumber = 50;

// 4. MESSAGE LISTENER
client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    // ID of your ticket-history channel
    const historyChannelId = "1478921702741381202";

    // ignore messages inside ticket-history itself
    if (message.channel.id === historyChannelId) return;

    // only track ticket or closed ticket channels
    const name = message.channel.name;
    const isOpenTicket = name.startsWith("ticket-");
    const isClosedTicket = name.startsWith("closed-");
    if (!isOpenTicket && !isClosedTicket) return;

    // assign internal ticket number if this channel is new
    if (!ticketNumbers.has(message.channel.id)) {
        ticketNumbers.set(message.channel.id, nextTicketNumber++);
    }
    const ticketNumber = ticketNumbers.get(message.channel.id);

    // username + color
    const username = message.author.username;
    if (!userColors.has(username)) {
        const index = userColors.size % colorList.length;
        userColors.set(username, colorList[index]);
    }
    const userColor = userColors.get(username);

    // build log line
    let logLine = `[${userColor}] [${username}]: "${message.content}"`;

    if (message.attachments.size > 0) {
        message.attachments.forEach(att => {
            logLine = `[${userColor}] [${username}]: sent an image\n${att.url}`;
        });
    }

    // find history channel
    const historyChannel = message.guild.channels.cache.get(historyChannelId);
    if (!historyChannel) return;

    // if log exists, update it
    if (ticketLogs.has(ticketNumber)) {
        const msg = ticketLogs.get(ticketNumber);

        // remove CSS wrapper
        const oldContent = msg.content
            .replace("```css", "")
            .replace("```", "")
            .trim();

        // split into lines, first line is "Ticket-XX"
        const lines = oldContent.split("\n");
        const header = lines[0] || `Ticket-${ticketNumber}`;
        const body = lines.slice(1).join("\n").trim();

        const updatedBody = body ? `${body}\n${logLine}` : logLine;

        msg.edit(
            `\`\`\`css
${header}

${updatedBody}
\`\`\``
        );
    } else {
        // create new log message
        const sent = await historyChannel.send(
            `\`\`\`css
Ticket-${ticketNumber}

${logLine}
\`\`\``
        );
        ticketLogs.set(ticketNumber, sent);
    }
});
