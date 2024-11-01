# Liga Tenis Málaga - Web Application

Data explorer with in-process OLAP database, using data retrieved from the webiste.

## Tech Stack

### Programming Language

[TypeScript](https://www.typescriptlang.org)

### Frontend

- UI Library: [React](https://react.dev)
- Tooling: [Vite](https://vitejs.dev)
- Component Library: [Material-UI](https://mui.com/material-ui/)
- Client-Side Routing: [React Router](https://reactrouter.com/en/main)
- Query Caching: [React Query](https://tanstack.com/query)
- Internationalization: [React Intl](https://formatjs.io/docs/react-intl/)

### Backend

In the beginning, this is going to be an application without login. All the information is publicly available. We might add authentication/authorization in the future if we want to restrict access to some information.

We are going to use an in-process analytical SQL database for the browser, [DuckDB-Wasm](https://duckdb.org), with a web assembly engine so no need for any kind of backend API because the queries will be executed directly within the web browser.

