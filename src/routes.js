import { randomUUID } from 'node:crypto'

import { Database } from "./database.js";
import { buildRoutePath } from './utils/buildRoutePath.js'

const database = new Database()

export const routes = [
    {
        method: 'GET',
        path: buildRoutePath('/tasks'),
        handler: (request, response) => {
            const { search } = request.query

            // Seleciona todas as tasks que estão na tabela do banco,
            // e se for passado a query de search, seleciona somente as tasks que atendem o filtro
            const tasks = database.select('tasks', search ? {
                title: search,
                description: search
            } : null)

            return response.end(JSON.stringify(tasks))
        }
    },
    {
        method: 'POST',
        path: buildRoutePath('/tasks'),
        handler: (request, response) => {
            const { title, description } = request.body

            // Verifica se possui o title no body, informação obrigatória
            if (!title) {
                return response
                    .writeHead(400)
                    .end(JSON.stringify({message: 'Title is required'}))
            }

            // Verifica se possui o description no body, informação obrigatória
            if (!description) {
                return response
                    .writeHead(400)
                    .end(JSON.stringify({message: 'Title is required'}))
            }

            // Cria um task com as informação necessárias
            const task = {
                id: randomUUID(),
                title,
                description,
                completed_at: null,
                created_at: new Date().toLocaleString('pt-BR'),
                updated_at: new Date().toLocaleString('pt-BR')
            }

            // Insere a task no banco
            database.insert('tasks', task)

            return response
                .writeHead(200)
                .end(JSON.stringify({message: 'Task registered successfully!'}))
        }
    },
    {
        method: 'DELETE',
        path: buildRoutePath('/tasks/:id'),
        handler: (request, response) => {
            const { id } = request.params

            // Guarda a task que está no banco, com o ID informado
            const [task] = database.select('tasks', { id })

            // Se não achar a task retorna erro
            if (!task) {
                return response
                    .writeHead(404)
                    .end(JSON.stringify({ message: 'ID Task not found' }))
            }

            // Deleta a task no banco com base no ID informado
            database.delete('tasks', id)

            return response.writeHead(204).end()
        }
    },
    {
        method: 'PUT',
        path: buildRoutePath('/tasks/:id'),
        handler: (request, response) => {
            const { id } = request.params
            const { title, description } = request.body
            
            // Valida se tem pelo menos um dos itens com informação para atualizar
            // pelo menos um precisa vir no body
            if (!title && !description) {
                return response
                    .writeHead(400)
                    .end(JSON.stringify({ message: 'Title or description are required' })
                )
            }

            // Guarda a task que está no banco, com o ID informado
            const [task] = database.select('tasks', { id })

            // Se não achar a task retorna 'Task não encontrada'
            if (!task) {
                return response
                    .writeHead(404)
                    .end(JSON.stringify({ message: 'Task not found' }))
            }

            // Se achar a task, atualiza com as informações no banco
            database.update('tasks', id, {
                title: title ?? task.title,
                description: description ?? task.description,
                updated_at: new Date().toLocaleString('pt-BR'),
            })

            return response
                .writeHead(200)
                .end(JSON.stringify({ message: 'Task updated successfully!' }))
        }
    },
    {
        method: 'PATCH',
        path: buildRoutePath('/tasks/:id/complete'),
        handler: (request, response) => {
            const { id } = request.params

            // Guarda a task que está no banco, com o ID informado
            const [task] = database.select('tasks', { id })

            // Se não achar a task retorna 'Task não encontrada'
            if (!task) {
                return response
                    .writeHead(404)
                    .end(JSON.stringify({ message: 'Task not found' }))
            }

            // Guarda a informação se a task encontrada no banco já foi ou não concluída
            const isTaskComplete = !!task.completed_at

            // Se task já concluida retorna a informação e não atualiza nenhuma informação
            if (isTaskComplete) {
                return response
                    .writeHead(404)
                    .end(JSON.stringify({ message: 'This task has already been completed' }))
            } 
        
            const completed_at = new Date().toLocaleString('pt-BR')
                
            // Se ainda não foi concluida, realiza a atualição da informação no banco
            database.update('tasks', id, { completed_at })
            
            return response
                .writeHead(200)
                .end(JSON.stringify({ message: 'Task completed!' }))
        }
    }
]