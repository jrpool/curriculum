# DEVELOPMENT

## Dev Environment Setup

Install and run Node v8.1.2

#### Set up and run [mehserve](https://github.com/timecounts/mehserve)
```
echo 3233 > ~/.mehserve/curriculum.learnersguild
mehserve run
```

#### If you have not already, set up and run [IDM](https://github.com/LearnersGuild/idm/)

#### If you have not already, set up and run [Echo](https://github.com/LearnersGuild/echo/)

#### Set up repo

First, fork and clone the curriculum repository.

#### Install Node Packages

```bash
npm install
```

#### Creating your `.env` file

Create a `.env` file like this (making the substitution described in `<…>`):

```
PORT=3233
DATABASE_URL=postgres://localhost:5432/lg-curriculum
IDM_BASE_URL=http://idm.learnersguild.dev
ECHO_BASE_URL=http://echo.learnersguild.dev
JWT_PUBLIC_KEY="<get from .env.development file in your IDM directory>"
LOG_SQL_QUERIES=1
```

_NOTE: you can set `DISABLE_IDM=1` to disable authentication to IDM_

#### Set up the Postgresql Database

```sh
createdb lg-curriculum
npm run db:migrate
```

#### Start the server in development mode

```sh
npm run dev
```
