## Overview
Automated workflow to generate leads from Google Maps, evaluate their websites with an AI model, qualify them by UI score, and place outbound calls via Vapi. Results are logged to Google Sheets for tracking.

## How It Works
1. Webhook receives campaign parameters (niche, location, max results).
2. Normalize input and scrape Google Places via Apify.
3. Extract and normalize lead data (name, phone, address, etc.).
4. Deduplicate leads by phone number.
5. For each lead with a website, fetch the site content.
6. Wait briefly, then use an AI agent (Nemotron via OpenRouter) to score the website UI (0‑10).
7. Parse the score; leads with UI score < 7 are considered needing redesign and move to call queue.
8. Qualified leads are appended to a Google Sheet.
9. The workflow reads the sheet, loops through leads one‑by‑one, normalizes phone to E.164, triggers a Vapi call.
10. After a 3‑minute wait per call, it waits for the Vapi result webhook, parses outcome, and updates the sheet with call summary and score.

## Nodes & Tools Used
| Node | Purpose |
|------|---------|
| Webhook (Lovable UI Trigger) | Accepts campaign start request |
| Set (Normalize Input) | Standardizes niche, location, maxResults |
| HTTP Request (Scrape Google Maps via Apify) | Calls Apify actor to get place data |
| Code (Extract and Normalize Leads) | Parses Apify output, normalizes phones |
| Remove Duplicates (Deduplicate by Phone) | Ensures unique leads |
| IF (If) | Splits leads with vs without website |
| HTTP Request (Fetch Website HTML) | Retrieves site markup via Firecrawl |
| Wait (Wait Before Scoring) | Small delay before AI scoring |
| LangChain Chat OpenRouter (Nemotron via OpenRouter) | Provides LLM for UI evaluation |
| LangChain Agent (Evaluate Website UI Score) | Runs prompt to score website UI |
| Code (Parse UI Score) | Extracts UI score from LLM output |
| IF (Ui Filter) | Routes low‑score leads to call queue |
| Merge (Merge Qualified Leads) | Combines leads needing calls |
| Google Sheets (Save Leads to Google Sheets) | Logs qualified leads |
| Google Sheets (Read Leads for Calling) | Reads sheet for dialing |
| SplitInBatches (Loop Leads One by One) | Processes leads sequentially |
| Code (Normalize Phone E.164) | Ensures E.164 format for Vapi |
| HTTP Request (Trigger Vapi Call) | Starts outbound call via Vapi |
| Wait (Wait 3 Minutes) | Pauses between calls |
| Webhook (Vapi Call Result Webhook) | Receives call outcome |
| Code (Parse Vapi Call Result) | Extracts call summary/score |
| Google Sheets (Update Sheet with Call Result) | Writes call results back |
| RespondToWebhook (Respond to Webhook) | Returns initial acknowledgment |
| NoOp nodes (Discard, Campaign Complete) | Placeholders for flow control |

## Prerequisites
- An n8n instance (self‑hosted or n8n.cloud)
- Apify account with token for the Google Places crawler
- Firecrawl API key for website scraping
- OpenRouter API key (or credentials) to access the Nemotron model
- Vapi account with Assistant ID and Phone Number ID
- Google Cloud project with Google Sheets API enabled and OAuth credentials for n8n
- A Google Sheet prepared with the column headers used in the workflow (or let the node create them)

## Setup & Usage
1. Import the workflow JSON into your n8n instance (Import → Workflow).
2. Replace placeholder credential IDs (REPLACE_WITH_YOUR_CREDENTIAL_ID) with your own credential entries for:
   - Apify (if using header token, you can keep as header; otherwise create an API key credential)
   - Firecrawl (Authorization header)
   - OpenRouter (API key)
   - Vapi (Authorization header)
   - Google Sheets (OAuth2)
3. In the Normalize Input node, adjust default values if needed.
4. In the Scrape Google Maps via Apify node, insert your Apify token.
5. In the Fetch Website HTML node, insert your Firecrawl API key.
6. In the Nemotron via OpenRouter node, select your OpenRouter credential.
7. In the Trigger Vapi Call node, insert your Vapi token.
8. In each Google Sheets node, select the appropriate spreadsheet and worksheet (or create new).
9. Activate the workflow.
10. Send a POST request to the webhook URL (/webhook/cold-call-campaign) with JSON body:
    niche: "plumber"
    location: "Austin, TX"
    maxResults: 20
11. Monitor the Google Sheet for leads, UI scores, and call outcomes.

## Use Cases
- Marketing agencies that want to identify local businesses with outdated websites and offer redesign services via cold outreach.
- Sales teams automating lead enrichment and outreach for web‑development or SEO consultancies.
- Freelancers building a pipeline to prospect small‑business owners who need a website refresh.
- Any organization needing a scalable, AI‑assisted cold‑calling workflow that logs results transparently.