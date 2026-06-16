import { RunnableSequence, RunnablePick } from '@langchain/core/runnables'

const inputData = {
  name: 'dony',
  age: 30,
  city: 'beijing',
  country: 'china',
  email: 'dony@example.com',
  phone: '+86-1399922222'
}

const chain = RunnableSequence.from([
  (input) => ({
    ...input,
    fullInfo: `${input.name}, ${input.age}岁，来自${input.city}`
  }),
  new RunnablePick(['email', 'fullInfo'])
])

const result = await chain.invoke(inputData)
console.log(result)
