# The Garden — 05 Reflections

A real-time collaborative canvas used as a closing activity for a design/art course. Students and the instructor contribute nodes representing projects, people, and topics, then draw connections between them to map relationships across the semester's five arc themes.

## What it does

- **Zoomable SVG canvas** centered on a pentagon whose five vertices represent course arc themes: *Systems + Sensibilities*, *Forms of Repetition*, *Mapping the Personal*, *World as Input*, and *Reflections + Future Thinking*
- **Student ring** — pre-seeded student nodes arranged alphabetically around an outer circle; each student can claim and edit their own node by entering their exact name
- **Idea nodes** — any logged-in user can double-click the canvas to drop a new node (project, person, or topic) near the closest arc zone
- **Connections** — click a node's "connect" button, then click another node to draw a relationship line
- **Richness opacity** — nodes fade in as they accumulate content (description, URL, connections), making the densest parts of the garden visually prominent
- **Live sync** — all changes propagate instantly to every open browser via Supabase Realtime

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS v4 |
| Backend / DB | Supabase (Postgres + Realtime) |
| Auth | Name-based (stored in `localStorage`) |

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create `.env.local` in this directory:

```
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
VITE_ADMIN_NAME=<your-name>
```

`VITE_ADMIN_NAME` grants admin/god-mode — the settings panel will show extra controls when you log in with this exact name.

### 3. Set up the database

Create two tables in your Supabase project:

**`nodes`**
```sql
create table nodes (
  id          uuid primary key default gen_random_uuid(),
  type        text not null,         -- 'project' | 'person' | 'topic'
  title       text not null,
  description text,
  arc_node    text,                  -- 'systems' | 'repetition' | 'personal' | 'world' | 'reflections'
  x           float,
  y           float,
  external_url text,
  created_by  text not null,
  is_seed     boolean default false,
  is_student  boolean default false,
  created_at  timestamptz default now()
);
```

**`connections`**
```sql
create table connections (
  id           uuid primary key default gen_random_uuid(),
  from_node_id uuid references nodes(id) on delete cascade,
  to_node_id   uuid references nodes(id) on delete cascade,
  created_by   text not null,
  created_at   timestamptz default now()
);
```

Enable Realtime on both tables in the Supabase dashboard.

### 4. Seed content (optional)

**Seed idea nodes** from `garden_seeds.json`:

```bash
node scripts/seed.js
```

**Seed student roster**:

Edit the `students` array in `scripts/seed-students.js`, then:

```bash
node scripts/seed-students.js
```

### 5. Run

```bash
npm run dev
```

## Project structure

```
src/
  App.tsx                  # Root — state, layout, event wiring
  components/
    ArcCanvas.tsx          # Zoomable SVG stage + pentagon/ring chrome
    NodeObject.tsx         # Individual node rendering (leaf, person, topic)
    ConnectionLines.tsx    # SVG lines between connected nodes
    DetailPanel.tsx        # Sidebar shown when a node is selected
    AddNodeModal.tsx       # Form to create a new node on double-click
    NameModal.tsx          # Login prompt (name entry)
    SettingsPanel.tsx      # Settings + admin controls
  hooks/
    useGardenData.ts       # Supabase fetch + Realtime subscriptions
  lib/
    supabase.ts            # Client init + shared types
scripts/
  seed.js                  # Bulk-insert nodes/connections from garden_seeds.json
  seed-students.js         # Bulk-insert student roster
```

## Usage

| Action | How |
|---|---|
| Pan | Click and drag the canvas |
| Zoom | Scroll wheel |
| Reset view | "reset view" button (bottom-right) |
| Add a node | Double-click anywhere on the canvas |
| Select a node | Click it |
| Connect two nodes | Select a node → "connect" in the detail panel → click the target |
| Edit your node | Log in with the exact name matching the node's `created_by` field |
| Admin controls | Log in with the name set in `VITE_ADMIN_NAME` |
