import fs from 'node:fs'
import { parse } from 'csv-parse'

// Executa a função importTasks com o caminho do arquivo CSV
const filePath = new URL('./tasks.csv', import.meta.url)

async function importTasks(filePath) {
  // Cria um stream de leitura a partir do arquivo CSV
  const fileStream = fs.createReadStream(filePath);

  // Configura o parser CSV para pular o cabeçalho e começar da segunda linha
  const parser = fileStream.pipe(
    parse({
      delimiter: ',',
      from_line: 2,
    })
  );

  // Itera de forma assíncrona pelo parser
  for await (const [title, description] of parser) {
    // Faz a requisição POST para cada linha
    await fetch('http://localhost:3333/tasks', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
            title, 
            description 
        }),
    })
      .then((response) => {
        if (response.ok) {
          console.log(`Task "${title}" importada com sucesso!`);
        } else {
          console.error(`Erro ao importar a task "${title}": ${response.statusText}`);
        }
      })
      .catch((error) => console.error(`Erro na requisição: ${error.message}`));
  }
}

importTasks(filePath)