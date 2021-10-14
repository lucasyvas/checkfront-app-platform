# App Platform

A crude demonstration of a first step toward supporting an app platform for Checkfront.

## Limitations

Persistent storage relating to which apps have been authorized has been omitted for demonstration simplicity - killing the server will clear all memory of previously authorized applications.

## Major Caveats

The primary caveats are related to user authentication and app authorization:

1. Authentication is basically omitted, which limits this to a being a local demo
2. App credential creation is restricted to https://test.checkfront.com/manage/developer

## Workarounds

To work around the aforementioned caveats, App Platform will expect two environment variables when launching in `.env.local`:

1. `NEXT_PUBLIC_CF_COMPANY=test`
2. `CF_CONSUMER_KEY=`

`CF_CONSUMER_KEY` assumes that a _single_ Oauth2 credential is configured in Checkfront Core for the *entirety* of App Platform. This is completely inadqueate for several reasons, but since no API currently exists in core to generate Oauth2 credentials on demand, the user would have to manually generate a consumer key in core and paste it into app platform. For the purposes of this demo, we don't want to do that, so App Platform is limited to a single API credential.

App Platform will run on port `80` in development, so you will have to change Core's exposed HTTP port in `docker-compose.yml` to not conflict.

## Installing

`yarn`
## Running

`yarn dev`

## Not Implemented

A lot of important stuff!

- Authentication
- App auth credential refresh
- Proper app access revocation
- Persistent storage

