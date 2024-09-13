import { Api, Bot, Context, type RawApi } from "grammy";
import { getOrThrow } from "./utils";
import { getFullName } from "./getFullName";
import { addItemsToShoppingList, clearList, ensureShoppingListDir, getAllShoppingLists, getItemsFromText, getShoppingList, loadShoppingLists } from "./shoppingList";
import cron from "node-cron"

let bot: Bot<Context, Api<RawApi>> 

const slientOption = {
    disable_notification: true
}

export function getBot(){
    if (!bot) {
        bot = new Bot(getOrThrow("BOT_TOKEN")); 
        void setupBot(bot)
    }
    return bot
}

async function setupBot(bot: Bot<Context, Api<RawApi>>){
    void ensureShoppingListDir()
    await loadShoppingLists()
    bot.command("start", async (ctx) => {
        await ctx.reply(`Hello ${
            getFullName(ctx)
        }👋
I am your shopping helper 🧝‍♀️
I'm here to help you manage your shopping list
So what items would you like to include in your shopping list?`,{parse_mode: 'HTML'})
    })

    bot.command("help", async (ctx) => {
        await ctx.reply("Here's how you can use me:\n\n" +
        "/start - Start the bot\n" +
        "/list - Get your shopping list\n" +
        "/clear - Clear your shopping list\n\n" +
        "You can also send me a message with the items you want to add to your shopping list, each item should be on a new line\n" +
        "if you want to remove an item just add לא צריך in the beginning of the item", {parse_mode: 'MarkdownV2'})
    })

    bot.command("list", async (ctx) => {
        const shoppingListMessage = await getShoppingListMessage(ctx.chat.id)
        await ctx.reply(shoppingListMessage, slientOption)
    })

    bot.command("clear", async (ctx) => {
        await clearList(ctx.chat.id)
        await ctx.reply("Your shopping list has been cleared", slientOption)
    })

    bot.on("message:text", async (ctx) => {
        const items = getItemsFromText(ctx.message.text)
        await addItemsToShoppingList(items, ctx.chat.id)
        const shoppingListMessage = await getShoppingListMessage(ctx.chat.id)
        await ctx.reply(shoppingListMessage, slientOption)
    })

    bot.api.setMyCommands([
        // {command: "start", description: "Start the bot"},
        {command: "list", description: "Get your shopping list"},
        {command: "clear", description: "Clear your shopping list"},
        // {command: "help", description: "Get help with using the bot"},
    ])

    cron.schedule("0 6 * * 5", async () => {
        const shoppingLists = getAllShoppingLists()
        for (const [chatId, items] of shoppingLists) {
            if (items.length === 0) {
                continue
            }
            await bot.api.sendMessage(chatId, `Here's your shopping list for today:\n\n${items.sort().join("\n")}`)
        }
    });
}

async function getShoppingListMessage(id: number): Promise<string> {
    const shoppingList = await getShoppingList(id)
    if (shoppingList.length === 0) {
        return "Your shopping list is empty"
    }
    return shoppingList.sort().join("\n")
}