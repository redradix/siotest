# Socket.io Loadtest

A CLI to execute loadtest for socket.io

## Installation
`
npm install
`
## Usage

Run

`
siotest -u "socket_addr" -g generators/eventgenerator
`

Params

| Param                  | Meaning                          | Required (default)  |
| ---------------------- |:---------------------------------| -------------------:|
| -c, -connections       | Number of socket clients         |           false (1) |
| -n, --number-of-events | Number of events to send         |    false (infinite) |
| --min-interval         | Min interval (ms) between events |           false (0) |
| --max-interval         | Max interval (ms) between events |           false (1) |
| -a, --async            | Send events async                |               false |
| -u, --socket-url       | Socket address                   |                true |
| -g, --generator-path   | Event generator path             |                true |
| -o, --output           | Output filepath                  |     false (console) |
