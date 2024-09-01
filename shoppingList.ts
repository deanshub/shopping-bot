import fs from "node:fs/promises"
import { SHOPPING_LISTS_DIR } from "./consts";
import { mkdir } from 'node:fs/promises'


const shoppingLists = new Map<number, string[]>()

export function getItemsFromText(text: string): string[] {
    return text.split("\n")
        .map((item) => item.trim())
        .map((item) => {
            const match = item.match(/^(\d+)/);
            if (match) {
                return `${item.slice(match[0].length).trim()} ${match[0]}`
            }
            return item;
        })
}

export async function loadShoppingLists(){
    const files = await fs.readdir(SHOPPING_LISTS_DIR)
    for (const file of files) {
        const shoppingList = await fs.readFile(`${SHOPPING_LISTS_DIR}/${file}`, "utf-8")
        shoppingLists.set(parseInt(file.split(".")[0]), JSON.parse(shoppingList))
    }
}

export async function getShoppingList(listId: number): Promise<string[]> {
    try {
        const shoppingList = shoppingLists.get(listId)
        return shoppingList ?? []
    } catch (error) {
        shoppingLists.set(listId, [])
    }
    return []
}

export async function addItemsToShoppingList(items: string[], listId: number) {
    const originalShoppingList = await getShoppingList(listId)
    const itemsToRemove = items.filter((item) => item.includes('לא צריך'))
    const newItems = items.filter((item) => !originalShoppingList.includes(item) && !itemsToRemove.includes(item))
    const renamedItemsToRemove = itemsToRemove.map((item) => {
        return item.replace('לא צריך', '').trim()
    })
    const shoppingList = originalShoppingList.filter((item) => {
        return !renamedItemsToRemove.includes(item)
    })

    
    const newShoppingList = [...shoppingList, ...newItems];
    shoppingLists.set(listId, newShoppingList)
    await fs.writeFile(`${SHOPPING_LISTS_DIR}/${listId}.json`, JSON.stringify(newShoppingList, null, 2))
}

export async function clearList(listId: number) {
    shoppingLists.set(listId, [])
    await fs.writeFile(`${SHOPPING_LISTS_DIR}/${listId}.json`, JSON.stringify([], null, 2))
}

export function getAllShoppingLists(): Map<number, string[]> {
    return shoppingLists
}

export async function ensureShoppingListDir(){
    try {
        await mkdir(SHOPPING_LISTS_DIR, { recursive: true })
    } catch (error) {
        console.error(error)
    }
}