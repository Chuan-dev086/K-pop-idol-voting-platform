
# Idol Vote Hub: K-pop Fan Voting & Ranking Platform (MERN Stack)

## 1. Project Overview

Idol Vote Hub is a full-stack, real-time K-pop fan voting and ranking system built using the MERN stack (MongoDB, Express.js, React, Node.js) with Material UI (MUI). Inspired by popular platforms like Idol Champ and Choeaedol, the application allows K-pop enthusiasts to support their favorite idols in various competitive polls (e.g., Birthday Ads, Monthly Ranking, Comeback Support).

The application features a virtual economy ("Hearts/Points System"), live rank progress tracking, supporting fan walls, and role-based access control (RBAC) to separate admin management from user voting interactions.

This project strictly adheres to the assessment requirements for **CU6 (Backend Data Server)** and **CU2 (Frontend User Interface)**.

---

## 2. System Architecture & Tech Stack

### 2.1 Tech Stack

- **Frontend**: React, Material UI (MUI), React Router, Axios
- **Backend**: Node.js, Express.js, JSON Web Tokens (JWT), Bcryptjs
- **Database**: MongoDB (Local), Mongoose (ODM / Data Modeling)
- **Database Tool**: MongoDB Compass
- **Deployment Plan**: Migrate to MongoDB Atlas before cloud deployment

### 2.2 Environment Strategy

| Stage             | Database      | Connection String                         |
| ----------------- | ------------- | ----------------------------------------- |
| Local development | Local MongoDB | `mongodb://localhost:27017/idol-vote-hub` |
| Cloud deployment  | MongoDB Atlas | `mongodb+srv://...`                       |

Only the `MONGO_URI` in `.env` changes between the two stages. Application code does not change.

Migration plan (before deployment):

1. Register MongoDB Atlas, create a free M0 cluster.
2. Use `mongodump` to export local data.
3. Use `mongorestore` to import into Atlas.
4. Update `.env` `MONGO_URI` to the Atlas connection string.
5. Redeploy backend.

### 2.3 Data Flow

`React (MUI View)` ➔ `Axios Request` ➔ `Express Routes` ➔ `Auth/Role Middleware` ➔ `Controllers` ➔ `Mongoose Models` ➔ `MongoDB (Local)`

### 2.4 Confirmed Core Rules

| Item                           | Decision                                                          |
| ------------------------------ | ----------------------------------------------------------------- |
| Voting unit                    | 1 vote = 1 heart                                                  |
| Check-in reward                | +50 hearts per day                                                |
| Missed check-in penalty        | None                                                              |
| Repeat voting                  | A user can vote for the same idol multiple times in the same poll |
| Poll status                    | No `status` field; derived from `startDate` / `endDate`           |
| JWT storage                    | localStorage                                                      |
| Admin account                  | Manually added                                                    |
| Anti-abuse                     | Later, possibly not implemented                                   |
| Development order              | Backend first                                                     |
| Check-in logic                 | Use `lastCheckIn`                                                 |
| Image storage                  | MongoDB stores URL strings; image files stored externally         |
| Login redirect                 | Decided by frontend                                               |
| Logged-in user visiting /login | Auto-redirect; do not show login page                             |
| ProtectedRoute checks          | Token + admin role                                                |
| Admin login redirect           | Directly to `/admin`                                              |
| Regular user login redirect    | To `/` (Home)                                                     |
| Admin vote / check-in          | Not allowed                                                       |
| Admin manage users             | Allowed (with restrictions)                                       |
| Delete user                    | Allowed for regular users only                                    |
| Delete admin                   | Not allowed                                                       |
| Agency model                   | Separate `agencies` collection; `Idol.agencyId` references it     |
| `createdAt` policy             | Only on user-generated data (users, votetransactions, heartlogs)  |

---

## 3. User Roles and Permissions

There are exactly two roles in this system: `user` and `admin`.

### 3.1 Role Definitions

