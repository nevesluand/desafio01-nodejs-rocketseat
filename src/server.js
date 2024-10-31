import http from 'node:http'
import { routes } from './routes.js'
import { json } from './middlewares/json.js'
import { extractQueryParams } from './utils/extractQueryParams.js'

const server = http.createServer(async (request, response) => {
    const { method, url } = request

    // Trato a requisição
    await json(request, response)

    // Valido a rota chamada na requisição
    const route = routes.find(route => {
        return route.method === method && route.path.test(url)
    })

    // Executo a rota existente que foi chamada
    if (route) {
        const routeParams = request.url.match(route.path)
        const { query, ...params } = routeParams.groups

        request.params = params
        request.query = query ? extractQueryParams(query) : {}

        return route.handler(request, response)
    }

    // Caso não tenha a rota da erro 404 - Not Found
    return response.whiteHead(404).end('Route not found')
})

server.listen(3333)