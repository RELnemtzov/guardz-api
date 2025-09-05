# Simple Server - Guardz

## Info

`POST /urls` - 
This implementation will store supplied URLs submitted by the caller's IP address upon using

`GET /urls`
Calling this from an IP address used to store URLs will return said URLs.

## Implementation Info
This was implemented using an in-memory repository for simplicity, but should be relatively easy to switch for a proper DB or other.

Calling via the same IP address will add to the URL list for that IP.

The caller IP will be taken by header `x-forwarded-for` if it exists, and if not will fall back to the Express socket IP.

This was done to allow for easy simulating in testing, but in practice should really be without the ability to set be header.

## Building 

Run `npm run build`

## Deployment
The code (`dist` directory) has already been deployed to the GCP instance provided, via the following command:

    tar -czf - guardz-api/package*.json guardz-api/dist | ssh -i id_ed25519 candidate@34.45.52.204 "tar -xzf - -C ~"

Then on the GCP instance I ran:

    # nvm install from here: https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
    nvm install --lts
    cd ~/guardz-api
    npm ci --only=production
    
    # Run on server
    npm run start:prod &
    

## Running
Run locally via the following:

    npm run start

This will start the server on port 8080 as per configuration in the `.env` file.

## Querying
Once the server is running on the GCP instance you can test via cURL:

1. Submit URLs for client `100.99.98.97`:

        curl -X POST http://34.45.52.204:8080/urls \
            -H "Content-Type: application/json" \
            -H "X-Forwarded-For: 100.99.98.97" \
            -d '{"urls":["http://blabla1.com","http://blabla2.com"]}'

2. Submit URLs for client `1.2.3.4`:

        curl -X POST http://34.45.52.204:8080/urls \
            -H "Content-Type: application/json" \
            -H "X-Forwarded-For: 1.2.3.4" \
            -d '{"urls":["http://bob.loblaw-law.blog"]}'

3. Retrieve URLs for client `100.99.98.97`:

        curl -X GET http://34.45.52.204:8080/urls \
            -H "X-Forwarded-For: 100.99.98.97"

4. Expected output, timestamps represent the time of the submit call of each URL:

        [
            { "url": "http://blabla1.com", "timestamp": 1693931285123 },
            { "url": "http://blabla2.com", "timestamp": 1693931285124 }
        ]
5. Retrieve URLs for client `1.2.3.4`:

        curl -X GET http://34.45.52.204:8080/urls \
            -H "X-Forwarded-For: 1.2.3.4"

6. Expected output, timestamps represent the time of the submit call of each URL:

        [
            { "url": "http://bob.loblaw-law.blog", "timestamp": 1693931286123 }
        ]

## Tests
Tests for the same were added in the test files:
* Jest tests: `app.controller.spec.ts`
* E2E tests: `app.e2e-spec.ts`