| Role    | Description                                                                              |
| ------- | ---------------------------------------------------------------------------------------- |
| `user`  | Regular fan. Can read public data, check in, vote, and manage their own profile.         |
| `admin` | Platform manager. Can manage agencies, idols, polls, and users. Cannot vote or check in. |

### 3.2 Full Permission Matrix

| Feature                            | User | Admin                 |
| ---------------------------------- | ---- | --------------------- |
| Register via `/api/auth/register`  | Yes  | No (created manually) |
| Login                              | Yes  | Yes                   |
| View Home                          | Yes  | Yes                   |
| View PollList                      | Yes  | Yes                   |
| View PollDetail                    | Yes  | Yes                   |
| View IdolDirectory                 | Yes  | Yes                   |
| Daily check-in                     | Yes  | No                    |
| Cast vote                          | Yes  | No                    |
| View own history                   | Yes  | Yes (own only)        |
| View other users' history          | No   | No                    |
| Manage Agencies (CRUD)             | No   | Yes                   |
| Manage Idols (CRUD)                | No   | Yes                   |
| Manage Polls (CRUD)                | No   | Yes                   |
| Manage Users (CRUD)                | No   | Yes                   |
| Access AdminDashboard              | No   | Yes                   |
| Change own role                    | No   | No                    |
| Change another user's role         | No   | Yes                   |
| Delete regular user                | No   | Yes                   |
| Delete admin                       | No   | No                    |
| Change another user's heartBalance | No   | Yes                   |

### 3.3 Role Assignment Rules

- Registration always creates a `user`.
- Admin accounts are created manually (direct DB insert or seed script).
- Admin cannot change their own `role`.
- Admin can change another user's `role`.
- Admin cannot delete another admin.
- Admin can delete a regular user.
- When a user is deleted, their `VoteTransaction` and `HeartLog` records are kept (audit trail).

### 3.4 Where Roles Are Enforced

1. **Backend middleware** — `auth` verifies token; `admin` verifies role; `notAdmin` blocks admins from user-only routes.
2. **Backend controllers** — business rules (e.g., admin cannot delete admin; admin cannot change own role).
3. **Frontend `ProtectedRoute`** — hides admin pages from non-admins and redirects unauthorized users.

### 3.5 Middleware Chain per Route Group

| Route Group                       | Middleware                        |
| --------------------------------- | --------------------------------- |
| `/api/auth`                       | none (public) or `auth` for `/me` |
| `/api/users`                      | `auth` → `admin`                  |
| `/api/agencies` (GET)             | none (public)                     |
| `/api/agencies` (POST/PUT/DELETE) | `auth` → `admin`                  |
| `/api/idols` (GET)                | none (public)                     |
| `/api/idols` (POST/PUT/DELETE)    | `auth` → `admin`                  |
| `/api/polls` (GET)                | none (public)                     |
| `/api/polls` (POST/PUT/DELETE)    | `auth` → `admin`                  |
| `/api/votes/check-in`             | `auth` → `notAdmin`               |
| `/api/votes/cast`                 | `auth` → `notAdmin`               |
| `/api/votes/history`              | `auth`                            |

Order matters: `auth` must run before `admin` or `notAdmin`.

### 3.6 Frontend Role Behavior

- Navbar shows Admin link only when `user.role === 'admin'`.
- After login:
  - `role === 'admin'` → navigate to `/admin`
  - `role === 'user'` → navigate to `/`
- `ProtectedRoute` with `requireAdmin`:
  - No token → redirect to `/login`
  - Token but `role !== 'admin'` → redirect to `/` or show 403
  - Token and `role === 'admin'` → render
- Logged-in users visiting `/login` or `/register` are auto-redirected.

---

## 4. Database Design (MongoDB Schemas)

The database consists of 6 interconnected Mongoose collections.

### 4.1 users

- `_id`: ObjectId - Unique user identifier
- `username`: String (Required, Unique) - Username
- `email`: String (Required, Unique) - Email address
- `password`: String (Required) - Hashed password (bcrypt)
- `role`: String (Enum: ['user', 'admin'], Default: 'user')
- `heartBalance`: Number (Default: 100)
- `lastCheckIn`: Date
- `createdAt`: Date - Registration timestamp

