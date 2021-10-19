# App Platform

A crude demonstration of a first step toward supporting an app platform for Checkfront.

## Cloning

`git clone --recurse-submodules`

## Refreshing Submodules

`git submodule update --init --recursive --remote --force`

## Limitations

This application is built as a separate service to core, so it currently has no deployment strategy. More of this will be shared in an architectural review on Demo day.

## Major Caveats

The primary caveats are related to user authentication and app authorization:

1. Authentication is basically omitted, which limits this to a being a local demo
2. App credential creation is restricted to https://test.checkfront.com/manage/developer

## Workarounds

To work around the aforementioned caveats, App Platform will expect the following environment variables when launching in `.env.local`:

1. `NEXT_PUBLIC_CF_COMPANY=test`
2. `CF_API_KEY=`
3. `CF_API_SECRET=`

Because the initial version of App Platform does not support user authentication via Oauth2, traditional API tokens are used to authorize App Platform to a given Checkfront instance.

App Platform will run on port `80` in development, so you will have to change Core's exposed HTTP port in [docker-compose.yml](https://bitbucket.org/checkfront/booking-manager/src/main/docker-compose.yml#lines-12) to not conflict.

## Installing

`yarn`

## Running

`yarn dev`

## Not Implemented

- User Authentication

## Informational Slides

https://lucid.app/lucidchart/0e48360c-ffb3-43eb-8491-20bf9b726545/edit?invitationId=inv_ab01d114-e0af-4907-91c4-b3eb3136c933
