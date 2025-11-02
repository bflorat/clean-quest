# Clean Quest

Turn chores into a game: reward your kids with XP or cash.

## Stack

React app scaffolded with Vite and Vitest. Uses PocketBase as the backend (required).

- React (latest)
- Vite (latest)
- Vitest + Testing Library (JSDOM)

## Scripts

- `npm install` — install deps
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run preview` — preview build
- `npm test` — run tests in watch mode
- `npm run test:run` — run tests once
- `npm run test:coverage` — coverage report

## Installation

After installation, create a PocketDB admin account at `https://<your website>/_`.

Then, create the  database tables with : 

```
/pb/pocketbase migrate up --dir=/pb_data --migrationsDir=/pb/pb_migrations
```

## Business rules

- Task value fallback: when a task `finalValue` (or `value`) is missing or equal to 0, the UI uses its associated task type `defaultValue` for display and for the Estimated Money total.
- Rules fallback: when the current quest has an empty `rules` field, the UI looks back through previous quests (sorted by start date descending) and shows the first non‑empty `rules` it finds. If none exist, it displays “No rules yet.”
- Deletion protection: regular users cannot delete tasks whose effective value is negative (penalties). Only admins can delete negative‑valued tasks. The backend enforces this via the tasks deleteRule, and the UI disables the delete action accordingly.

### Units for task values

- The `quests` collection has a new optional `unit` text field that defines the unit used to display task values in the UI (in the task list and in the Estimated Money panel).
- Supported values: `€`, `$`, or `XP`.
- Default is `XP` (points) when the field is empty.
- Rendering:
- For currencies (`€`, `$`), the symbol prefixes the number (e.g., `€ 12`).
- For other units (e.g., `XP`), the unit is suffixed (e.g., `12 XP`).


## Docker (PocketBase)

A production multi-stage Dockerfile is included at `Dockerfile` (based on PocketBase docs). It builds the React app with Vite (optionally runs Vitest) and embeds the static files into `/pb/pb_public` inside the PocketBase image.

Build the image (override `PB_VERSION`/`PB_ARCH` if needed):

```
docker build -t clean-quest-pocketbase:<release> \
  --build-arg PB_VERSION=0.22.14 \
  --build-arg PB_ARCH=linux_amd64 .
```

Run it, persisting data to `./pb_data` and exposing port 8090:

```
mkdir -p pb_data
docker run --name pocketbase -p 8090:8090 \
  -v "$(pwd)/pb_data:/pb/pb_data" \
  -d clean-quest-pocketbase
```

Point the React app to it by setting in `.env`:

```
VITE_POCKETDB_URL=http://127.0.0.1:8090
```

Then run the frontend dev server:

```
npm run dev
```

Notes:
- `PB_ARCH` values: `linux_amd64` (x86_64), `linux_arm64` (Apple Silicon/ARM).
- The container exposes `/pb/pb_data` as a volume for persistence.
- Healthcheck hits `/api/health` on port 8090.
- The built SPA is served from `/pb/pb_public`. No separate web server is required.

### docker-compose

`docker-compose.yml` is included to run PocketBase and (optionally) a Vite dev server.

- Build and run PocketBase (production image with embedded SPA):

```
docker compose up -d pocketbase
```

- Run Vite dev server alongside PocketBase (hot reload):

```
docker compose --profile dev up web-dev pocketbase
```

You can configure build arguments and Vite envs via a local `.env` file (see `.env.example`). Common variables:

- `PB_VERSION`, `PB_ARCH` — PocketBase binary
- `VITE_POCKETDB_URL` — PocketBase URL the frontend uses
- `VITE_BASE` — Vite base path (defaults to `/`)
- `SKIP_TESTS` — set to `true` to skip Vitest during Docker build
- `UID`, `GID` — host user/group IDs used by services (fixes bind-mount permissions)

If you see PocketBase errors like "permission denied" or "unable to open database file", ensure the bind-mounted data directory is writable by the container user. Either set `UID`/`GID` in `.env` to match your host user, or run:

```
mkdir -p pb_data
sudo chown -R $(id -u):$(id -g) pb_data
```

### Migrations (PocketBase)

PocketBase migration scripts live in `pb_migrations/` and are copied into the image at `/pb/pb_migrations`.

- Apply migrations manually:

```
docker compose run --rm pocketbase migrate up
```

- Rollback last migration:

```
docker compose run --rm pocketbase migrate down
```


# Data model

```mermaid
classDiagram  
  
  %% Nomenclature
  %% defaultValue provides default value for each task but can be overridden 
  %% in the task itself
  class TaskType {
    string  id
    datetime created
    datetime updated
    string taskType 
    float defaultValue
    string comment
  }

  class Task {
    string  id
    datetime created
    datetime updated
    string  description
    string taskType
    float finalValue
    boolean done     
    boolean doneWithoutAsking
    string comment
    %% Uploading a picture is optional, picture should be reduced to 200KB max
    file picture
  }

  class Payment {
    string  id
    datetime created
    datetime updated
    %% null while payment waiting 
    dateTime datePayment 
    string comment
  }

  class Quest {
    string id
    datetime created
    datetime updated
    dateTime start
    dateTime end
    string comment
    string unit
  }

  Quest "1" --> "0..1" Payment: has been pay by
  Quest "1" --> "0..*" Task: contains
  User "1" --> "0..*" Quest: does

```