Indexes:

- Unique index on `username`
- Unique index on `email`

### 4.2 agencies

- `_id`: ObjectId - Unique agency identifier
- `name`: String (Required, Unique, Index) - Agency name
- `logoUrl`: String - Agency logo image URL
- `country`: String - Country of origin
- `foundedYear`: Number - Year the agency was founded

Notes:

- Unique index on `name`.
- Cannot delete an agency if any Idol references it.
- No `createdAt` because this is reference data.

### 4.3 idols

- `_id`: ObjectId - Unique idol identifier
- `name`: String (Required, Index) - Idol or group name
- `category`: String (Enum: ['Boy Group', 'Girl Group', 'Soloist'])
- `agencyId`: ObjectId (Ref: 'Agency', Required) - Entertainment company
- `avatarUrl`: String - Profile picture image URL
- `totalVotes`: Number (Default: 0) - Aggregate lifetime votes received

Notes:

- `totalVotes` is a redundant counter for fast global ranking.
- Deletion is rejected if the Idol is referenced by any Poll candidate.
- No `createdAt` because this is reference data.

### 4.4 polls

- `_id`: ObjectId - Unique poll identifier
- `title`: String (Required)
- `description`: String
- `startDate`: Date (Required)
- `endDate`: Date (Required)
- `candidates`: Array of Objects:
  - `idolId`: ObjectId (Ref: 'Idol')
  - `voteCount`: Number (Default: 0)

Notes:

- No `status` field. Status is derived from dates.
- `candidates` is embedded.
- Same `idolId` cannot appear twice in the same poll.
- `startDate < endDate` is validated.
- Candidates must reference existing Idols.
- No `createdAt` because `startDate` / `endDate` already provide time context.

Poll status calculation:

| Status   | Condition                     |
| -------- | ----------------------------- |
| upcoming | `now < startDate`             |
| active   | `startDate <= now <= endDate` |
| ended    | `now > endDate`               |

Behavior after `ended`:

- Voting is blocked.
- Fan Wall messages remain visible.
- Rankings remain visible.

### 4.5 votetransactions

- `_id`: ObjectId - Unique voting record identifier
- `userId`: ObjectId (Ref: 'User', Required)
- `pollId`: ObjectId (Ref: 'Poll', Required)
- `idolId`: ObjectId (Ref: 'Idol', Required)
- `votesSpent`: Number (Required, Min: 1)
- `message`: String
- `createdAt`: Date - Voting timestamp

Notes:

- Append-only; no Update or Delete.
- Kept even if the associated user is deleted.

### 4.6 heartlogs

- `_id`: ObjectId - Unique audit log identifier
- `userId`: ObjectId (Ref: 'User', Required)
- `type`: String (Enum: ['CHECK_IN', 'TASK_REWARD', 'VOTE_SPENT'])
- `amount`: Number (Required) - Positive for increase, negative for decrease
- `createdAt`: Date - Timestamp

Notes:

- Check-in writes only `HeartLog`.
- Voting writes both `VoteTransaction` and `HeartLog`.
- Kept even if the associated user is deleted.

### 4.7 `createdAt` Policy

| Collection       | `createdAt` | Reason                                       |
| ---------------- | ----------- | -------------------------------------------- |
| users            | Yes         | Registration time, audit                     |
| agencies         | No          | Reference data                               |
| idols            | No          | Reference data                               |
| polls            | No          | `startDate` / `endDate` already provide time |
| votetransactions | Yes         | Voting timestamp, core business              |
| heartlogs        | Yes         | Timeline, core business                      |

Rule: **User-generated data keeps `createdAt`; reference data does not.**

---

## 5. Entity Relationships

### 5.1 Relationship Summary

