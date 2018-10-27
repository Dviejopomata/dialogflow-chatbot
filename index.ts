// Import the appropriate service and chosen wrappers
import { dialogflow, Image, List } from "actions-on-google"
import express = require("express")
import querystring = require("querystring")
import request = require("request")
import bodyParser = require("body-parser")
import { AddressInfo } from "net"
import { isObject } from "util"
const expressApp = express()
// Create an app instance
const app = dialogflow()
// Register handlers for Dialogflow intents
app.intent("ocupacion", conv => {
  conv.ask("Me dedico a desarrollar aplicaciones web")
})
app.intent("trending-github", (conv, parameters) => {
  return new Promise((resolve, reject) => {
    // --data-urlencode "q=created:>2018-10-15" \
    // --data-urlencode "q=language:javascript" \
    // --data-urlencode "sort=stars"                          \
    // --data-urlencode "order=desc"                          \
    const query = {
      q: ["created:>2018-10-15", `language:${parameters.language}`],
      sort: "starts",
      order: "desc",
    }
    request(
      {
        url: `https://api.github.com/search/repositories?${querystring.stringify(
          query,
        )}`,
        headers: {
          Accept: "application/vnd.github.preview",
          "User-agent":
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36",
        },
        json: true,
      },
      (err, res) => {
        if (err) {
          return reject(err)
        }
        conv.ask("Esta es la lista de frameworks")
        console.log(res.body)

        const items = {}
        res.body.items.forEach(
          i =>
            (items[i.full_name] = {
              title: i.name,
              description: i.description,
            }),
        )
        conv.ask(
          new List({
            title: "List of frameworks",
            items,
          }),
        )
        resolve()
      },
    )
  })
})
app.intent("new-js-framework", conv => {
  console.log(conv.parameters)
  const datePeriod = conv.parameters["date-period"] as any
  if (isObject(datePeriod)) {
    const startDate = new Date(datePeriod.startDate)
    const endDate = new Date(datePeriod.endDate)
    console.log(startDate, endDate)
    conv.ask("Esta es la lista de frameworks")
    conv.ask(
      new List({
        title: "List of frameworks",
        items: {
          vue: {
            title: "Vue framework",
            description: "Vue is a yet another framework",
          },
          angular: {
            title: "Angular framework",
            description: "Angular is a yet another framework",
          },
        },
      }),
    )
  } else {
    conv.ask("He perdido la cuenta la verdad")
  }
})

app.intent("que-framework-es-mejor", conv => {
  console.log(conv.parameters)

  switch (conv.parameters.framework1) {
    case "Angular":
      break
    case "Vue":
      break
    case "React":
      break
    default:
      break
  }
  conv.ask(
    `${conv.parameters.framework1} es mejor que ${conv.parameters.framework2}`,
  )
})

app.intent("ocupacion", conv => {
  conv.ask("Me dedico a desarrollar aplicaciones web")
})
app.intent("Default Welcome Intent", conv => {
  conv.ask("Hi, how is it going?")
  conv.ask(`Here's a picture of a cat`)
  conv.ask(
    new Image({
      url:
        "https://developers.google.com/web/fundamentals/accessibility/semantics-builtin/imgs/160204193356-01-cat-500.jpg",
      alt: "A cat",
    }),
  )
})

// Intent in Dialogflow called `Goodbye`
app.intent("Goodbye", conv => {
  conv.close("See you later!")
})

app.intent("a.comer", conv => {
  // conv.ask("Ya esta la comida?")
  conv.close("Pon la mesa primero")
})

app.intent("Default Fallback Intent", conv => {
  conv.ask(`I didn't understand. Can you tell me something else?`)
})
app.intent("pagar-tributo", (conv, params) => {
  const price = 100.23
  conv.ask(`Su deuda de ${params.tributo} con referencia de ${params.referencia} es de ${price}`)
})
expressApp.use(bodyParser.json())
expressApp.post("/", async function(request, response, next) {
  console.log(request.body, request.headers)

  try {
    const res = await app.handler(request.body, request.headers, {
      express: { request, response },
    })
    response.status(res.status)
    for (const [key, value] of Object.entries(res.headers)) {
      response.setHeader(key, value)
    }
    response.send(res.body)
  } catch (error) {
    next(error)
  }
})
const server = expressApp.listen(process.env.PORT || 3500, () => {
  const address = server.address() as AddressInfo
  console.log(`Address ${address.address}${address.port}`)
})
