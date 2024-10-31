import fs from 'node:fs/promises'

const databasePath = new URL('../db.json', import.meta.url)

export class Database {
    #database = {}

    constructor() {
        fs.readFile(databasePath, 'utf-8')
            .then(data => {
                this.#database = JSON.parse(data)
            })
            .catch(() => {
                this.#persist()
            })
    }

    #persist() {
        fs.writeFile(databasePath, JSON.stringify(this.#database))
    }

    // Listagem das tasks
    select(table, search) {
        // Valida se a tabela existe ou não para guardar no data e retornar o resultado
        let data = this.#database[table] ?? []

        // Se houver a query de filtragem, ele executa
        if (search) {
            data = data.filter(row => {
                return Object.entries(search).some(([key, value]) => {
                    return row[key].toLowerCase().includes(value.toLowerCase())
                })
            })
        }

        return data
    }

    // Criação da task
    insert(table, data) {
        // Valida se já existe a tabela enviada no banco, para caso tenha inserir na mesma ou criar uma nova.
        if (Array.isArray(this.#database[table])) {
            this.#database[table].push(data)
        } else {
            this.#database[table] = [data]
        }

        // Grava no arquivo do banco, db.json.
        this.#persist()

        return data
    }

    // Exclusão da task pelo ID
    delete(table, id) {
        // Procura com base no ID, se tem um igual na tabela.
        const rowIndex = this.#database[table].findIndex(row => row.id === id)

        // Se retornar uma posição, deleta a task da tabela
        if(rowIndex > -1) {
            this.#database[table].splice(rowIndex, 1)
            this.#persist()
        }
    }

    // Atualização da tasks
    update(table, id, data) {
        // Procura com base no ID, se tem um igual na tabela.
        const rowIndex = this.#database[table].findIndex(row => row.id === id)

        // Se retornar uma posição, atualiza a task da tabela
        if(rowIndex > -1) {
            // Guarda a informação já existente e troca somente os campos necessários 
            const row = this.#database[table][rowIndex]
            this.#database[table][rowIndex] = { id, ...row, ...data }
            this.#persist()
        }
    }
}