| Relationship           | Type  | Implementation                                  |
| ---------------------- | ----- | ----------------------------------------------- |
| Agency → Idol          | 1 : N | `Idol.agencyId` references `Agency._id`         |
| User → VoteTransaction | 1 : N | `VoteTransaction.userId` references `User._id`  |
| Poll → VoteTransaction | 1 : N | `VoteTransaction.pollId` references `Poll._id`  |
| Idol → VoteTransaction | 1 : N | `VoteTransaction.idolId` references `Idol._id`  |
| User → HeartLog        | 1 : N | `HeartLog.userId` references `User._id`         |
| Poll ↔ Idol            | N : M | `Poll.candidates[].idolId` (embedded reference) |

### 5.2 Relationship Notes

- **Agency → Idol (1:N)**  
  One agency manages many idols. Each idol belongs to one agency.

- **User → VoteTransaction (1:N)**  
  One user casts many votes. Each vote belongs to one user.

- **Poll → VoteTransaction (1:N)**  
  One poll receives many votes. Each vote belongs to one poll.

- **Idol → VoteTransaction (1:N)**  
  One idol receives many votes. Each vote targets one idol.

- **User → HeartLog (1:N)**  
  One user has many heart changes. Each log belongs to one user.

- **Poll ↔ Idol (N:M)**  
  One poll has many candidate idols. One idol can appear in many polls.  
  Implemented via the embedded `candidates` array in `Poll`.

### 5.3 VoteTransaction as a Three-Way Join

