# What is the Octalysis Mini Challenge?

Octalysis Mini Challenge is a weekly event for Octalysis Prime members happening in the Slack community. It's a safe and fun place for primers to put their knowledge into practice and learn from others.

The Octalysis Prime team proposes challenges, but primers can also host the event for the week.

# Why this project?

Only the most recent 10,000 messages can be viewed and searched in the Slack free version. I built this project to save the content of the mini-challenge. The challenges are good, and there are a lot of quality answers from the community. I wanted to preserve the hard work of everyone and let new members discover previous challenges.

# Who are you?

I'm a software developer from France and an Octalysis Prime member. I joined the community 2 years ago to learn more about gamification and found that the Octalysis Framework is practical and fun to apply in many situations.

# Want to know more about Octalysis?

Yu-kai Chou created the Octalysis Framework.

- [Who is Yu-kai Chou?](https://yukaichou.com/gamification-expert/)
- [What is the Octalysis Framework?](https://yukaichou.com/gamification-examples/octalysis-complete-gamification-framework/)
- [What is Octalysis Prime?](https://join.octalysisprime.com/)

---

# Tech Stack

The project includes **three parts**: a backend, a proxy server, and a frontend, each in its own Github repository. They are all hosted in [Google Cloud Run](https://cloud.google.com/run/) using docker.

The [backend](https://github.com/Wraithraiser/octalysis-monday-challenge) is a Node.js server using [Express.js](http://expressjs.com/). Its role is to consume the [Slack Web API](https://api.slack.com/web), work on the data, communicate with a mongo database, and expose services through an API.

The [proxy server](https://github.com/Wraithraiser/octalysis-proxy-server) is for security purposes. The backend is private by default using **Google Cloud Run** feature. Only by going through the proxy can we consume the API. The proxy server is public and only exposes public API resources. It's also a Node.js server with Express.js.

Finally, the [frontend](https://github.com/Wraithraiser/octalysis-monday-challenge-front) consumes the API through the proxy server to display the data for the user. It's a basic [Create React App](https://create-react-app.dev/) with some lib from React ecosystem like [styled-components](https://styled-components.com/) and [React Query](https://react-query.tanstack.com/).

Here's a flow chart of the [Architecture](https://whimsical.com/archi-technique-JfsCh4TbUh32WZTsvEGdzv@2Ux7TurymN25iRixJCsQ).
