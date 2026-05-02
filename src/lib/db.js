import { openDB } from 'idb'

const DB_NAME = 'sliceprice'
const DB_VERSION = 1
const STORE = 'settings'

function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore(STORE)
    },
  })
}

export async function getSetting(key) {
  const db = await getDB()
  return db.get(STORE, key)
}

export async function setSetting(key, value) {
  const db = await getDB()
  return db.put(STORE, value, key)
}

export async function getAllSettings() {
  const db = await getDB()
  const keys = await db.getAllKeys(STORE)
  const values = await db.getAll(STORE)
  return Object.fromEntries(keys.map((k, i) => [k, values[i]]))
}