`VoteTransaction` connects three collections:
```

User ──┐
├──> VoteTransaction
Poll ──┤
│
Idol ──┘

````

Each record answers:
- Who voted (`userId`)
- In which poll (`pollId`)
- For which idol (`idolId`)
- How many hearts (`votesSpent`)
- When (`createdAt`)

### 5.4 Mermaid ER Diagram

```mermaid
erDiagram
    USERS {
        ObjectId _id PK
        string username
        string email
        string password
        string role
        number heartBalance
        Date lastCheckIn
        Date createdAt
    }

    AGENCIES {
        ObjectId _id PK
        string name
        string logoUrl
        string country
        number foundedYear
    }

    IDOLS {
        ObjectId _id PK
        string name
        string category
        ObjectId agencyId FK
        string avatarUrl
        number totalVotes
    }

    POLLS {
        ObjectId _id PK
        string title
        string description
        Date startDate
        Date endDate
        array candidates
    }

    VOTETRANSACTIONS {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId pollId FK
        ObjectId idolId FK
        number votesSpent
        string message
        Date createdAt
    }

    HEARTLOGS {
        ObjectId _id PK
        ObjectId userId FK
        string type
        number amount
        Date createdAt
    }

    AGENCIES ||--o{ IDOLS : manages
    USERS ||--o{ VOTETRANSACTIONS : casts
    USERS ||--o{ HEARTLOGS : has
    POLLS ||--o{ VOTETRANSACTIONS : receives
    IDOLS ||--o{ VOTETRANSACTIONS : receives
    POLLS }o--o{ IDOLS : "candidates (embedded)"
````

### 5.5 Mermaid Class Diagram (with embedded candidates)

```mermaid
classDiagram
    class Agency {
        +ObjectId _id
        +String name
        +String logoUrl
        +String country
        +Number foundedYear
    }

    class User {
        +ObjectId _id
        +String username
        +String email
        +String password
        +String role
        +Number heartBalance
        +Date lastCheckIn
        +Date createdAt
    }

    class Idol {
        +ObjectId _id
        +String name
        +String category
        +ObjectId agencyId
        +String avatarUrl
        +Number totalVotes
    }

    class Poll {
        +ObjectId _id
        +String title
        +String description
        +Date startDate
        +Date endDate
        +Candidate[] candidates
    }

    class Candidate {
        +ObjectId idolId
        +Number voteCount
    }

    class VoteTransaction {
        +ObjectId _id
        +ObjectId userId
        +ObjectId pollId
        +ObjectId idolId
        +Number votesSpent
        +String message
        +Date createdAt
    }

    class HeartLog {
        +ObjectId _id
        +ObjectId userId
        +String type
        +Number amount
        +Date createdAt
    }

    Agency "1" --> "*" Idol : manages
    User "1" --> "*" VoteTransaction : casts
    User "1" --> "*" HeartLog : has
    Poll "1" --> "*" VoteTransaction : receives
    Idol "1" --> "*" VoteTransaction : receives
    Poll "1" *-- "*" Candidate : contains
    Candidate "*" --> "1" Idol : references
```

---

## 6. API Specification

### 6.1 Authentication API (`/api/auth`)

| Method | Path                 | Access    | Purpose                                   |
| ------ | -------------------- | --------- | ----------------------------------------- |
| POST   | `/api/auth/register` | Public    | User registration (always creates `user`) |
| POST   | `/api/auth/login`    | Public    | User login & JWT issuance                 |
| GET    | `/api/auth/me`       | Logged-in | Fetch authenticated user profile          |

### 6.2 Users Management API (`/api/users`)

| Method | Path             | Access | Purpose                                           |
| ------ | ---------------- | ------ | ------------------------------------------------- |
| GET    | `/api/users`     | Admin  | List all users (password excluded)                |
| GET    | `/api/users/:id` | Admin  | Get single user                                   |
| PUT    | `/api/users/:id` | Admin  | Update user (role, heartBalance, username, email) |
| DELETE | `/api/users/:id` | Admin  | Delete a regular user                             |

Business rules:

- Admin cannot change their own `role`.
- Admin can change another user's `role`.
- Admin cannot delete another admin.
- Admin can delete a regular user.
- Deleting a user keeps their `VoteTransaction` and `HeartLog` records.

Filter parameters:

- `role`
- `username`
- `email`

### 6.3 Agencies Management API (`/api/agencies`)

| Method | Path                | Access | Purpose                                       |
| ------ | ------------------- | ------ | --------------------------------------------- |
| GET    | `/api/agencies`     | Public | Fetch all agencies                            |
| GET    | `/api/agencies/:id` | Public | Fetch single agency                           |
| POST   | `/api/agencies`     | Admin  | Add new agency                                |
| PUT    | `/api/agencies/:id` | Admin  | Update agency                                 |
| DELETE | `/api/agencies/:id` | Admin  | Delete agency (only if no Idol references it) |

Filter parameters:

- `name`
- `country`

Business rules:

- `name` must be unique.
- Deletion is rejected if any Idol references this agency (409 Conflict).

### 6.4 Idols Directory API (`/api/idols`)

| Method | Path             | Access | Purpose                           |
| ------ | ---------------- | ------ | --------------------------------- |
| GET    | `/api/idols`     | Public | Fetch all idols (populate agency) |
| GET    | `/api/idols/:id` | Public | Fetch single idol                 |
| POST   | `/api/idols`     | Admin  | Add new idol                      |
| PUT    | `/api/idols/:id` | Admin  | Update idol                       |
| DELETE | `/api/idols/:id` | Admin  | Delete idol                       |

Filter parameters:

- `category`
- `name`
- `agencyId`

Business rules:

- `agencyId` must reference an existing Agency.
- Deletion is rejected if the Idol is referenced by any Poll candidate.

### 6.5 Polls Management API (`/api/polls`)

| Method | Path             | Access | Purpose                             |
| ------ | ---------------- | ------ | ----------------------------------- |
| GET    | `/api/polls`     | Public | Fetch all polls with derived status |
| GET    | `/api/polls/:id` | Public | Fetch single poll with rankings     |
| POST   | `/api/polls`     | Admin  | Create poll                         |
| PUT    | `/api/polls/:id` | Admin  | Update poll                         |
| DELETE | `/api/polls/:id` | Admin  | Delete poll                         |

Filter parameters:

- `status=upcoming|active|ended`
- `from`
- `to`

Business rules:

- `startDate < endDate`.
- Candidates must reference existing Idols.
- No duplicate `idolId` within one poll.
- At least one candidate required.

### 6.6 Voting & Hearts API (`/api/votes`)

| Method | Path                  | Access    | Purpose                                              |
| ------ | --------------------- | --------- | ---------------------------------------------------- |
| POST   | `/api/votes/check-in` | User only | Claim daily check-in reward                          |
| POST   | `/api/votes/cast`     | User only | Spend hearts to vote                                 |
| GET    | `/api/votes/history`  | Logged-in | Personal voting and heart history (uses JWT user ID) |

Notes:

- `notAdmin` middleware blocks admins from `/check-in` and `/cast`.
- `/history` uses the current user from JWT, not a path parameter.

---

## 7. Frontend Views

### 7.1 The 8 Core Pages

1. `Home.jsx` - Landing page with featured active polls and top-ranked idols
2. `Login.jsx` - User login page
3. `Register.jsx` - User registration page
4. `PollList.jsx` - Active, upcoming, and past voting events
5. `PollDetail.jsx` - Voting room with leaderboard, progress bars, and voting modal
6. `IdolDirectory.jsx` - Searchable catalog of idols and groups
7. `UserProfile.jsx` - User dashboard: heart balance, check-in button, voting history
8. `AdminDashboard.jsx` - Admin console for agencies, idols, polls, users

### 7.2 Reusable Components

- `Navbar.jsx` - Navigation; shows Admin link only for admins
- `PollCard.jsx` - Poll summary card
- `ProtectedRoute.jsx` - Route guard (token + optional admin role)

### 7.3 Page Access

| Page           | User                  | Admin                 | Guest |
| -------------- | --------------------- | --------------------- | ----- |
| Home           | Yes                   | Yes                   | Yes   |
| Login          | Redirect if logged in | Redirect if logged in | Yes   |
| Register       | Redirect if logged in | Redirect if logged in | Yes   |
| PollList       | Yes                   | Yes                   | Yes   |
| PollDetail     | Yes                   | Yes                   | Yes   |
| IdolDirectory  | Yes                   | Yes                   | Yes   |
| UserProfile    | Yes                   | Yes                   | No    |
| AdminDashboard | No                    | Yes                   | No    |

### 7.4 Admin Dashboard Tabs

- Agencies
- Idols
- Polls
- Users

---

## 8. Image Handling

- MongoDB stores only image URL strings (`agencies.logoUrl`, `idols.avatarUrl`).
- Image files are stored externally.
- MVP uses external image links.
- Later upgrade path: Cloudinary.
- Upload endpoint `/api/upload` (Admin only) is planned for later.
- Local `uploads/` folder is not used as a production solution.

---

## 9. Project Directory Structure

```text
idol-vote-hub/
├── frontend/                       # React Frontend Project (MUI)
│   ├── public/
│   ├── src/
│   │   ├── components/             # Reusable UI Components (.jsx)
│   │   │   ├── Navbar.jsx
│   │   │   ├── PollCard.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/                  # 8 Core View Pages (.jsx)
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── PollList.jsx
│   │   │   ├── PollDetail.jsx
│   │   │   ├── IdolDirectory.jsx
│   │   │   ├── UserProfile.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── backend/                        # Express Backend Project
    ├── config/
    │   └── db.js
    ├── controllers/
    ├── middleware/
    │   ├── auth.js
    │   ├── admin.js
    │   └── notAdmin.js
    ├── models/
    │   ├── User.js
    │   ├── Agency.js
    │   ├── Idol.js
    │   ├── Poll.js
    │   ├── VoteTransaction.js
    │   └── HeartLog.js
    ├── routes/
    │   ├── auth.js
    │   ├── users.js
    │   ├── agencies.js
    │   ├── idols.js
    │   ├── polls.js
    │   └── votes.js
    ├── utils/
    │   └── seed.js
    ├── .env
    ├── package.json
    └── server.js
```

---

## 10. Mapping to Assessment Requirements

### 10.1 CU6 Backend

| Requirement                | Design                                                  |
| -------------------------- | ------------------------------------------------------- |
| ≥ 4 Schemas                | 6 (User, Agency, Idol, Poll, VoteTransaction, HeartLog) |
| ≥ 4 Collections            | 6                                                       |
| ≥ 4 API route groups       | 6 (auth, users, agencies, idols, polls, votes)          |
| ≥ 2 full CRUD route groups | 4 (users, agencies, idols, polls)                       |
| ≥ 2 search/filter APIs     | 4 (users, agencies, idols, polls)                       |
| Friendly errors            | Unified error middleware                                |
| Deployment                 | Migrate to MongoDB Atlas, deploy backend + frontend     |

### 10.2 CU2 Frontend

| Requirement       | Design                                                    |
| ----------------- | --------------------------------------------------------- |
| ≥ 8 pages         | 8                                                         |
| ≥ 2 user roles    | user, admin                                               |
| Admin Dashboard   | `AdminDashboard.jsx`                                      |
| RBAC              | `auth`, `admin`, `notAdmin` middleware + `ProtectedRoute` |
| Responsive design | MUI responsive layout                                     |

---

## 11. Development Phase Roadmap

| Phase | Goal                                                                |
| ----- | ------------------------------------------------------------------- |
| 0     | Define rules (done)                                                 |
| 1     | Backend skeleton, `/api/health` works                               |
| 2     | Connect to local MongoDB                                            |
| 3     | Write 6 Schemas                                                     |
| 4     | Authentication and authorization (auth, admin, notAdmin middleware) |
| 5     | Core business APIs: Users, Agencies, Idols, Polls, Votes            |
| 6     | Frontend skeleton                                                   |
| 7     | 8 pages                                                             |
| 8     | Integration, seed data                                              |
| 9     | Migrate to MongoDB Atlas, deploy backend + frontend                 |

Current progress: Phase 0 complete, ready for Phase 1.

---

## 12. Business Rules Summary

### 12.1 Voting

- 1 vote = 1 heart.
- Repeat voting on the same idol within the same poll is allowed.
- Voting only when poll status is `active`.
- Voting blocked when `upcoming` or `ended`.
- Admin cannot vote.

### 12.2 Check-in

- +50 hearts per day.
- No penalty for missed days.
- Uses `lastCheckIn` to determine eligibility.
- Writes a `HeartLog` with type `CHECK_IN`.
- Admin cannot check in.

### 12.3 Poll Lifecycle

- Status is derived from `startDate` and `endDate`.
- No `status` field stored.
- After `ended`: voting blocked, rankings and Fan Wall remain visible.
- Candidates must reference existing Idols.
- No duplicate Idols within one poll.

### 12.4 User Management

- Admin can view, update, delete users.
- Admin cannot change their own role.
- Admin can change another user's role.
- Admin cannot delete another admin.
- Deleting a user keeps VoteTransaction and HeartLog records.

### 12.5 Agency Management

- Agency `name` is unique.
- Cannot delete an agency if any Idol references it.
- Idol creation/update requires a valid `agencyId`.
- Agency deletion returns 409 Conflict if in use.

### 12.6 Idol Management

- `agencyId` is required.
- Cannot delete an idol if referenced by any Poll candidate.

### 12.7 Data Integrity

- `Idol.totalVotes` and `Poll.candidates.voteCount` are redundant counters.
- Inconsistency between them is accepted (no transactions).
- Logs (`VoteTransaction`, `HeartLog`) are append-only.

---

## 13. Environment Variables

### 13.1 Local Development (`.env`)

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/idol-vote-hub
JWT_SECRET=dev_secret_change_me_later
```

### 13.2 Deployment (later)

```
PORT=<provided by platform>
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/idol-vote-hub
JWT_SECRET=<strong random string>
```

---

## 14. Open Questions and Follow-ups

1. Inconsistency between `Idol.totalVotes` and `Poll.candidates.voteCount` is acceptable.
2. Whether to freeze poll results after a poll ends: not freezing for now.
3. `VoteTransaction` keeps `pollId` to distinguish which poll a vote belongs to.
4. Anti-abuse, CAPTCHA, IP limiting, and email verification are postponed.
5. No refresh token; when JWT expires, user logs in again.
6. No WebSocket; rankings rely on polling or manual refresh.
7. Seed script (`utils/seed.js`) will generate test data.
8. Admin account is manually added.
9. Image upload via `/api/upload` is planned but not yet implemented.
10. Deployment requires migrating from local MongoDB to MongoDB Atlas.

---

```
