import 'dotenv/config'
import { Agent, run } from '@openai/agents'
import { fa, tr } from 'zod/locales'

const agent = new Agent({
    name: 'Storyteller',
    instructions:
        'You are a storyteller. You will be given a topic and you will tell a story about it.',
})


async function main(query: string) {
    const result = await run(agent, query, { stream: true })
    console.log("result ", result.finalOutput)
}


async function mainStream(query: string) {
    const result = await run(agent, query, { stream: true })
    const stream = result.toTextStream()

    for await (const val of stream) {
        console.log(`${val}`)
    }
}

async function* streamOutput(q : string) {
     const result = await run(agent, q, { stream: true })
     const stream = result.toTextStream()

     for await (const val of stream) {
         yield { isCompleted : false, value : val}
    }

    yield { isCompleted : true, value : result.finalOutput}
}

async function mainStreamPipe(query: string) {
    const result = await run(agent, query, { stream: true })
    result.toTextStream({ compatibleWithNodeStreams: true }).pipe(process.stdout)
}

async function mainCustomStream(query: string) {
    for await (const obj of streamOutput(query)){
        console.log(obj)
    }
}

// mainStreamPipe("In 300 words, tell me a story about iran and america conflict")
mainCustomStream("In 300 words, tell me a story about iran and america conflict")
// main("In 300 words, tell me a story about iran and america conflict")