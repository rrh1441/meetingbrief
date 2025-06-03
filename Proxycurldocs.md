---
url: "https://nubela.co/proxycurl/docs#explain-it-to-me-like-i-39-m-5-search-api"
title: "Search API – API Docs"
---

[NAV\\
 ![](https://nubela.co/proxycurl/docs/proxycurl/images/navbar.png)](https://nubela.co/proxycurl/docs#)

[![](https://nubela.co/proxycurl/docs/proxycurl/images/logo.png)](https://nubela.co/proxycurl)

- [Proxycurl Overview](https://nubela.co/proxycurl/docs#proxycurl-overview)  - [Open API 3.0](https://nubela.co/proxycurl/docs#proxycurl-overview-open-api-3-0)
  - [Authentication](https://nubela.co/proxycurl/docs#proxycurl-overview-authentication)
  - [Rate limit](https://nubela.co/proxycurl/docs#proxycurl-overview-rate-limit)
  - [Credits](https://nubela.co/proxycurl/docs#proxycurl-overview-credits)
  - [Timeouts and API response time](https://nubela.co/proxycurl/docs#proxycurl-overview-timeouts-and-api-response-time)
  - [Errors](https://nubela.co/proxycurl/docs#proxycurl-overview-errors)
  - [Backward Compatibility Guarantee](https://nubela.co/proxycurl/docs#proxycurl-overview-backward-compatibility-guarantee)
- [Explain it to me like I'm 5](https://nubela.co/proxycurl/docs#explain-it-to-me-like-i-39-m-5)  - [School API](https://nubela.co/proxycurl/docs#explain-it-to-me-like-i-39-m-5-school-api)
  - [Company API](https://nubela.co/proxycurl/docs#explain-it-to-me-like-i-39-m-5-company-api)
  - [People API](https://nubela.co/proxycurl/docs#explain-it-to-me-like-i-39-m-5-people-api)
  - [Customer API](https://nubela.co/proxycurl/docs#explain-it-to-me-like-i-39-m-5-customer-api-experimental)
  - [Jobs API](https://nubela.co/proxycurl/docs#explain-it-to-me-like-i-39-m-5-jobs-api)
  - [Contact API](https://nubela.co/proxycurl/docs#explain-it-to-me-like-i-39-m-5-contact-api)
  - [Search API](https://nubela.co/proxycurl/docs#explain-it-to-me-like-i-39-m-5-search-api)
  - [Meta API](https://nubela.co/proxycurl/docs#explain-it-to-me-like-i-39-m-5-meta-api)
- [Test Proxycurl API with Postman](https://nubela.co/proxycurl/docs#test-proxycurl-api-with-postman)  - [Requirements](https://nubela.co/proxycurl/docs#test-proxycurl-api-with-postman-requirements)
  - [Testing out Proxycurl API with Postman](https://nubela.co/proxycurl/docs#test-proxycurl-api-with-postman-testing-out-proxycurl-api-with-postman)
- [Enrichment within Google Sheets](https://nubela.co/proxycurl/docs#enrichment-within-google-sheets)  - [Prerequisites](https://nubela.co/proxycurl/docs#enrichment-within-google-sheets-prerequisites)
  - [How to Get Started with Sapiengraph](https://nubela.co/proxycurl/docs#enrichment-within-google-sheets-how-to-get-started-with-sapiengraph)
- [Libraries](https://nubela.co/proxycurl/docs#libraries)  - [Python SDK](https://nubela.co/proxycurl/docs#libraries-python-sdk)
  - [Using proxycurl-py](https://nubela.co/proxycurl/docs#libraries-using-proxycurl-py)
  - [Javascript/NodeJS SDK](https://nubela.co/proxycurl/docs#libraries-javascript-nodejs-sdk)
- [School API](https://nubela.co/proxycurl/docs#school-api)  - [School Profile Endpoint](https://nubela.co/proxycurl/docs#school-api-school-profile-endpoint)
  - [Student Listing Endpoint](https://nubela.co/proxycurl/docs#school-api-student-listing-endpoint)
- [Company API](https://nubela.co/proxycurl/docs#company-api)  - [Company Profile Endpoint](https://nubela.co/proxycurl/docs#company-api-company-profile-endpoint)
  - [Employee Listing Endpoint](https://nubela.co/proxycurl/docs#company-api-employee-listing-endpoint)
  - [Employee Count Endpoint](https://nubela.co/proxycurl/docs#company-api-employee-count-endpoint)
  - [Company Profile Picture Endpoint](https://nubela.co/proxycurl/docs#company-api-company-profile-picture-endpoint)
  - [Company Lookup Endpoint](https://nubela.co/proxycurl/docs#company-api-company-lookup-endpoint)
  - [Employee Search Endpoint](https://nubela.co/proxycurl/docs#company-api-employee-search-endpoint)
- [People API](https://nubela.co/proxycurl/docs#people-api)  - [Person Profile Endpoint](https://nubela.co/proxycurl/docs#people-api-person-profile-endpoint)
  - [Person Profile Picture Endpoint](https://nubela.co/proxycurl/docs#people-api-person-profile-picture-endpoint)
  - [Person Lookup Endpoint](https://nubela.co/proxycurl/docs#people-api-person-lookup-endpoint)
  - [Role Lookup Endpoint](https://nubela.co/proxycurl/docs#people-api-role-lookup-endpoint)
- [Customer API `EXPERIMENTAL`](https://nubela.co/proxycurl/docs#customer-api-experimental)  - [Customer Listing Endpoint](https://nubela.co/proxycurl/docs#customer-api-code-experimental-code-customer-listing-endpoint-experimental)
  - [Customer Listing Count Endpoint](https://nubela.co/proxycurl/docs#customer-api-code-experimental-code-customer-listing-count-endpoint-experimental)
  - [Follower Listing Endpoint](https://nubela.co/proxycurl/docs#customer-api-code-experimental-code-follower-listing-endpoint-experimental)
  - [Follower Listing Count Endpoint](https://nubela.co/proxycurl/docs#customer-api-code-experimental-code-follower-listing-count-endpoint-experimental)
- [Jobs API](https://nubela.co/proxycurl/docs#jobs-api)  - [Job Search Endpoint](https://nubela.co/proxycurl/docs#jobs-api-job-search-endpoint)
  - [Jobs Listing Count Endpoint](https://nubela.co/proxycurl/docs#jobs-api-jobs-listing-count-endpoint)
  - [Job Profile Endpoint](https://nubela.co/proxycurl/docs#jobs-api-job-profile-endpoint)
- [Contact API](https://nubela.co/proxycurl/docs#contact-api)  - [Reverse Email Lookup Endpoint](https://nubela.co/proxycurl/docs#contact-api-reverse-email-lookup-endpoint)
  - [Reverse Contact Number Lookup Endpoint](https://nubela.co/proxycurl/docs#contact-api-reverse-contact-number-lookup-endpoint)
  - [Work Email Lookup Endpoint](https://nubela.co/proxycurl/docs#contact-api-work-email-lookup-endpoint)
  - [Disposable Email Address Check Endpoint](https://nubela.co/proxycurl/docs#contact-api-disposable-email-address-check-endpoint)
  - [Personal Contact Number Lookup Endpoint](https://nubela.co/proxycurl/docs#contact-api-personal-contact-number-lookup-endpoint)
  - [Personal Email Lookup Endpoint](https://nubela.co/proxycurl/docs#contact-api-personal-email-lookup-endpoint)
- [Search API](https://nubela.co/proxycurl/docs#search-api)  - [Company Search Endpoint](https://nubela.co/proxycurl/docs#search-api-company-search-endpoint)
  - [Person Search Endpoint](https://nubela.co/proxycurl/docs#search-api-person-search-endpoint)
  - [Job Search Endpoint](https://nubela.co/proxycurl/docs#search-api-job-search-endpoint)
- [Meta API](https://nubela.co/proxycurl/docs#meta-api)  - [View Credit Balance Endpoint](https://nubela.co/proxycurl/docs#meta-api-view-credit-balance-endpoint)

# Proxycurl Overview

Proxycurl API is a set of tools designed to serve as plumbing for fresh and processed data in your application. We sit as a fully-managed layer between your application and raw data so that you can focus on building the application instead of worrying about scraping and processing data at scale.

With Proxycurl API, you can

- Look up people
- Look up companies
- Enrich people profiles
- Enrich company profiles
- Look up the contact information of people and companies
- Check if an email address is disposable

## Open API 3.0

Download [Proxycurl's OpenAPI 3.0 specifications](https://nubela.co/proxycurl/docs/openapi-3.0.yaml).

## Authentication

Proxycurl's API uses bearer tokens to authenticate users.
Each user is assigned a randomly generated secret key under the [API section in the dashboard](https://nubela.co/proxycurl/dashboard).

The bearer token is injected in the `Authorization` header

```
curl \
    -G \
    -H "Authorization: Bearer ${YOUR_API_KEY}" \
    'https://nubela.co/proxycurl/api/v2/linkedin' \
    --data-urlencode 'url=https://www.linkedin.com/in/williamhgates'

```

```
import requests

api_key = 'YOUR_API_KEY'
headers = {'Authorization': 'Bearer ' + api_key}
api_endpoint = 'https://nubela.co/proxycurl/api/v2/linkedin'
linkedin_profile_url = 'https://www.linkedin.com/in/williamhgates'

response = requests.get(api_endpoint,
                        params={'url': linkedin_profile_url},
                        headers=headers)

```

## Rate limit

You can make up to 300 requests to our API every minute. The window for the rate limit is 5 minutes. So you can burst up to 1500 requests every 5 minutes.

At periods of high load, our system might tighten rate limits for all accounts to ensure that our services remain accessible for all users.

We return a status code of error 429 when you are rate limited. You can also get a status code error of 429 if the capacity on our end limits us.

You should handle 429 errors and apply exponential backoff.

Accounts on trial (that is before any top ups have been made) are limited to 2 requests every minute. You get the normal rate limit upon making at least one credit top-up.

### Rate limit for Free APIs

To sustainably provide free APIs, rate limit for free APIs depends on your subscription plan:

- PAYG plan: 2 requests/min
- $49/mo plan: 20 requests/min
- $299/mo plan: 50 requests/min
- $899/mo plan: 100 requests/min
- $1899/mo plan: 300 requests/min

## Credits

Each valid request requires at least `1` credit to be processed.

A credit is consumed if and only if the request is parsed successfully.

A successful request is a request that returns with either a `200` or `404` HTTP status code.

`404` status code is considered a successful request because we have commited resources to source the profile and have found that it is not a valid profile.

## Timeouts and API response time

Proxycurl API endpoints take an average of 2 seconds to complete.

You are encouraged to make concurrent requests to our API service to maximize throughput. See [this post](https://nubela.co/blog/how-to-maximize-throughput-on-proxycurl/) on how you can maximise throughput.

We recommend a timeout of 60 seconds.

## Errors

These are the common errors that could be returned by our API:

| HTTP Code | Charge? | Description |
| --- | --- | --- |
| 400 | No | Invalid parameters provided. Refer to the documentation and message body for more info |
| 401 | No | Invalid API Key |
| 403 | No | You have run out of credits |
| 404 | Yes | The requested resource (e.g: user profile, company) could not be found |
| 410 | No | This API is deprecated |
| 429 | No | Rate limited. Please retry |
| 500 | No | There is an error with our API. Please [Contact us](mailto:steven@nubela.co) for assistance |
| 503 | No | Enrichment failed, please retry. |

You will never be charged for **errors that represent failure**. However, in our case, 404s represent successful queries that discovered a lack of data. Therefore, while we do return a status code of 404 for compatibility reasons, we do not view a lack of data as a true error, and we do charge.

## Backward Compatibility Guarantee

We are committed to ensuring that our API remains backward compatible, allowing you to integrate with confidence. Our backward compatibility guarantee means that we will not introduce changes that break existing functionality or remove endpoints without a deprecation period.

To be specific, we will not introduce breaking changes in the following ways:

1. We will not remove documented parameters and response attributes.
2. We will not change the data type as documented in our API responses.

However, the following are not considered breaking changes:

- Adding attributes/parameters to API endpoints without prior notice.
- Adding additional response or requests headers to our API endpoints without prior notice.

We highly recommend you to integrate our API in a way that would not break should new response attributes or headers be introduced.

If we make changes to our API, we will provide clear documentation and sufficient notice (30 days) to ensure a seamless transition. Notices will be shared via newsletter emails, Twitter/X posts and updates to our blog.

# Explain it to me like I'm 5

## School API

| What you have | What you get | Which API Endpoint to use? |
| --- | --- | --- |
| LinkedIn (School) Profile URL | Profile data with profile picture, school location, etc | [School Profile Endpoint](https://nubela.co/proxycurl/docs#school-api-school-profile-endpoint) |
| LinkedIn (School) Profile URL | List of students | [Student Listing Endpoint](https://nubela.co/proxycurl/docs#school-api-student-listing-endpoint) |

## Company API

| What you have | What you get | Which API Endpoint to use? |
| --- | --- | --- |
| LinkedIn (Company) Profile URL | Profile data with profile picture, office locations, etc | [Company Profile Endpoint](https://nubela.co/proxycurl/docs#company-api-linkedin-company-profile-endpoint) |
| LinkedIn (Company) Profile URL | Number of employees in a company | [Employee Count Endpoint](https://nubela.co/proxycurl/docs#company-api-employee-count-endpoint) |
| LinkedIn (Company) Profile URL | List of employees | [Employee Listing Endpoint](https://nubela.co/proxycurl/docs#enrichment-api-linkedin-employee-listing-endpoint) |
| LinkedIn (Company) Profile URL | Profile picture of a company | [Company Profile Picture Endpoint](https://nubela.co/proxycurl/docs#company-api-company-profile-picture-endpoint) |
| Company name or company domain | LinkedIn (Company) Profile URL | [Company Lookup Endpoint](https://nubela.co/proxycurl/docs#company-api-company-lookup-endpoint) |
| LinkedIn (Company) Profile URL | List of employees | [Employee Search Endpoint](https://nubela.co/proxycurl/docs#company-api-employee-search-api-endpoint) |

## People API

| What you have | What you get | Which API Endpoint to use? |
| --- | --- | --- |
| LinkedIn (Person) Profile URL | Profile data with profile picture, job history, etc. | [Person Profile Endpoint](https://nubela.co/proxycurl/docs#people-api-linkedin-person-profile-endpoint) |
| First name and Company domain | LinkedIn (Person) Profile URL | [Person Lookup Endpoint](https://nubela.co/proxycurl/docs#people-api-person-lookup-endpoint) |
| LinkedIn (Person) Profile URL | Profile picture of a person | [Person Profile Picture Endpoint](https://nubela.co/proxycurl/docs#people-api-person-profile-picture-endpoint) |

## Customer API `EXPERIMENTAL`

| What you have | What you get | Which API Endpoint to use? |
| --- | --- | --- |
| LinkedIn (Company) Profile URL | A list of probable customers of the target company. | [Customer Listing Endpoint](https://nubela.co/proxycurl/docs#customer-api-experimental-customer-listing-endpoint-experimental) |
| LinkedIn (Company) Profile URL | Number of probable customers of the target company. | [Customer Listing Count Endpoint](https://nubela.co/proxycurl/docs#customer-api-experimental-customer-listing-count-endpoint-experimental) |
| LinkedIn (Company) Profile URL or Twitter/X Profile URL | A list of individual followers of the company | [Follower Listing Endpoint](https://nubela.co/proxycurl/docs#customer-api-experimental-follower-listing-endpoint-experimental) |
| LinkedIn (Company) Profile URL or Twitter/X Profile URL | Count individuals of that company's followers | [Follower Listing Count Endpoint](https://nubela.co/proxycurl/docs#customer-api-experimental-follower-listing-count-endpoint-experimental) |

## Jobs API

| What you have | What you get | Which API Endpoint to use? |
| --- | --- | --- |
| LinkedIn (Company) Profile URL | Detailed job data | [Job Profile Endpoint](https://nubela.co/proxycurl/docs#jobs-api-job-profile-endpointhttps) |
| LinkedIn (Company) Profile URL | List of open job position | [Job Search Endpoint](https://nubela.co/proxycurl/docs#jobs-api-jobs-listing-endpoint) |
| LinkedIn (Company) Profile URL | Count number of jobs posted | [Jobs Listing Count Endpoint](https://nubela.co/proxycurl/docs#jobs-api-jobs-listing-count-endpoint) |

## Contact API

| What you have | What you get after lookup | Which API Endpoint to use? |
| --- | --- | --- |
| Linkedin (Person) Profile URL | Work Email Address | [Work Email Lookup Endpoint](https://nubela.co/proxycurl/docs#contact-api-work-email-lookup-endpoint) |
| Twitter, Facebook, or LinkedIn (Person) Profile URL | List of Personal Emails | [Personal Email Lookup Endpoint](https://nubela.co/proxycurl/docs#contact-api-personal-email-lookup) |
| Email Address | Disposable Email Check | [Disposable email Endpoint](https://nubela.co/proxycurl/docs#contact-api-disposable-email-address-check-endpoint) |
| Email Address | Twitter, Facebook, and LinkedIn (Person) Profile URL | [Reverse Email Lookup Endpoint](https://nubela.co/proxycurl/docs#contact-api-reverse-work-email-lookup-endpoint) |
| Phone Number | Twitter, Facebook, and LinkedIn Profile URL | [Reverse Contact Number Lookup Endpoint](https://nubela.co/proxycurl/docs#contact-api-reverse-contact-number-lookup-endpoint) |

## Search API

| What you have | What you get | Which API Endpoint to use? |
| --- | --- | --- |
| Any of the 20+ company's attributes | List of LinkedIn (Company) Profile URL | [Company Search Endpoint](https://nubela.co/proxycurl/docs#search-api-company-search-endpoint) |
| Country & any of the 40+ person's attributes | List of LinkedIn (Person) Profile URL | [Person Search Endpoint](https://nubela.co/proxycurl/docs#search-api-person-search-endpoint) |
| LinkedIn (Company) Profile URL | List of open job position | [Job Search Endpoint](https://nubela.co/proxycurl/docs#jobs-api-jobs-listing-endpoint) |

## Meta API

| What you have | What you get | Which API Endpoint to use? |
| --- | --- | --- |
| A Proxycurl API Key | Balance of credits | [View Credit Balance Endpoint](https://nubela.co/proxycurl/docs#meta-api-view-credit-balance-endpoint) |

# Test Proxycurl API with Postman

[Postman](http://postman.com/) is a tool that lets you test out API services easily.
We have built a Postman Collection that will let you easily test out Proxycurl API without writing code.
This is how you can start testing out

## Requirements

- A _Proxycurl API Key_.
Register a Proxycurl account [here](https://nubela.co/proxycurl/auth/register).
- Have an account on [Postman](https://www.postman.com/), and be logged in.

## Testing out Proxycurl API with Postman

1. Visit [Proxycurl's Postman Collection](https://pxlcl.co/proxycurl-postman-collection), and **Fork** it.
Give it a _Fork label_ and Workspace, and click " _Fork Collection_"
2. Go to https://web.postman.co/home and visit the Workspace for which you forked Proxycurl's Postman collection into.
3. Click on "Proxycurl" collection under the workspace.
4. Under the "Auth" tab, enter the _Proxycurl API Key_ under "Token".
5. You are done.
You can now explore any Proxycurl API Endpoints by clicking into the API endpoint.
6. To make API requests, modify parameter values and click "Send".
You will see then a response.

# Enrichment within Google Sheets

[Sapiengraph ↗](https://sapiengraph.com/) is a Google Sheets Add-on developed and maintained by our team. It offers the same enrichment capabilities as Proxycurl but packaged as custom formulas within Google Sheets.

The functionalities of Sapiengraph within Google Sheets include:

- Enriching a **person's profile** with over 50 attributes, such as first/last name, current place of employment, gender, salary range, among others.
- Resolving an **email address** to the owner's social media profiles on LinkedIn, Twitter, Facebook, and Github.
- Enriching a **company profile** with more than 27 attributes, including funding data, office locations, industry, and more.
- Listing a company's employees.
- Searching within a company's employee database.
- Finding the **phone number**, **personal email**, and **work email** of any individual online.
- And much more!

## Prerequisites

- Google Chrome or any Chromium-based browser.
- Google Sheets

## How to Get Started with Sapiengraph

1. Visit [Sapiengraph ↗](https://sapiengraph.com/) to start the onboarding process.

# Libraries

## Python SDK

We built Proxycurl with concurrency in mind. This is why we set out to develop our Python SDK around the various concurrency models that Python offers. [proxycurl-py](https://pypi.org/project/proxycurl-py/) is our officially supported Python library published on [PyPi](https://pypi.org/project/proxycurl-py/).

[proxycurl-py](https://pypi.org/project/proxycurl-py/) supports _asyncio_, _gevent_ and _twisted_ concurrency models.

[proxycurl-py](https://pypi.org/project/proxycurl-py/) is tested on Python 3.7, 3.8 and 3.9.

[proxycurl-py](https://pypi.org/project/proxycurl-py/) is open-sourced and has its [own Github repository](https://github.com/nubelaco/proxycurl-py-linkedin-profile-scraper). So feel free to make pull requests or fork it.

Get started with [proxycurl-py](https://pypi.org/project/proxycurl-py/) today by adding it to your Python 3 project with the following commands:

```
# install proxycurl-py with asyncio
$ pip install 'proxycurl-py[asyncio]'

# install proxycurl-py with gevent
$ pip install 'proxycurl-py[gevent]'

# install proxycurl-py with twisted
$ pip install 'proxycurl-py[twisted]'

```

## Using proxycurl-py

Here is how you can enrich a LinkedIn Profile URL with it's profile data:

```
from proxycurl.asyncio import Proxycurl
import asyncio

proxycurl = Proxycurl()
person = asyncio.run(proxycurl.linkedin.person.get(
    url='https://www.linkedin.com/in/williamhgates/'
))
print('Person Result:', person)

```

## Javascript/NodeJS SDK

You can find our Javascript/NodeJS library on Github [here](https://github.com/nubelaco/proxycurl-js-linkedin-profile-scraper).

You can add install the library by running:

```
$ npm install proxycurl-js-linkedin-profile-scraper

```

# School API

## School Profile Endpoint

`GET /proxycurl/api/linkedin/school`

Cost: `1` credit / successful request.
Extra charges might be incurred if premium optional parameters are used. Please read the description of the parameters that you intend to use. Credits are charged even if a successful request returns an empty result.

Get structured data of a LinkedIn School Profile

```
curl \
    -G \
    -H "Authorization: Bearer ${YOUR_API_KEY}" \
    'https://nubela.co/proxycurl/api/linkedin/school' \
    --data-urlencode 'url=https://www.linkedin.com/school/national-university-of-singapore' \
    --data-urlencode 'use_cache=if-present'

```

```
import requests

api_key = 'YOUR_API_KEY'
headers = {'Authorization': 'Bearer ' + api_key}
api_endpoint = 'https://nubela.co/proxycurl/api/linkedin/school'
params = {
    'url': 'https://www.linkedin.com/school/national-university-of-singapore',
    'use_cache': 'if-present',
}
response = requests.get(api_endpoint,
                        params=params,
                        headers=headers)

```

[![Run in Postman](https://run.pstmn.io/button.svg)](https://pxlcl.co/run-collection)

### URL Parameters

| Parameter | Required | Description | Example |
| --- | --- | --- | --- |
| `url` | yes | URL of the LinkedIn School Profile to crawl.<br>URL should be in the format of `https://www.linkedin.com/school/<public_identifier>` | `https://www.linkedin.com/school/national-university-of-singapore` |
| `use_cache` | no | `if-present` The default behavior.Fetches profile from cache regardless of age of profile. If profile is not available in cache, API will attempt to source profile externally.<br>`if-recent` API will make a best effort to return a fresh profile no older than 29 days.Costs an extra `1` credit on top of the cost of the base endpoint. | `if-present` |

### Response

```
{
    "affiliated_companies": [],
    "background_cover_image_url": "https://s3.us-west-000.backblazeb2.com/proxycurl/company/national-university-of-singapore/cover?X-Amz-Algorithm=AWS4-HMAC-SHA256\u0026X-Amz-Credential=0004d7f56a0400b0000000001%2F20230119%2Fus-west-000%2Fs3%2Faws4_request\u0026X-Amz-Date=20230119T071304Z\u0026X-Amz-Expires=3600\u0026X-Amz-SignedHeaders=host\u0026X-Amz-Signature=551f456b6156e4610bc3e7be43e2f9b0e4b071db5f41f56cc0e408fc1b5a1140",
    "company_size": [\
        5001,\
        10000\
    ],
    "company_size_on_linkedin": 16084,
    "company_type": "EDUCATIONAL_INSTITUTION",
    "description": "At NUS, we are shaping the future through our people and our pursuit of new frontiers in knowledge. In a single century, we have become a university of global influence and an Asian thought leader. Our location at the crossroads of Asia informs our mission and gives us a tremendous vantage point to help create opportunities and address the pressing issues facing Singapore, Asia and the world.\r\rAt NUS, we believe in education, research and service that change lives.",
    "follower_count": 539321,
    "founded_year": 1905,
    "hq": {
        "city": "Singapore",
        "country": "SG",
        "is_hq": true,
        "line_1": "21 Lower Kent Ridge Road, Singapore",
        "postal_code": "119077",
        "state": null
    },
    "industry": "Higher Education",
    "linkedin_internal_id": "5524",
    "locations": [\
        {\
            "city": "Singapore",\
            "country": "SG",\
            "is_hq": true,\
            "line_1": "21 Lower Kent Ridge Road, Singapore",\
            "postal_code": "119077",\
            "state": null\
        }\
    ],
    "name": "National University of Singapore",
    "profile_pic_url": "https://s3.us-west-000.backblazeb2.com/proxycurl/company/national-university-of-singapore/profile?X-Amz-Algorithm=AWS4-HMAC-SHA256\u0026X-Amz-Credential=0004d7f56a0400b0000000001%2F20230119%2Fus-west-000%2Fs3%2Faws4_request\u0026X-Amz-Date=20230119T071304Z\u0026X-Amz-Expires=3600\u0026X-Amz-SignedHeaders=host\u0026X-Amz-Signature=a66e032f168972bef4ea3821705194ea1c144415a1655bdb328f961ed30e2a24",
    "search_id": "5524",
    "similar_companies": [\
        {\
            "industry": "Higher Education",\
            "link": "https://www.linkedin.com/school/nus-business-school/",\
            "location": null,\
            "name": "NUS Business School"\
        },\
        {\
            "industry": "Higher Education",\
            "link": "https://www.linkedin.com/school/nusfass/",\
            "location": null,\
            "name": "NUS Faculty of Arts and Social Sciences"\
        }\
    ],
    "specialities": [\
        "education",\
        "research"\
    ],
    "tagline": null,
    "universal_name_id": "national-university-of-singapore",
    "updates": [],
    "website": "http://nus.edu.sg"
}

```

| Key | Description | Example |
| --- | --- | --- |
| linkedin\_internal\_id | LinkedIn's Internal and immutable ID of this Company profile. | `"5524"` |
| description | A textual description of the company. | `"At NUS, we are shaping the future through our people and our pursuit of new frontiers in knowledge. In a single century, we have become a university of global influence and an Asian thought leader. Our location at the crossroads of Asia informs our mission and gives us a tremendous vantage point to help create opportunities and address the pressing issues facing Singapore, Asia and the world.\r\rAt NUS, we believe in education, research and service that change lives."` |
| website | The URL of the company's website. | `"http://nus.edu.sg"` |
| industry | The `industry` attribute, found in a LinkedIn Company profile, describes the industry in which the company operates. The value of this attribute is an enumerator. [This CSV file provides an exhaustive list of possible values for this attribute](https://drive.google.com/file/d/1T-ULD_mFc8lPogyVabtx-fereXENIhor/view). | `"Higher Education"` |
| company\_size | Sequenceed range of company head count | `[5001, 10000]` |
| company\_size\_on\_linkedin | The size of the company as indicated on LinkedIn. | `16084` |
| hq | A [CompanyLocation](https://nubela.co/proxycurl/docs#school-api-school-profile-endpoint-response-companylocation) object | See [CompanyLocation](https://nubela.co/proxycurl/docs#school-api-school-profile-endpoint-response-companylocation) object |
| company\_type | Possible values:<br>`EDUCATIONAL`: Educational Institution<br>`GOVERNMENT_AGENCY`: Government Agency<br>`NON_PROFIT` : Nonprofit<br>`PARTNERSHIP` : Partnership<br>`PRIVATELY_HELD`: Privately Held<br>`PUBLIC_COMPANY`: Public Company<br>`SELF_EMPLOYED`: Self-Employed<br>`SELF_OWNED`: Sole Proprietorship | `"EDUCATIONAL_INSTITUTION"` |
| founded\_year | The year the company was founded. | `1905` |
| specialities | A list of specialities. | `["education", "research"]` |
| locations | list of [CompanyLocation](https://nubela.co/proxycurl/docs#school-api-school-profile-endpoint-response-companylocation) | See [CompanyLocation](https://nubela.co/proxycurl/docs#school-api-school-profile-endpoint-response-companylocation) object |
| name | The name of the company. | `"National University of Singapore"` |
| tagline | A short, catchy phrase that represents the company's mission or brand. | `"Think Different - But Not Too Different"` |
| universal\_name\_id | A unique numerical identifier for the company used in the LinkedIn platform. | `"national-university-of-singapore"` |
| profile\_pic\_url | The URL of the company's profile picture. | `"https://s3.us-west-000.backblazeb2.com/proxycurl/company/national-university-of-singapore/profile?X-Amz-Algorithm=AWS4-HMAC-SHA256\u0026X-Amz-Credential=0004d7f56a0400b0000000001%2F20230119%2Fus-west-000%2Fs3%2Faws4_request\u0026X-Amz-Date=20230119T071304Z\u0026X-Amz-Expires=3600\u0026X-Amz-SignedHeaders=host\u0026X-Amz-Signature=a66e032f168972bef4ea3821705194ea1c144415a1655bdb328f961ed30e2a24"` |
| background\_cover\_image\_url | The URL of the company's background cover image. | `"https://s3.us-west-000.backblazeb2.com/proxycurl/company/national-university-of-singapore/cover?X-Amz-Algorithm=AWS4-HMAC-SHA256\u0026X-Amz-Credential=0004d7f56a0400b0000000001%2F20230119%2Fus-west-000%2Fs3%2Faws4_request\u0026X-Amz-Date=20230119T071304Z\u0026X-Amz-Expires=3600\u0026X-Amz-SignedHeaders=host\u0026X-Amz-Signature=551f456b6156e4610bc3e7be43e2f9b0e4b071db5f41f56cc0e408fc1b5a1140"` |
| search\_id | Useable with [Job listing endpoint](https://nubela.co/proxycurl/docs#jobs-api-jobs-listing-endpoint) | `"5524"` |
| similar\_companies | list of [SimilarCompany](https://nubela.co/proxycurl/docs#school-api-school-profile-endpoint-response-similarcompany) | See [SimilarCompany](https://nubela.co/proxycurl/docs#school-api-school-profile-endpoint-response-similarcompany) object |
| affiliated\_companies | list of [AffiliatedCompany](https://nubela.co/proxycurl/docs#school-api-school-profile-endpoint-response-affiliatedcompany) | See [AffiliatedCompany](https://nubela.co/proxycurl/docs#school-api-school-profile-endpoint-response-affiliatedcompany) object |
| updates | A list of post updates made by the company. This field is not guaranteed to be returned. Do not rely on this attribute in production. | See [CompanyUpdate](https://nubela.co/proxycurl/docs#school-api-school-profile-endpoint-response-companyupdate) object |
| follower\_count | The number of followers the company has on LinkedIn. | `539321` |

#### CompanyLocation

| Key | Description | Example |
| --- | --- | --- |
| country |  | `"SG"` |
| city |  | `"Singapore"` |
| postal\_code |  | `"119077"` |
| line\_1 |  | `"21 Lower Kent Ridge Road, Singapore"` |
| is\_hq |  | `true` |
| state |  | `null` |

#### SimilarCompany

| Key | Description | Example |
| --- | --- | --- |
| name |  | `"NUS Business School"` |
| link |  | `"https://www.linkedin.com/school/nus-business-school/"` |
| industry |  | `"Higher Education"` |
| location |  | `null` |

#### AffiliatedCompany

| Key | Description | Example |
| --- | --- | --- |
| name |  | `"LinkedIn"` |
| link |  | `"https://www.linkedin.com/company/linkedin"` |
| industry |  | `"Internet"` |
| location |  | `"Sunnyvale, California"` |

#### CompanyUpdate

| Key | Description | Example |
| --- | --- | --- |
| article\_link | The URL for which the post links out to | `"https://lnkd.in/gr7cb5by"` |
| image | The URL to the image to the post (if it exists) | `"https://media-exp1.licdn.com/dms/image/C5622AQEGh8idEAm14Q/feedshare-shrink_800/0/1633089889886?e=1637798400\u0026v=beta\u0026t=LtGtAUSJNrPYdHpVhTBLhGTWYqrHtFJ86PKSmTpou7c"` |
| posted\_on | A [Date](https://nubela.co/proxycurl/docs#school-api-school-profile-endpoint-response-date) object | See [Date](https://nubela.co/proxycurl/docs#school-api-school-profile-endpoint-response-date) object |
| text | The body of the update | `"Introducing Personal Email Lookup API https://lnkd.in/gr7cb5by"` |
| total\_likes | The total likes a post has received | `3` |

#### Date

| Key | Description | Example |
| --- | --- | --- |
| day |  | `30` |
| month |  | `9` |
| year |  | `2023` |

### Response Headers

| Header Key | Description | Example |
| --- | --- | --- |
| `X-Proxycurl-Credit-Cost` | Total cost of credits for this API call | `1` |

## Student Listing Endpoint

`GET /proxycurl/api/linkedin/school/students/`

Cost: `3` credits / student returned.
Extra charges might be incurred if premium optional parameters are used. Please read the description of the parameters that you intend to use.

Get a list of students of a school or university.

```
curl \
    -G \
    -H "Authorization: Bearer ${YOUR_API_KEY}" \
    'https://nubela.co/proxycurl/api/linkedin/school/students/' \
    --data-urlencode 'linkedin_school_url=https://www.linkedin.com/school/stanford-university' \
    --data-urlencode 'country=us' \
    --data-urlencode 'enrich_profiles=enrich' \
    --data-urlencode 'search_keyword=computer*|cs' \
    --data-urlencode 'page_size=10' \
    --data-urlencode 'student_status=current' \
    --data-urlencode 'sort_by=recently-matriculated' \
    --data-urlencode 'resolve_numeric_id=false'

```

```
import requests

api_key = 'YOUR_API_KEY'
headers = {'Authorization': 'Bearer ' + api_key}
api_endpoint = 'https://nubela.co/proxycurl/api/linkedin/school/students/'
params = {
    'linkedin_school_url': 'https://www.linkedin.com/school/stanford-university',
    'country': 'us',
    'enrich_profiles': 'enrich',
    'search_keyword': 'computer*|cs',
    'page_size': '10',
    'student_status': 'current',
    'sort_by': 'recently-matriculated',
    'resolve_numeric_id': 'false',
}
response = requests.get(api_endpoint,
                        params=params,
                        headers=headers)

```

[![Run in Postman](https://run.pstmn.io/button.svg)](https://pxlcl.co/run-collection)

### URL Parameters

| Parameter | Required | Description | Example |
| --- | --- | --- | --- |
| `linkedin_school_url` | yes | URL of the LinkedIn School Profile to target.<br>URL should be in the format of `https://www.linkedin.com/school/<public_identifier>` | `https://www.linkedin.com/school/stanford-university` |
| `country` | no | Limit the result set to the country locality of the profile. For example, set the parameter of `country=us` if you only want profiles from the US.<br>This parameter accepts a case-insensitive [Alpha-2 ISO3166 country code](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2).<br>Costs an extra `3` credit per result returned. | `us` |
| `enrich_profiles` | no | Get the full profile of students instead of only their profile urls.<br>Each request respond with a streaming response of profiles.<br>The valid values are:<br>\\* `skip` (default): lists student's profile url<br>\\* `enrich`: lists full profile of students<br>_Calling this API endpoint with this parameter would add `1` credit per student returned._ | `enrich` |
| `search_keyword` | no | Filter students by their major by matching the student's major against a _regular expression_.<br>The default value of this parameter is `null`.<br>The accepted value for this parameter is a **case-insensitive** regular expression.<br>(The base cost of calling this API endpoint with this parameter would be `10` credits.<br>Each student matched and returned would cost `6` credits per student returned.) | `computer*|cs` |
| `page_size` | no | Limit the maximum results returned per API call.<br>The default value of this parameter is `10`.<br>Accepted values for this parameter is an integer ranging from `1` to `200000`.<br>When `enrich_profiles=enrich`, this parameter accepts value ranging from `1` to `10` and the default value is `10`. | `10` |
| `student_status` | no | Parameter to tell the API to return past or current students.<br>Valid values are `current`, `past`, and `all`:<br>\\* `current` (default) : lists current students<br>\\* `past` : lists past students<br>\\* `all` : lists current & past students | `current` |
| `sort_by` | no | Sort students by matriculation or graduation dates.<br>Valid values are:<br>\\* `recently-matriculated` \- Sort students by their matriculation date. Students who had had most recently started school is on the top of the list.<br>\\* `recently-graduated` \- Sort students by their graduation date. The most recently graduated student is on the top of this list.<br>\\* `none` \- The default value. Do not sort.<br>If this parameter is supplied with a value other than `none`, will add `50` credits to the base cost of the API endpoint regardless number of results returned. It will also add an additional cost of `10` credits per student returned. | `recently-matriculated` |
| `resolve_numeric_id` | no | Enable support for School Profile URLs with numerical IDs that you most frequently fetch from Sales Navigator. <br>We achieve this by resolving numerical IDs into vanity IDs with cached company profiles from [LinkDB](https://nubela.co/proxycurl/linkdb). <br>For example, we will turn `https://www.linkedin.com/school/1234567890` to `https://www.linkedin.com/school/acme-corp` \-\- for which the API endpoint only supports the latter.<br>This parameter accepts the following values:<br>\- `false` (default value) - Will not resolve numerical IDs.<br>\- `true` \- Enable support for School Profile URLs with numerical IDs. <br>Costs an extra `2` credit on top of the base cost of the endpoint. | `false` |

### Response

```
{
    "next_page": null,
    "students": [\
        {\
            "last_updated": "2023-10-26T11:34:30Z",\
            "profile": {\
                "accomplishment_courses": [],\
                "accomplishment_honors_awards": [],\
                "accomplishment_organisations": [],\
                "accomplishment_patents": [],\
                "accomplishment_projects": [\
                    {\
                        "description": "gMessenger was built using Ruby on Rails, and the Bootstrap HTML, CSS, and JavaScript framework. It uses a Websocket-Rails integration to post a user\u0027s message content to the page in real time, with no page refresh required. gMessenger also includes custom authentication with three different permissions levels.",\
                        "ends_at": null,\
                        "starts_at": {\
                            "day": 1,\
                            "month": 3,\
                            "year": 2015\
                        },\
                        "title": "gMessenger",\
                        "url": "http://gmessenger.herokuapp.com/"\
                    },\
                    {\
                        "description": "A task and project management responsive web app utilizing Ruby on Rails - CSS and HTML",\
                        "ends_at": null,\
                        "starts_at": {\
                            "day": 1,\
                            "month": 1,\
                            "year": 2015\
                        },\
                        "title": "Taskly",\
                        "url": "https://hidden-coast-7204.herokuapp.com/"\
                    }\
                ],\
                "accomplishment_publications": [],\
                "accomplishment_test_scores": [],\
                "activities": [\
                    {\
                        "activity_status": "Shared by John Marty",\
                        "link": "https://www.linkedin.com/posts/johnrmarty_financialfreedom-realestate-technology-activity-6940294635743301632-rsLo",\
                        "title": "Yesterday I toured a $1.2M property in California that has a large 13K sq ft lot with two homes on it. After 5 minutes of being on-site I\u2026"\
                    }\
                ],\
                "articles": [],\
                "background_cover_image_url": "https://media.licdn.com/dms/image/C5616AQH9tkBTUhHfng/profile-displaybackgroundimage-shrink_200_800/0/1614530499015?e=2147483647\u0026v=beta\u0026t=VEoCyedtZulnAVYWT9BXfKHi5OFp8avElNjiz8kjSTU",\
                "certifications": [\
                    {\
                        "authority": "Scaled Agile, Inc.",\
                        "display_source": null,\
                        "ends_at": null,\
                        "license_number": null,\
                        "name": "SAFe Agile Framework Practitioner - ( Scrum, XP, and Lean Practices in the SAFe Enterprise)",\
                        "starts_at": null,\
                        "url": null\
                    },\
                    {\
                        "authority": "Scrum Alliance",\
                        "display_source": null,\
                        "ends_at": null,\
                        "license_number": null,\
                        "name": "SCRUM Alliance Certified Product Owner",\
                        "starts_at": null,\
                        "url": null\
                    }\
                ],\
                "city": "Seattle",\
                "connections": 500,\
                "country": "US",\
                "country_full_name": "United States of America",\
                "education": [\
                    {\
                        "activities_and_societies": null,\
                        "degree_name": "Master of Business Administration (MBA)",\
                        "description": null,\
                        "ends_at": {\
                            "day": 31,\
                            "month": 12,\
                            "year": 2015\
                        },\
                        "field_of_study": "Finance + Economics",\
                        "grade": null,\
                        "logo_url": "https://media.licdn.com/dms/image/C560BAQGVi9eAHgWxFw/company-logo_100_100/0/1673448029676?e=2147483647\u0026v=beta\u0026t=NG6ttckXvnS2DX3abTfVACRY2E9Q1EcryNaJLRbE9OE",\
                        "school": "University of Colorado Denver",\
                        "school_linkedin_profile_url": "https://www.linkedin.com/school/university-of-colorado-denver/",\
                        "starts_at": {\
                            "day": 1,\
                            "month": 1,\
                            "year": 2013\
                        }\
                    },\
                    {\
                        "activities_and_societies": null,\
                        "degree_name": null,\
                        "description": "rails, ruby, rspec, capybara, bootstrap, css, html, api integration, Jquery, Javascript",\
                        "ends_at": {\
                            "day": 31,\
                            "month": 12,\
                            "year": 2015\
                        },\
                        "field_of_study": "School of Software Development",\
                        "grade": null,\
                        "logo_url": "https://media.licdn.com/dms/image/C560BAQFKNxOZ4X0g8Q/company-logo_100_100/0/1670610916338?e=2147483647\u0026v=beta\u0026t=t7ImfhmsuIJ7HJGHEbPJ2suxdslKhzp9v-5h9_G4sWE",\
                        "school": "Galvanize Inc",\
                        "school_linkedin_profile_url": "https://www.linkedin.com/school/galvanize-it/",\
                        "starts_at": {\
                            "day": 1,\
                            "month": 1,\
                            "year": 2015\
                        }\
                    }\
                ],\
                "experiences": [\
                    {\
                        "company": "Freedom Fund Real Estate",\
                        "company_linkedin_profile_url": "https://www.linkedin.com/company/freedomfund",\
                        "description": "Our mission is to provide everyday people seeking financial freedom long before the age of 65 with the ability to invest in high yield, short-term real estate investments that were only accessible in the past for a select few wealthy individuals. Each of our single family rehab projects require a minimum investment contribution of only $10K, we have simple terms, no multi-year hold periods, and no fees. With our unique model investors can log into our easy to use website, select the projects that they want to invest in, and get realtime updates on the status of their investments.\n\nWebsite: https://www.freedomfundinvestments.com/home",\
                        "ends_at": null,\
                        "location": null,\
                        "logo_url": "https://media.licdn.com/dms/image/C560BAQEYxazZM_hXgQ/company-logo_100_100/0/1634934418976?e=2147483647\u0026v=beta\u0026t=wI0YdMmxIctkzvnKxRfuAbT8h5eok_DlUqEph68J37s",\
                        "starts_at": {\
                            "day": 1,\
                            "month": 8,\
                            "year": 2021\
                        },\
                        "title": "Co-Founder"\
                    },\
                    {\
                        "company": "Mindset Reset Podcast",\
                        "company_linkedin_profile_url": "https://www.linkedin.com/company/mindset-reset-podcast",\
                        "description": "We dive into the mindsets of the world\u2019s foremost thought leaders and turn them into actionable insights so that others can discover greater happiness, success, and fulfillment.\n\nhttps://podcasts.apple.com/us/podcast/mindset-reset/id1553212607",\
                        "ends_at": null,\
                        "location": "Denver, Colorado, United States",\
                        "logo_url": "https://media.licdn.com/dms/image/C560BAQF9QJVQm3SOvA/company-logo_100_100/0/1614527476576?e=2147483647\u0026v=beta\u0026t=m3tx83nMN-E3XQFoJG0Wmch8U4qKnJ9i--5NSAfffC0",\
                        "starts_at": {\
                            "day": 1,\
                            "month": 1,\
                            "year": 2021\
                        },\
                        "title": "Founder"\
                    }\
                ],\
                "first_name": "John",\
                "follower_count": null,\
                "full_name": "John Marty",\
                "groups": [],\
                "headline": "Financial Freedom through Real Estate - LinkedIn Top Voice",\
                "languages": [\
                    "English",\
                    "Spanish"\
                ],\
                "last_name": "Marty",\
                "occupation": "Co-Founder at Freedom Fund Real Estate",\
                "people_also_viewed": [],\
                "profile_pic_url": "https://media.licdn.com/dms/image/C5603AQHaJSx0CBAUIA/profile-displayphoto-shrink_800_800/0/1558325759208?e=2147483647\u0026v=beta\u0026t=BluXpPg88xFnU2wMGLjuCUykSk_wKNdh8x3PI9wm6MI",\
                "public_identifier": "johnrmarty",\
                "recommendations": [\
                    "Rebecca Canfield\n\n      \n          \n          \n\n\n\n              \n                \n        \n              \n  \n\n      \n          John Marty is a genius at his craft. He is skilled in the art of making people feel empowered to seek out roles that they are qualified for, ask for salaries that they deserve, and creates a kind of pay it forward lifestyle. John helps you to get to places that you only thought were possible for other people. Anyone that is fortunate enough to learn from John should consider themselves extremely lucky. I know I do. ",\
                    "Zoe Sanoff\n\n      \n          \n          \n\n\n\n              \n                \n        \n              \n  \n\n      \n          John is so focused on helping guide you through an interview process not just for Amazon but on interviewing in general.  I\u0027ve generally done well at interviewing, my skills are top notch now.  John is so focused on on his clients and really goes above and beyond.  John is genuine, knowledgeable, well spoken and non-judgemental.  He is so encouraging, so positive and really easy to talk to.  Thank you John!"\
                ],\
                "similarly_named_profiles": [\
                    {\
                        "link": "https://www.linkedin.com/in/john-martinez-90384a229",\
                        "location": "San Antonio, TX",\
                        "name": "John Martinez",\
                        "summary": "Owner of Fight or Flight Medical Consultants, LLC  , Owner Marty\u2019s Hardwood Works"\
                    },\
                    {\
                        "link": "https://www.linkedin.com/in/senatormarty",\
                        "location": "St Paul, MN",\
                        "name": "John Marty",\
                        "summary": null\
                    }\
                ],\
                "state": "Washington",\
                "summary": "Most people go through life lost, disengaged, and unhappy at work and in their lives - I\u0027m on a mission to solve that.\n\nI spent 10 years as the founder of Axxis Audio, an electronics company that grew to multi-million dollar sales, which I sold in 2012. At that time, I funneled my earnings into the creation of an Internet of Things company, but numerous factors lead to its demise after 2 hard fought years. \n\nAt 31, I was penny-less, had a baby on the way, and had zero job prospects (despite applying to 150 companies). My desperate situation led me to take a job at Best Buy for $12 an hour while reinventing myself through the completion of an MBA at the University of Colorado, and a 6-month software development boot camp. \n\nAfter graduation, I landed at American Express as a Senior Product Manager and then got poached by Amazon in 2017 (because of my LinkedIn profile). My journey has led to a deep sense of perspective, humility, and purpose that I draw on to help others find clarity, meaning, and happiness in their careers and lives. \n\nCheck out my website for details on my Mindset Reset Podcast, Public Speaking, Consulting, or my free 40 page LinkedIn guide\n\nhttp://www.johnraphaelmarty.com/\n\nFAQ\u0027s\n\nQ: Can you speak at my Company, University, event or podcast?\nA: I\u0027d love to! I\u0027ve shared my message on the future of employment, breaking into big tech, and my personal story of reinventing myself and discovering my sense of purpose (and how you can too!).\n\n\u2611\ufe0f  YouTube Channel #1 (John Marty) : http://www.youtube.com/c/JohnMarty-uncommon\n\u2611\ufe0f  YouTube Channel #2 (Tech Careers for non-engineers: https://www.youtube.com/channel/UC900gMMPLwRGGXSTW1gdZHA\n\nFUN FACTS:\n\u2611\ufe0f I am an Avid cyclist and runner, and I just started learning to skateboard a half-pipe.\n\u2611\ufe0f Into the Enneagram? - I\u0027m a #3 (The Achiever)\n\nLETS CONNECT:\n\u2611\ufe0f Email: JohnRmarty@gmail.com (don\u0027t forget that \"R\"....The other guy gets my emails all the time)",\
                "volunteer_work": []\
            },\
            "profile_url": "https://www.linkedin.com/in/johnrmarty"\
        }\
    ]
}

```

| Key | Description | Example |
| --- | --- | --- |
| students | A list of student profiles (if enriched) and their associated profile URL. | See [Student](https://nubela.co/proxycurl/docs#school-api-student-listing-endpoint-response-student) object |
| next\_page | The API URI that will lead to the next page of results. This will be null for the final page. | `null` |

#### Student

| Key | Description | Example |
| --- | --- | --- |
| profile\_url |  | `"https://www.linkedin.com/in/johnrmarty"` |
| profile |  | `{"accomplishment_courses": [], "accomplishment_honors_awards": [], "accomplishment_organisations": [], "accomplishment_patents": [], "accomplishment_projects": [{"description": "gMessenger was built using Ruby on Rails, and the Bootstrap HTML, CSS, and JavaScript framework. It uses a Websocket-Rails integration to post a user\u0027s message content to the page in real time, with no page refresh required. gMessenger also includes custom authentication with three different permissions levels.", "ends_at": null, "starts_at": {"day": 1, "month": 3, "year": 2015}, "title": "gMessenger", "url": "http://gmessenger.herokuapp.com/"}, {"description": "A task and project management responsive web app utilizing Ruby on Rails - CSS and HTML", "ends_at": null, "starts_at": {"day": 1, "month": 1, "year": 2015}, "title": "Taskly", "url": "https://hidden-coast-7204.herokuapp.com/"}], "accomplishment_publications": [], "accomplishment_test_scores": [], "activities": [{"activity_status": "Shared by John Marty", "link": "https://www.linkedin.com/posts/johnrmarty_financialfreedom-realestate-technology-activity-6940294635743301632-rsLo", "title": "Yesterday I toured a $1.2M property in California that has a large 13K sq ft lot with two homes on it. After 5 minutes of being on-site I\u2026"}], "articles": [], "background_cover_image_url": "https://media.licdn.com/dms/image/C5616AQH9tkBTUhHfng/profile-displaybackgroundimage-shrink_200_800/0/1614530499015?e=2147483647\u0026v=beta\u0026t=VEoCyedtZulnAVYWT9BXfKHi5OFp8avElNjiz8kjSTU", "certifications": [{"authority": "Scaled Agile, Inc.", "display_source": null, "ends_at": null, "license_number": null, "name": "SAFe Agile Framework Practitioner - ( Scrum, XP, and Lean Practices in the SAFe Enterprise)", "starts_at": null, "url": null}, {"authority": "Scrum Alliance", "display_source": null, "ends_at": null, "license_number": null, "name": "SCRUM Alliance Certified Product Owner", "starts_at": null, "url": null}], "city": "Seattle", "connections": 500, "country": "US", "country_full_name": "United States of America", "education": [{"activities_and_societies": null, "degree_name": "Master of Business Administration (MBA)", "description": null, "ends_at": {"day": 31, "month": 12, "year": 2015}, "field_of_study": "Finance + Economics", "grade": null, "logo_url": "https://media.licdn.com/dms/image/C560BAQGVi9eAHgWxFw/company-logo_100_100/0/1673448029676?e=2147483647\u0026v=beta\u0026t=NG6ttckXvnS2DX3abTfVACRY2E9Q1EcryNaJLRbE9OE", "school": "University of Colorado Denver", "school_linkedin_profile_url": "https://www.linkedin.com/school/university-of-colorado-denver/", "starts_at": {"day": 1, "month": 1, "year": 2013}}, {"activities_and_societies": null, "degree_name": null, "description": "rails, ruby, rspec, capybara, bootstrap, css, html, api integration, Jquery, Javascript", "ends_at": {"day": 31, "month": 12, "year": 2015}, "field_of_study": "School of Software Development", "grade": null, "logo_url": "https://media.licdn.com/dms/image/C560BAQFKNxOZ4X0g8Q/company-logo_100_100/0/1670610916338?e=2147483647\u0026v=beta\u0026t=t7ImfhmsuIJ7HJGHEbPJ2suxdslKhzp9v-5h9_G4sWE", "school": "Galvanize Inc", "school_linkedin_profile_url": "https://www.linkedin.com/school/galvanize-it/", "starts_at": {"day": 1, "month": 1, "year": 2015}}], "experiences": [{"company": "Freedom Fund Real Estate", "company_linkedin_profile_url": "https://www.linkedin.com/company/freedomfund", "description": "Our mission is to provide everyday people seeking financial freedom long before the age of 65 with the ability to invest in high yield, short-term real estate investments that were only accessible in the past for a select few wealthy individuals. Each of our single family rehab projects require a minimum investment contribution of only $10K, we have simple terms, no multi-year hold periods, and no fees. With our unique model investors can log into our easy to use website, select the projects that they want to invest in, and get realtime updates on the status of their investments.\n\nWebsite: https://www.freedomfundinvestments.com/home", "ends_at": null, "location": null, "logo_url": "https://media.licdn.com/dms/image/C560BAQEYxazZM_hXgQ/company-logo_100_100/0/1634934418976?e=2147483647\u0026v=beta\u0026t=wI0YdMmxIctkzvnKxRfuAbT8h5eok_DlUqEph68J37s", "starts_at": {"day": 1, "month": 8, "year": 2021}, "title": "Co-Founder"}, {"company": "Mindset Reset Podcast", "company_linkedin_profile_url": "https://www.linkedin.com/company/mindset-reset-podcast", "description": "We dive into the mindsets of the world\u2019s foremost thought leaders and turn them into actionable insights so that others can discover greater happiness, success, and fulfillment.\n\nhttps://podcasts.apple.com/us/podcast/mindset-reset/id1553212607", "ends_at": null, "location": "Denver, Colorado, United States", "logo_url": "https://media.licdn.com/dms/image/C560BAQF9QJVQm3SOvA/company-logo_100_100/0/1614527476576?e=2147483647\u0026v=beta\u0026t=m3tx83nMN-E3XQFoJG0Wmch8U4qKnJ9i--5NSAfffC0", "starts_at": {"day": 1, "month": 1, "year": 2021}, "title": "Founder"}], "first_name": "John", "follower_count": null, "full_name": "John Marty", "groups": [], "headline": "Financial Freedom through Real Estate - LinkedIn Top Voice", "languages": ["English", "Spanish"], "last_name": "Marty", "occupation": "Co-Founder at Freedom Fund Real Estate", "people_also_viewed": [], "profile_pic_url": "https://media.licdn.com/dms/image/C5603AQHaJSx0CBAUIA/profile-displayphoto-shrink_800_800/0/1558325759208?e=2147483647\u0026v=beta\u0026t=BluXpPg88xFnU2wMGLjuCUykSk_wKNdh8x3PI9wm6MI", "public_identifier": "johnrmarty", "recommendations": ["Rebecca Canfield\n\n      \n          \n          \n\n\n\n              \n                \n        \n              \n  \n\n      \n          John Marty is a genius at his craft. He is skilled in the art of making people feel empowered to seek out roles that they are qualified for, ask for salaries that they deserve, and creates a kind of pay it forward lifestyle. John helps you to get to places that you only thought were possible for other people. Anyone that is fortunate enough to learn from John should consider themselves extremely lucky. I know I do. ", "Zoe Sanoff\n\n      \n          \n          \n\n\n\n              \n                \n        \n              \n  \n\n      \n          John is so focused on helping guide you through an interview process not just for Amazon but on interviewing in general.  I\u0027ve generally done well at interviewing, my skills are top notch now.  John is so focused on on his clients and really goes above and beyond.  John is genuine, knowledgeable, well spoken and non-judgemental.  He is so encouraging, so positive and really easy to talk to.  Thank you John!"], "similarly_named_profiles": [{"link": "https://www.linkedin.com/in/john-martinez-90384a229", "location": "San Antonio, TX", "name": "John Martinez", "summary": "Owner of Fight or Flight Medical Consultants, LLC  , Owner Marty\u2019s Hardwood Works"}, {"link": "https://www.linkedin.com/in/senatormarty", "location": "St Paul, MN", "name": "John Marty", "summary": null}], "state": "Washington", "summary": "Most people go through life lost, disengaged, and unhappy at work and in their lives - I\u0027m on a mission to solve that.\n\nI spent 10 years as the founder of Axxis Audio, an electronics company that grew to multi-million dollar sales, which I sold in 2012. At that time, I funneled my earnings into the creation of an Internet of Things company, but numerous factors lead to its demise after 2 hard fought years. \n\nAt 31, I was penny-less, had a baby on the way, and had zero job prospects (despite applying to 150 companies). My desperate situation led me to take a job at Best Buy for $12 an hour while reinventing myself through the completion of an MBA at the University of Colorado, and a 6-month software development boot camp. \n\nAfter graduation, I landed at American Express as a Senior Product Manager and then got poached by Amazon in 2017 (because of my LinkedIn profile). My journey has led to a deep sense of perspective, humility, and purpose that I draw on to help others find clarity, meaning, and happiness in their careers and lives. \n\nCheck out my website for details on my Mindset Reset Podcast, Public Speaking, Consulting, or my free 40 page LinkedIn guide\n\nhttp://www.johnraphaelmarty.com/\n\nFAQ\u0027s\n\nQ: Can you speak at my Company, University, event or podcast?\nA: I\u0027d love to! I\u0027ve shared my message on the future of employment, breaking into big tech, and my personal story of reinventing myself and discovering my sense of purpose (and how you can too!).\n\n\u2611\ufe0f  YouTube Channel #1 (John Marty) : http://www.youtube.com/c/JohnMarty-uncommon\n\u2611\ufe0f  YouTube Channel #2 (Tech Careers for non-engineers: https://www.youtube.com/channel/UC900gMMPLwRGGXSTW1gdZHA\n\nFUN FACTS:\n\u2611\ufe0f I am an Avid cyclist and runner, and I just started learning to skateboard a half-pipe.\n\u2611\ufe0f Into the Enneagram? - I\u0027m a #3 (The Achiever)\n\nLETS CONNECT:\n\u2611\ufe0f Email: JohnRmarty@gmail.com (don\u0027t forget that \"R\"....The other guy gets my emails all the time)", "volunteer_work": []}` |
| last\_updated | ISO 8601 timestamp since the enriched profile was last scraped. | `"2023-10-26T11:34:30Z"` |

### Response Headers

| Header Key | Description | Example |
| --- | --- | --- |
| `X-Proxycurl-Credit-Cost` | Total cost of credits for this API call | `3` |

# Company API

## Company Profile Endpoint

`GET /proxycurl/api/linkedin/company`

Cost: `1` credit / successful request.
Extra charges might be incurred if premium optional parameters are used. Please read the description of the parameters that you intend to use. Credits are charged even if a successful request returns an empty result.

Get structured data of a Company Profile

```
curl \
    -G \
    -H "Authorization: Bearer ${YOUR_API_KEY}" \
    'https://nubela.co/proxycurl/api/linkedin/company' \
    --data-urlencode 'url=https://www.linkedin.com/company/google/' \
    --data-urlencode 'categories=include' \
    --data-urlencode 'funding_data=include' \
    --data-urlencode 'exit_data=include' \
    --data-urlencode 'acquisitions=include' \
    --data-urlencode 'extra=include' \
    --data-urlencode 'use_cache=if-present' \
    --data-urlencode 'fallback_to_cache=on-error'

```

```
import requests

api_key = 'YOUR_API_KEY'
headers = {'Authorization': 'Bearer ' + api_key}
api_endpoint = 'https://nubela.co/proxycurl/api/linkedin/company'
params = {
    'url': 'https://www.linkedin.com/company/google/',
    'categories': 'include',
    'funding_data': 'include',
    'exit_data': 'include',
    'acquisitions': 'include',
    'extra': 'include',
    'use_cache': 'if-present',
    'fallback_to_cache': 'on-error',
}
response = requests.get(api_endpoint,
                        params=params,
                        headers=headers)

```

[![Run in Postman](https://run.pstmn.io/button.svg)](https://pxlcl.co/run-collection)

### URL Parameters

| Parameter | Required | Description | Example |
| --- | --- | --- | --- |
| `url` | yes | URL of the LinkedIn Company Profile to crawl.<br>URL should be in the format of `https://www.linkedin.com/company/<public_identifier>` | `https://www.linkedin.com/company/google/` |
| `categories` | no | Appends categories data of this company.<br>Default value is `"exclude"`.<br>The other acceptable value is `"include"`, which will include these categories (if available) for `1` extra credit. | `include` |
| `funding_data` | no | Returns a list of funding rounds that this company has received.<br>Default value is `"exclude"`.<br>The other acceptable value is `"include"`, which will include these categories (if available) for `1` extra credit. | `include` |
| `exit_data` | no | Returns a list of investment portfolio exits.<br>Default value is `"exclude"`.<br>The other acceptable value is `"include"`, which will include these categories (if available) for `1` extra credit. | `include` |
| `acquisitions` | no | Provides further enriched data on acquisitions made by this company from external sources.<br>Default value is `"exclude"`.<br>The other acceptable value is `"include"`, which will include these acquisition data (if available) for `1` extra credit. | `include` |
| `extra` | no | Enriches the Company Profile with extra details from external sources.<br>Details include Crunchbase ranking, contact email, phone number, Facebook account, Twitter account, funding rounds and amount, IPO status, investor information, etc.<br>Default value is `"exclude"`.<br>The other acceptable value is `"include"`, which will include these extra details (if available) for `1` extra credit. | `include` |
| `use_cache` | no | `if-present` \- Fetches profile from cache regardless of age of profile.<br>If profile is not available in cache, API will attempt to source profile externally.<br>`if-recent` (Default) - API will make a best effort to return a fresh profile no older than 29 days.<br>Costs an extra `1` credit on top of the cost of the base endpoint. | `if-present` |
| `fallback_to_cache` | no | Tweaks the fallback behavior if an error arises from fetching a fresh profile.<br>This parameter accepts the following values:<br>\\* `on-error` (default value) - Fallback to reading the profile from cache if an error arises.<br>\\* `never` \- Do not ever read profile from cache. | `on-error` |

### Response

```
{
    "affiliated_companies": [\
        {\
            "industry": "Software Development",\
            "link": "https://www.linkedin.com/company/youtube",\
            "location": "San Bruno, CA",\
            "name": "YouTube"\
        },\
        {\
            "industry": "Software Development",\
            "link": "https://www.linkedin.com/showcase/google-cloud",\
            "location": "Mountain View, California",\
            "name": "Google Cloud"\
        }\
    ],
    "background_cover_image_url": "https://s3.us-west-000.backblazeb2.com/proxycurl/company/google/cover?X-Amz-Algorithm=AWS4-HMAC-SHA256\u0026X-Amz-Credential=0004d7f56a0400b0000000001%2F20230119%2Fus-west-000%2Fs3%2Faws4_request\u0026X-Amz-Date=20230119T060024Z\u0026X-Amz-Expires=3600\u0026X-Amz-SignedHeaders=host\u0026X-Amz-Signature=abb7a4b87583cffda8db24d58d906c644998fae8cbb99e98c69a35720fcd0050",
    "company_size": [\
        10001,\
        null\
    ],
    "company_size_on_linkedin": 319856,
    "company_type": "PUBLIC_COMPANY",
    "description": "A problem isn\u0027t truly solved until it\u0027s solved for all. Googlers build products that help create opportunities for everyone, whether down the street or across the globe. Bring your insight, imagination and a healthy disregard for the impossible. Bring everything that makes you unique. Together, we can build for everyone.\n\nCheck out our career opportunities at careers.google.com.",
    "follower_count": 27472792,
    "founded_year": null,
    "hq": {
        "city": "Mountain View",
        "country": "US",
        "is_hq": true,
        "line_1": "1600 Amphitheatre Parkway",
        "postal_code": "94043",
        "state": "CA"
    },
    "industry": "Software Development",
    "linkedin_internal_id": "1441",
    "locations": [\
        {\
            "city": "Mountain View",\
            "country": "US",\
            "is_hq": true,\
            "line_1": "1600 Amphitheatre Parkway",\
            "postal_code": "94043",\
            "state": "CA"\
        },\
        {\
            "city": "New York",\
            "country": "US",\
            "is_hq": false,\
            "line_1": "111 8th Ave",\
            "postal_code": "10011",\
            "state": "NY"\
        }\
    ],
    "name": "Google",
    "profile_pic_url": "https://s3.us-west-000.backblazeb2.com/proxycurl/company/google/profile?X-Amz-Algorithm=AWS4-HMAC-SHA256\u0026X-Amz-Credential=0004d7f56a0400b0000000001%2F20230119%2Fus-west-000%2Fs3%2Faws4_request\u0026X-Amz-Date=20230119T060024Z\u0026X-Amz-Expires=3600\u0026X-Amz-SignedHeaders=host\u0026X-Amz-Signature=0d3500b39da8db1d2d8f5727a9ac39a7c4a88b4632ed68209dee12f06bc79aca",
    "search_id": "1441",
    "similar_companies": [\
        {\
            "industry": "Software Development",\
            "link": "https://www.linkedin.com/company/amazon",\
            "location": "Seattle, WA",\
            "name": "Amazon"\
        },\
        {\
            "industry": "Software Development",\
            "link": "https://www.linkedin.com/company/microsoft",\
            "location": "Redmond, Washington",\
            "name": "Microsoft"\
        }\
    ],
    "specialities": [\
        "search",\
        "ads"\
    ],
    "tagline": null,
    "universal_name_id": "google",
    "updates": [\
        {\
            "article_link": null,\
            "image": "https://media.licdn.com/dms/image/C5605AQFthnjiTD6Mvg/videocover-high/0/1660754102856?e=2147483647\u0026v=beta\u0026t=PPOsA9J3vCTXWhuZclqSBQl7DLSDLvy5hKWlkHI85YE",\
            "posted_on": {\
                "day": 13,\
                "month": 9,\
                "year": 2022\
            },\
            "text": "Want to kick start your #LifeAtGoogle but not sure where to begin? Explore our Build Your Future site, where you can learn about developmental programs, learn tips for future interviews, sign up for informational events, and even hear real stories from Googlers who\u2019ve been where you are now. Get started \u2192 https://bit.ly/3SKPzQB",\
            "total_likes": 4267\
        },\
        {\
            "article_link": null,\
            "image": "https://media.licdn.com/dms/image/C4D22AQGcvTlKRR3qvQ/feedshare-shrink_2048_1536/0/1672854668558?e=1676505600\u0026v=beta\u0026t=whRRx9ULPEuyw_FgUg4Z3N3O9iksyJW7ewCGZA6ujdg",\
            "posted_on": null,\
            "text": "Ariana, welcome to Google. Here\u2019s to a year full of growth, learning, and experiences at #LifeAtGoogle! \ud83c\udf89",\
            "total_likes": 397\
        }\
    ],
    "website": "https://goo.gle/3m1IN7m"
}

```

| Key | Description | Example |
| --- | --- | --- |
| linkedin\_internal\_id | LinkedIn's Internal and immutable ID of this Company profile. | `"1441"` |
| description | A textual description of the company. | `"A problem isn\u0027t truly solved until it\u0027s solved for all. Googlers build products that help create opportunities for everyone, whether down the street or across the globe. Bring your insight, imagination and a healthy disregard for the impossible. Bring everything that makes you unique. Together, we can build for everyone.\n\nCheck out our career opportunities at careers.google.com."` |
| website | The URL of the company's website. | `"https://goo.gle/3m1IN7m"` |
| industry | The `industry` attribute, found in a LinkedIn Company profile, describes the industry in which the company operates. The value of this attribute is an enumerator. [This CSV file provides an exhaustive list of possible values for this attribute](https://drive.google.com/file/d/1T-ULD_mFc8lPogyVabtx-fereXENIhor/view). | `"Software Development"` |
| company\_size | Sequenceed range of company head count | `[10001, null]` |
| company\_size\_on\_linkedin | The size of the company as indicated on LinkedIn. | `319856` |
| hq | A [CompanyLocation](https://nubela.co/proxycurl/docs#company-api-company-profile-endpoint-response-companylocation) object | See [CompanyLocation](https://nubela.co/proxycurl/docs#company-api-company-profile-endpoint-response-companylocation) object |
| company\_type | Possible values:<br>`EDUCATIONAL`: Educational Institution<br>`GOVERNMENT_AGENCY`: Government Agency<br>`NON_PROFIT` : Nonprofit<br>`PARTNERSHIP` : Partnership<br>`PRIVATELY_HELD`: Privately Held<br>`PUBLIC_COMPANY`: Public Company<br>`SELF_EMPLOYED`: Self-Employed<br>`SELF_OWNED`: Sole Proprietorship | `"PUBLIC_COMPANY"` |
| founded\_year | The year the company was founded. | `null` |
| specialities | A list of specialities. | `["search", "ads"]` |
| locations | list of [CompanyLocation](https://nubela.co/proxycurl/docs#company-api-company-profile-endpoint-response-companylocation) | See [CompanyLocation](https://nubela.co/proxycurl/docs#company-api-company-profile-endpoint-response-companylocation) object |
| name | The name of the company. | `"Google"` |
| tagline | A short, catchy phrase that represents the company's mission or brand. | `"Think Different - But Not Too Different"` |
| universal\_name\_id | A unique numerical identifier for the company used in the LinkedIn platform. | `"google"` |
| profile\_pic\_url | The URL of the company's profile picture. | `"https://s3.us-west-000.backblazeb2.com/proxycurl/company/google/profile?X-Amz-Algorithm=AWS4-HMAC-SHA256\u0026X-Amz-Credential=0004d7f56a0400b0000000001%2F20230119%2Fus-west-000%2Fs3%2Faws4_request\u0026X-Amz-Date=20230119T060024Z\u0026X-Amz-Expires=3600\u0026X-Amz-SignedHeaders=host\u0026X-Amz-Signature=0d3500b39da8db1d2d8f5727a9ac39a7c4a88b4632ed68209dee12f06bc79aca"` |
| background\_cover\_image\_url | The URL of the company's background cover image. | `"https://s3.us-west-000.backblazeb2.com/proxycurl/company/google/cover?X-Amz-Algorithm=AWS4-HMAC-SHA256\u0026X-Amz-Credential=0004d7f56a0400b0000000001%2F20230119%2Fus-west-000%2Fs3%2Faws4_request\u0026X-Amz-Date=20230119T060024Z\u0026X-Amz-Expires=3600\u0026X-Amz-SignedHeaders=host\u0026X-Amz-Signature=abb7a4b87583cffda8db24d58d906c644998fae8cbb99e98c69a35720fcd0050"` |
| search\_id | Useable with [Job listing endpoint](https://nubela.co/proxycurl/docs#jobs-api-jobs-listing-endpoint) | `"1441"` |
| similar\_companies | list of [SimilarCompany](https://nubela.co/proxycurl/docs#company-api-company-profile-endpoint-response-similarcompany) | See [SimilarCompany](https://nubela.co/proxycurl/docs#company-api-company-profile-endpoint-response-similarcompany) object |
| affiliated\_companies | list of [AffiliatedCompany](https://nubela.co/proxycurl/docs#company-api-company-profile-endpoint-response-affiliatedcompany) | See [AffiliatedCompany](https://nubela.co/proxycurl/docs#company-api-company-profile-endpoint-response-affiliatedcompany) object |
| updates | A list of post updates made by the company. This field is not guaranteed to be returned. Do not rely on this attribute in production. | See [CompanyUpdate](https://nubela.co/proxycurl/docs#company-api-company-profile-endpoint-response-companyupdate) object |
| follower\_count | The number of followers the company has on LinkedIn. | `27472792` |
| acquisitions | A [Acquisition](https://nubela.co/proxycurl/docs#company-api-company-profile-endpoint-response-acquisition) object | See [Acquisition](https://nubela.co/proxycurl/docs#company-api-company-profile-endpoint-response-acquisition) object |
| exit\_data | list of [Exit](https://nubela.co/proxycurl/docs#company-api-company-profile-endpoint-response-exit) | See [Exit](https://nubela.co/proxycurl/docs#company-api-company-profile-endpoint-response-exit) object |
| extra | Company extra when `extra=include` | See [CompanyDetails](https://nubela.co/proxycurl/docs#company-api-company-profile-endpoint-response-companydetails) object |
| funding\_data | Company Funding data when `funding_data=include` | See [Funding](https://nubela.co/proxycurl/docs#company-api-company-profile-endpoint-response-funding) object |
| categories | The `categories` attribute is fetched from the company's Crunchbase profile. Values for this attribute are free-form text, and there is no exhaustive list of categories. Consider the categories attribute as "hints" regarding the products or services offered by the company. | `["artificial-intelligence", "virtual-reality"]` |

#### CompanyLocation

| Key | Description | Example |
| --- | --- | --- |
| country |  | `"US"` |
| city |  | `"Mountain View"` |
| postal\_code |  | `"94043"` |
| line\_1 |  | `"1600 Amphitheatre Parkway"` |
| is\_hq |  | `true` |
| state |  | `"CA"` |

#### SimilarCompany

| Key | Description | Example |
| --- | --- | --- |
| name |  | `"Amazon"` |
| link |  | `"https://www.linkedin.com/company/amazon"` |
| industry |  | `"Software Development"` |
| location |  | `"Seattle, WA"` |

#### AffiliatedCompany

| Key | Description | Example |
| --- | --- | --- |
| name |  | `"LinkedIn"` |
| link |  | `"https://www.linkedin.com/company/linkedin"` |
| industry |  | `"Internet"` |
| location |  | `"Sunnyvale, California"` |

#### CompanyUpdate

| Key | Description | Example |
| --- | --- | --- |
| article\_link | The URL for which the post links out to | `"https://lnkd.in/gr7cb5by"` |
| image | The URL to the image to the post (if it exists) | `"https://media-exp1.licdn.com/dms/image/C5622AQEGh8idEAm14Q/feedshare-shrink_800/0/1633089889886?e=1637798400\u0026v=beta\u0026t=LtGtAUSJNrPYdHpVhTBLhGTWYqrHtFJ86PKSmTpou7c"` |
| posted\_on | A [Date](https://nubela.co/proxycurl/docs#company-api-company-profile-endpoint-response-date) object | See [Date](https://nubela.co/proxycurl/docs#company-api-company-profile-endpoint-response-date) object |
| text | The body of the update | `"Introducing Personal Email Lookup API https://lnkd.in/gr7cb5by"` |
| total\_likes | The total likes a post has received | `3` |

#### Date

| Key | Description | Example |
| --- | --- | --- |
| day |  | `30` |
| month |  | `9` |
| year |  | `2023` |

#### Acquisition

| Key | Description | Example |
| --- | --- | --- |
| acquired | list of [AcquiredCompany](https://nubela.co/proxycurl/docs#company-api-company-profile-endpoint-response-acquiredcompany) | See [AcquiredCompany](https://nubela.co/proxycurl/docs#company-api-company-profile-endpoint-response-acquiredcompany) object |
| acquired\_by | A [Acquisitor](https://nubela.co/proxycurl/docs#company-api-company-profile-endpoint-response-acquisitor) object | See [Acquisitor](https://nubela.co/proxycurl/docs#company-api-company-profile-endpoint-response-acquisitor) object |

#### AcquiredCompany

| Key | Description | Example |
| --- | --- | --- |
| linkedin\_profile\_url | LinkedIn Company Profile URL of company that was involved | `"https://www.linkedin.com/company/apple"` |
| crunchbase\_profile\_url | Crunchbase Profile URL of company that was involved | `"https://www.crunchbase.com/organization/apple"` |
| announced\_date | Date by which this event was announced | See [Date](https://nubela.co/proxycurl/docs#company-api-company-profile-endpoint-response-date) object |
| price | Price of acquisition | `300000000` |

#### Acquisitor

| Key | Description | Example |
| --- | --- | --- |
| linkedin\_profile\_url | LinkedIn Company Profile URL of company that was involved | `"https://www.linkedin.com/company/nvidia"` |
| crunchbase\_profile\_url | Crunchbase Profile URL of company that was involved | `"https://www.crunchbase.com/organization/nvidia"` |
| announced\_date | Date by which this event was announced | See [Date](https://nubela.co/proxycurl/docs#company-api-company-profile-endpoint-response-date) object |
| price | Price of acquisition | `10000` |

#### Exit

| Key | Description | Example |
| --- | --- | --- |
| linkedin\_profile\_url | LinkedIn Profile URL of the company that has exited | `"https://www.linkedin.com/company/motiondsp"` |
| crunchbase\_profile\_url | Crunchbase Profile URL of the company that has exited | `"https://www.crunchbase.com/organization/motiondsp"` |
| name | Name of the company | `"MotionDSP"` |

#### CompanyDetails

| Key | Description | Example |
| --- | --- | --- |
| crunchbase\_profile\_url | Crunchbase Profile URL of the company | `"https://www.crunchbase.com/organization/nvidia"` |
| ipo\_status | IPO status of the company | `"Public"` |
| crunchbase\_rank | A measure of prominence of this company by Crunchbase | `13` |
| founding\_date | Date of founding | See [Date](https://nubela.co/proxycurl/docs#company-api-company-profile-endpoint-response-date) object |
| operating\_status | Status of the company's operational status | `"Active"` |
| company\_type | Type of company | `"For Profit"` |
| contact\_email | General contact email of the company | `"info@nvidia.com"` |
| phone\_number | General contact number of the company | `"(140) 848-6200"` |
| facebook\_id | ID of the company's official Facebook account | `"NVIDIA.IN"` |
| twitter\_id | ID of the company's official Twitter account | `"nvidia"` |
| number\_of\_funding\_rounds | Total rounds of funding that this company has raised | `3` |
| total\_funding\_amount | Total venture capital raised by this company | `4000000` |
| stock\_symbol | Stock symbol of this public company | `"NASDAQ:NVDA"` |
| ipo\_date | The date by which this public company went public | See [Date](https://nubela.co/proxycurl/docs#company-api-company-profile-endpoint-response-date) object |
| number\_of\_lead\_investors | Total lead investors | `3` |
| number\_of\_investors | Total investors | `4` |
| total\_fund\_raised | The total amount of funds raised (by this VC firm) to be deployed as<br>subsidiary investments (applicable only for VC firms) | `1000` |
| number\_of\_investments | Total investments made by this VC firm (applicable only for VC firms) | `50` |
| number\_of\_lead\_investments | Total investments that was led by this VC firm<br>(applicable only for VC firms) | `3` |
| number\_of\_exits | Total exits by this VC (applicable only for VC firms) | `7` |
| number\_of\_acquisitions | Total companies acquired by this company | `2` |

#### Funding

| Key | Description | Example |
| --- | --- | --- |
| funding\_type | Type of funding | `"Grant"` |
| money\_raised | Amount of money raised | `25000000` |
| announced\_date | Date of announcement | See [Date](https://nubela.co/proxycurl/docs#company-api-company-profile-endpoint-response-date) object |
| number\_of\_investor | Number of investors in this round | `1` |
| investor\_list | list of [Investor](https://nubela.co/proxycurl/docs#company-api-company-profile-endpoint-response-investor) | See [Investor](https://nubela.co/proxycurl/docs#company-api-company-profile-endpoint-response-investor) object |

#### Investor

| Key | Description | Example |
| --- | --- | --- |
| linkedin\_profile\_url | LinkedIn Profile URL of investor | `"https://linkedin.com/company/darpa"` |
| name | Name of investor | `"DARPA"` |
| type | Type of investor | `"organization"` |

### Response Headers

| Header Key | Description | Example |
| --- | --- | --- |
| `X-Proxycurl-Credit-Cost` | Total cost of credits for this API call | `1` |

## Employee Listing Endpoint

`GET /proxycurl/api/linkedin/company/employees/`

Cost: `3` credits / employee returned.
Extra charges might be incurred if premium optional parameters are used. Please read the description of the parameters that you intend to use.

Get a list of employees of a Company.

This API endpoint is powered by [LinkDB](https://nubela.co/proxycurl/linkdb), our comprehensive dataset of people and company profiles.

```
curl \
    -G \
    -H "Authorization: Bearer ${YOUR_API_KEY}" \
    'https://nubela.co/proxycurl/api/linkedin/company/employees/' \
    --data-urlencode 'url=https://www.linkedin.com/company/microsoft' \
    --data-urlencode 'coy_name_match=include' \
    --data-urlencode 'use_cache=if-present' \
    --data-urlencode 'country=us' \
    --data-urlencode 'enrich_profiles=enrich' \
    --data-urlencode 'role_search=(co)?-?founder' \
    --data-urlencode 'page_size=10' \
    --data-urlencode 'employment_status=current' \
    --data-urlencode 'sort_by=recently-joined' \
    --data-urlencode 'resolve_numeric_id=false'

```

```
import requests

api_key = 'YOUR_API_KEY'
headers = {'Authorization': 'Bearer ' + api_key}
api_endpoint = 'https://nubela.co/proxycurl/api/linkedin/company/employees/'
params = {
    'url': 'https://www.linkedin.com/company/microsoft',
    'coy_name_match': 'include',
    'use_cache': 'if-present',
    'country': 'us',
    'enrich_profiles': 'enrich',
    'role_search': '(co)?-?founder',
    'page_size': '10',
    'employment_status': 'current',
    'sort_by': 'recently-joined',
    'resolve_numeric_id': 'false',
}
response = requests.get(api_endpoint,
                        params=params,
                        headers=headers)

```

[![Run in Postman](https://run.pstmn.io/button.svg)](https://pxlcl.co/run-collection)

### URL Parameters

| Parameter | Required | Description | Example |
| --- | --- | --- | --- |
| `url` | yes | URL of the LinkedIn Company Profile to target.<br>URL should be in the format of `https://www.linkedin.com/company/<public_identifier>` | `https://www.linkedin.com/company/microsoft` |
| `coy_name_match` | no | Include profiles that match the company name. The Employee Listing Endpoint works by identifying individual profiles with work experience that provides an exact match to the LinkedIn Company Profile URL provided. Including this option also allows profiles with at least one work experience that exactly matches the specified company name to be included.<br>This parameter accepts the following values:<br>\\* `include` (default value) - Include employees whose profiles match the company name.<br>\\* `exclude` \- Exclude employees by company name match. | `include` |
| `use_cache` | no | Define the freshness guarantee on the results returned.<br>This parameter accepts the following values:<br>\\* `if-present` (default value) - Returns result as it is without any freshness guarantee<br>\\* `if-recent` \- Will make a best effort to return results of profiles no older than 29 days. Costs `1` extra credit per result on top of the base cost of the endpoint for users on the Growth or larger subscription. For all other users, it will cost `2` extra credits per result on top of the base cost of the endpoint.<br>_Note: If `use_cache=if-recent`, `page_size` is limited to a value of `10` or smaller._ | `if-present` |
| `country` | no | Limit the result set to the country locality of the profile. For example, set the parameter of `country=us` if you only want profiles from the US. Or you can set the parameter to `country=us,sg` if you want employees from both the US and Singapore.<br>This parameter accepts a comma-separated case-insensitive values of [Alpha-2 ISO3166 country code](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2).<br>Costs an extra `3` credit per result returned. | `us` |
| `enrich_profiles` | no | Get the full profile of employees instead of only their profile urls.<br>Each request respond with a streaming response of profiles.<br>The valid values are:<br>\\* `skip` (default): lists employee's profile url<br>\\* `enrich`: lists full profile of employees<br>Calling this API endpoint with this parameter would add `1` credit per employee returned. | `enrich` |
| `role_search` | no | Filter employees by their title by matching the employee's title against a _regular expression_.<br>The default value of this parameter is `null`.<br>The accepted value for this parameter is a **case-insensitive** regular expression.<br>(The base cost of calling this API endpoint with this parameter would be `10` credits.<br>Each employee matched and returned would cost 3 extra credits.) | `(co)?-?founder` |
| `page_size` | no | Limit the maximum results returned per API call.<br>The default value of this parameter is `10`.<br>Accepted values for this parameter is an integer ranging from `1` to `200000`.<br>When `enrich_profiles=enrich`, this parameter accepts value ranging from `1` to `10` and the default value is `10`. | `10` |
| `employment_status` | no | Parameter to tell the API to return past or current employees.<br>Valid values are `current`, `past`, and `all`:<br>\\* `current` (default) : lists current employees<br>\\* `past` : lists past employees<br>\\* `all` : lists current & past employees | `current` |
| `sort_by` | no | Sort employees by recency.<br>Valid values are:<br>\\* `recently-joined` \- Sort employees by their join date. The most recent employee is on the top of the list.<br>\\* `recently-left` \- Sort employees by their departure date. The most recent employee who had just left is on the top of this list.<br>\\* `oldest` \- Returns the oldest employees first. The oldest employee who had joined this company historically is on the top of this list.<br>\\* `none` \- The default value. Do not sort.<br>If this parameter is supplied with a value other than `none`, will add `50` credits to the base cost of the API endpoint regardless number of results returned. It will also add an additional cost of `10` credits per employee returned. | `recently-joined` |
| `resolve_numeric_id` | no | Enable support for Company Profile URLs with numerical IDs that you most frequently fetch from Sales Navigator. <br>We achieve this by resolving numerical IDs into vanity IDs with cached company profiles from [LinkDB](https://nubela.co/proxycurl/linkdb). <br>For example, we will turn `https://www.linkedin.com/company/1234567890` to `https://www.linkedin.com/company/acme-corp` \-\- for which the API endpoint only supports the latter.<br>This parameter accepts the following values:<br>\- `false` (default value) - Will not resolve numerical IDs.<br>\- `true` \- Enable support for Company Profile URLs with numerical IDs. <br>Costs an extra `2` credit on top of the base cost of the endpoint. | `false` |

### Response

```
{
    "employees": [\
        {\
            "last_updated": "2023-10-26T11:34:30Z",\
            "profile": {\
                "accomplishment_courses": [],\
                "accomplishment_honors_awards": [],\
                "accomplishment_organisations": [],\
                "accomplishment_patents": [],\
                "accomplishment_projects": [],\
                "accomplishment_publications": [],\
                "accomplishment_test_scores": [],\
                "activities": [],\
                "articles": [],\
                "background_cover_image_url": null,\
                "certifications": [],\
                "city": "Seattle",\
                "connections": null,\
                "country": "US",\
                "country_full_name": "United States of America",\
                "education": [\
                    {\
                        "degree_name": null,\
                        "description": null,\
                        "ends_at": {\
                            "day": 31,\
                            "month": 12,\
                            "year": 1975\
                        },\
                        "field_of_study": null,\
                        "logo_url": "https://media-exp1.licdn.com/dms/image/C4E0BAQF5t62bcL0e9g/company-logo_400_400/0/1519855919126?e=1672876800\u0026v=beta\u0026t=9twXof1JlnNHfFprrDMi-C1Kp55HTT4ahINKHRflUHw",\
                        "school": "Harvard University",\
                        "school_linkedin_profile_url": null,\
                        "starts_at": {\
                            "day": 1,\
                            "month": 1,\
                            "year": 1973\
                        }\
                    },\
                    {\
                        "degree_name": null,\
                        "description": null,\
                        "ends_at": null,\
                        "field_of_study": null,\
                        "logo_url": "https://media-exp1.licdn.com/dms/image/C4D0BAQENlfOPKBEk3Q/company-logo_400_400/0/1519856497259?e=1672876800\u0026v=beta\u0026t=v7nJTPaJMfH7WOBjb22dyvNKxAgdPdVd8uLCUkMB1LQ",\
                        "school": "Lakeside School",\
                        "school_linkedin_profile_url": null,\
                        "starts_at": null\
                    }\
                ],\
                "experiences": [\
                    {\
                        "company": "Breakthrough Energy ",\
                        "company_linkedin_profile_url": "https://www.linkedin.com/company/breakthrough-energy/",\
                        "description": null,\
                        "ends_at": null,\
                        "location": null,\
                        "logo_url": "https://media-exp1.licdn.com/dms/image/C4D0BAQGwD9vNu044FA/company-logo_400_400/0/1601560874941?e=1672876800\u0026v=beta\u0026t=VKb6OAHEwlnazKYKm4fc9go-y4zkUv2BT6tosOdQ54Y",\
                        "starts_at": {\
                            "day": 1,\
                            "month": 1,\
                            "year": 2015\
                        },\
                        "title": "Founder"\
                    },\
                    {\
                        "company": "Bill \u0026 Melinda Gates Foundation",\
                        "company_linkedin_profile_url": "https://www.linkedin.com/company/bill-\u0026-melinda-gates-foundation/",\
                        "description": null,\
                        "ends_at": null,\
                        "location": null,\
                        "logo_url": "https://media-exp1.licdn.com/dms/image/C4E0BAQE7Na_mKQhIJg/company-logo_400_400/0/1633731810932?e=1672876800\u0026v=beta\u0026t=Mz_ntwD4meCMcgo1L3JqDxBQRabFLIesd0Yz2ciAXNs",\
                        "starts_at": {\
                            "day": 1,\
                            "month": 1,\
                            "year": 2000\
                        },\
                        "title": "Co-chair"\
                    }\
                ],\
                "first_name": "Bill",\
                "full_name": "Bill Gates",\
                "groups": [],\
                "headline": "Co-chair, Bill \u0026 Melinda Gates Foundation",\
                "languages": [],\
                "last_name": "Gates",\
                "occupation": "Co-chair at Bill \u0026 Melinda Gates Foundation",\
                "people_also_viewed": [],\
                "profile_pic_url": "https://media.licdn.com/dms/image/C5616AQH9tkBTUhHfng/profile-displaybackgroundimage-shrink_200_800/0/1614530499015?e=2147483647\u0026v=beta\u0026t=VEoCyedtZulnAVYWT9BXfKHi5OFp8avElNjiz8kjSTU",\
                "public_identifier": "williamhgates",\
                "recommendations": [],\
                "similarly_named_profiles": [],\
                "state": "Washington",\
                "summary": "Co-chair of the Bill \u0026 Melinda Gates Foundation. Founder of Breakthrough Energy. Co-founder of Microsoft. Voracious reader. Avid traveler. Active blogger.",\
                "volunteer_work": []\
            },\
            "profile_url": "https://www.linkedin.com/in/williamhgates"\
        }\
    ],
    "next_page": null
}

```

| Key | Description | Example |
| --- | --- | --- |
| employees | A list of employee profiles (if enriched) and their associated profile URL. | See [Employee](https://nubela.co/proxycurl/docs#company-api-employee-listing-endpoint-response-employee) object |
| next\_page | The API URI that will lead to the next page of results. This will be null for the final page. | `null` |

#### Employee

| Key | Description | Example |
| --- | --- | --- |
| profile\_url | LinkedIn Profile URL of the employee. | `"https://www.linkedin.com/in/williamhgates"` |
| profile | Enriched profile data of the employee. | `{"accomplishment_courses": [], "accomplishment_honors_awards": [], "accomplishment_organisations": [], "accomplishment_patents": [], "accomplishment_projects": [], "accomplishment_publications": [], "accomplishment_test_scores": [], "activities": [], "articles": [], "background_cover_image_url": null, "certifications": [], "city": "Seattle", "connections": null, "country": "US", "country_full_name": "United States of America", "education": [{"degree_name": null, "description": null, "ends_at": {"day": 31, "month": 12, "year": 1975}, "field_of_study": null, "logo_url": "https://media-exp1.licdn.com/dms/image/C4E0BAQF5t62bcL0e9g/company-logo_400_400/0/1519855919126?e=1672876800\u0026v=beta\u0026t=9twXof1JlnNHfFprrDMi-C1Kp55HTT4ahINKHRflUHw", "school": "Harvard University", "school_linkedin_profile_url": null, "starts_at": {"day": 1, "month": 1, "year": 1973}}, {"degree_name": null, "description": null, "ends_at": null, "field_of_study": null, "logo_url": "https://media-exp1.licdn.com/dms/image/C4D0BAQENlfOPKBEk3Q/company-logo_400_400/0/1519856497259?e=1672876800\u0026v=beta\u0026t=v7nJTPaJMfH7WOBjb22dyvNKxAgdPdVd8uLCUkMB1LQ", "school": "Lakeside School", "school_linkedin_profile_url": null, "starts_at": null}], "experiences": [{"company": "Breakthrough Energy ", "company_linkedin_profile_url": "https://www.linkedin.com/company/breakthrough-energy/", "description": null, "ends_at": null, "location": null, "logo_url": "https://media-exp1.licdn.com/dms/image/C4D0BAQGwD9vNu044FA/company-logo_400_400/0/1601560874941?e=1672876800\u0026v=beta\u0026t=VKb6OAHEwlnazKYKm4fc9go-y4zkUv2BT6tosOdQ54Y", "starts_at": {"day": 1, "month": 1, "year": 2015}, "title": "Founder"}, {"company": "Bill \u0026 Melinda Gates Foundation", "company_linkedin_profile_url": "https://www.linkedin.com/company/bill-\u0026-melinda-gates-foundation/", "description": null, "ends_at": null, "location": null, "logo_url": "https://media-exp1.licdn.com/dms/image/C4E0BAQE7Na_mKQhIJg/company-logo_400_400/0/1633731810932?e=1672876800\u0026v=beta\u0026t=Mz_ntwD4meCMcgo1L3JqDxBQRabFLIesd0Yz2ciAXNs", "starts_at": {"day": 1, "month": 1, "year": 2000}, "title": "Co-chair"}], "first_name": "Bill", "full_name": "Bill Gates", "groups": [], "headline": "Co-chair, Bill \u0026 Melinda Gates Foundation", "languages": [], "last_name": "Gates", "occupation": "Co-chair at Bill \u0026 Melinda Gates Foundation", "people_also_viewed": [], "profile_pic_url": "https://media.licdn.com/dms/image/C5616AQH9tkBTUhHfng/profile-displaybackgroundimage-shrink_200_800/0/1614530499015?e=2147483647\u0026v=beta\u0026t=VEoCyedtZulnAVYWT9BXfKHi5OFp8avElNjiz8kjSTU", "public_identifier": "williamhgates", "recommendations": [], "similarly_named_profiles": [], "state": "Washington", "summary": "Co-chair of the Bill \u0026 Melinda Gates Foundation. Founder of Breakthrough Energy. Co-founder of Microsoft. Voracious reader. Avid traveler. Active blogger.", "volunteer_work": []}` |
| last\_updated | ISO 8601 timestamp since the enriched profile was last scraped. | `"2023-10-26T11:34:30Z"` |

### Response Headers

| Header Key | Description | Example |
| --- | --- | --- |
| `X-Proxycurl-Credit-Cost` | Total cost of credits for this API call | `3` |

## Employee Count Endpoint

`GET /proxycurl/api/linkedin/company/employees/count`

Cost: `1` credit / successful request.
Extra charges might be incurred if premium optional parameters are used. Please read the description of the parameters that you intend to use. Credits are charged even if a successful request returns an empty result.

Get a number of total employees of a Company.

Get an employee count of this company from various sources.

```
curl \
    -G \
    -H "Authorization: Bearer ${YOUR_API_KEY}" \
    'https://nubela.co/proxycurl/api/linkedin/company/employees/count' \
    --data-urlencode 'url=https://www.linkedin.com/company/apple/' \
    --data-urlencode 'coy_name_match=include' \
    --data-urlencode 'at_date=2023-12-31' \
    --data-urlencode 'use_cache=if-present' \
    --data-urlencode 'linkedin_employee_count=include' \
    --data-urlencode 'employment_status=current'

```

```
import requests

api_key = 'YOUR_API_KEY'
headers = {'Authorization': 'Bearer ' + api_key}
api_endpoint = 'https://nubela.co/proxycurl/api/linkedin/company/employees/count'
params = {
    'url': 'https://www.linkedin.com/company/apple/',
    'coy_name_match': 'include',
    'at_date': '2023-12-31',
    'use_cache': 'if-present',
    'linkedin_employee_count': 'include',
    'employment_status': 'current',
}
response = requests.get(api_endpoint,
                        params=params,
                        headers=headers)

```

[![Run in Postman](https://run.pstmn.io/button.svg)](https://pxlcl.co/run-collection)

### URL Parameters

| Parameter | Required | Description | Example |
| --- | --- | --- | --- |
| `url` | yes | URL of the LinkedIn Company Profile to target.<br>URL should be in the format of `https://www.linkedin.com/company/<public_identifier>` | `https://www.linkedin.com/company/apple/` |
| `coy_name_match` | no | Include profiles that match the company name. The Employee Count Endpoint works by identifying individual profiles with work experience that provides an exact match to the LinkedIn Company Profile URL provided. Including this option also allows profiles with at least one work experience that exactly matches the specified company name to be included.<br>This parameter accepts the following values:<br>\\* `include` (default value) - Include employees whose profiles match the company name.<br>\\* `exclude` \- Exclude employees by company name match. | `include` |
| `at_date` | no | Time travel back in time and fetch the employee count of a company at any particular date. This parameter takes an ISO8601 timestamp with the representation of "YYYY-MM-DD".<br>Costs `1` extra credit on top of the base cost of the endpoint for users on the Growth or larger subscription. For all other users, it will cost `5` extra credits. | `2023-12-31` |
| `use_cache` | no | `if-present`: The default behavior. Fetches data from LinkDB cache regardless of age of profile.<br>`if-recent`: API will make a best effort to return a fresh data no older than 29 days. Costs an extra 1 credit on top of the cost of the base endpoint.<br>\- Note: When `use_cache=if-recent`, the `linkedin_employee_count` parameter must be included with a value of 'include'. | `if-present` |
| `linkedin_employee_count` | no | Option to include a scraped employee count value from the target company's LinkedIn profile.<br>Valid values are `include` and `exclude`:<br>\\* `exclude` (default) : To exclude the scraped employee count.<br>\\* `include` : To include the scraped employee count.<br>Costs an extra `1` credit on top of the base cost of the endpoint. | `include` |
| `employment_status` | no | Parameter to tell the API to filter past or current employees.<br>Valid values are `current`, `past`, and `all`:<br>\\* `current` (default) : count current employees<br>\\* `past` : count past employees<br>\\* `all` : count current & past employees | `current` |

### Response

```
{
    "linkdb_employee_count": 3,
    "linkedin_employee_count": 529274
}

```

| Key | Description | Example |
| --- | --- | --- |
| linkedin\_employee\_count | The scraped value of employee count of this company from it's LinkedIn profile. This value does not respect `employement_status` parameter. It will always return the curent employee count of this company from LinkedIn. | `99` |
| linkdb\_employee\_count | The total number of employees found in LinkDB for this company. This value is limited by pre-crawled LinkedIn profiles stored in [LinkDB](https://nubela.co/proxycurl/linkdb) | `3` |

### Response Headers

| Header Key | Description | Example |
| --- | --- | --- |
| `X-Proxycurl-Credit-Cost` | Total cost of credits for this API call | `1` |

## Company Profile Picture Endpoint

`GET /proxycurl/api/linkedin/company/profile-picture`

Cost: `0` credit / successful request.
This free API endpoint is unlocked after your first payment top-up and will remain free perpetually.
Prior to the first top-up, this endpoint costs `1` credit / successful request.

Get the profile picture of a company.

Profile pictures are served from cached company profiles found within [LinkDB](https://nubela.co/proxycurl/linkdb).
If the profile does not exist within [LinkDB](https://nubela.co/proxycurl/linkdb), then the API will return a `404` status code.

```
curl \
    -G \
    -H "Authorization: Bearer ${YOUR_API_KEY}" \
    'https://nubela.co/proxycurl/api/linkedin/company/profile-picture' \
    --data-urlencode 'linkedin_company_profile_url=https://www.linkedin.com/company/apple/'

```

```
import requests

api_key = 'YOUR_API_KEY'
headers = {'Authorization': 'Bearer ' + api_key}
api_endpoint = 'https://nubela.co/proxycurl/api/linkedin/company/profile-picture'
params = {
    'linkedin_company_profile_url': 'https://www.linkedin.com/company/apple/',
}
response = requests.get(api_endpoint,
                        params=params,
                        headers=headers)

```

[![Run in Postman](https://run.pstmn.io/button.svg)](https://pxlcl.co/run-collection)

### URL Parameters

| Parameter | Required | Description | Example |
| --- | --- | --- | --- |
| `linkedin_company_profile_url` | yes | LinkedIn Profile URL of the company that you are trying to get the profile picture of. | `https://www.linkedin.com/company/apple/` |

### Response

```
{
    "tmp_profile_pic_url": "https://media.licdn.com/dms/image/C5616AQH9tkBTUhHfng/profile-displaybackgroundimage-shrink_200_800/0/1614530499015?e=2147483647\u0026v=beta\u0026t=VEoCyedtZulnAVYWT9BXfKHi5OFp8avElNjiz8kjSTU"
}

```

| Key | Description | Example |
| --- | --- | --- |
| tmp\_profile\_pic\_url | Temporary URL to the profile picture (valid for just 30 minutes).<br>See this [blog post](https://nubela.co/blog/why-is-the-api-returning-s3-links-for-profile-pictures-scraped-from-linkedin-profiles/) for more information. | `"https://s3.us-west-000.backblazeb2.com/proxycurl/"` |

### Response Headers

| Header Key | Description | Example |
| --- | --- | --- |
| `X-Proxycurl-Credit-Cost` | Total cost of credits for this API call | `0` |

## Company Lookup Endpoint

`GET /proxycurl/api/linkedin/company/resolve`

Cost: `2` credits / successful request.
Credits are charged even if a successful request returns an empty result.

Resolve Company LinkedIn Profile from company name,
domain name and location.

```
curl \
    -G \
    -H "Authorization: Bearer ${YOUR_API_KEY}" \
    'https://nubela.co/proxycurl/api/linkedin/company/resolve' \
    --data-urlencode 'company_domain=accenture.com' \
    --data-urlencode 'company_name=Accenture' \
    --data-urlencode 'company_location=sg' \
    --data-urlencode 'enrich_profile=enrich'

```

```
import requests

api_key = 'YOUR_API_KEY'
headers = {'Authorization': 'Bearer ' + api_key}
api_endpoint = 'https://nubela.co/proxycurl/api/linkedin/company/resolve'
params = {
    'company_domain': 'accenture.com',
    'company_name': 'Accenture',
    'company_location': 'sg',
    'enrich_profile': 'enrich',
}
response = requests.get(api_endpoint,
                        params=params,
                        headers=headers)

```

[![Run in Postman](https://run.pstmn.io/button.svg)](https://pxlcl.co/run-collection)

### URL Parameters

| Parameter | Required | Description | Example |
| --- | --- | --- | --- |
| `company_domain` | Requires either `company_domain` or `company_name` | Company website or Company domain | `accenture.com` |
| `company_name` | Requires either `company_domain` or `company_name` | Company Name | `Accenture` |
| `company_location` | no | The location / region of company.<br>ISO 3166-1 alpha-2 codes | `sg` |
| `enrich_profile` | no | Enrich the result with a cached profile of the lookup result.<br>The valid values are:<br>\\* `skip` (default): do not enrich the results with cached profile data<br>\\* `enrich`: enriches the result with cached profile data<br>Calling this API endpoint with this parameter would add 1 credit.<br>If you require [fresh profile data](https://nubela.co/blog/how-fresh-are-profiles-returned-by-proxycurl-api/),<br>please chain this API call with the [Company Profile Endpoint](https://nubela.co/proxycurl/docs#company-api-company-profile-endpoint) with the `use_cache=if-recent` parameter. | `enrich` |

### Response

```
{
    "last_updated": "2023-10-26T11:33:24Z",
    "profile": {
        "acquisitions": null,
        "affiliated_companies": [\
            {\
                "industry": "IT Services and IT Consulting",\
                "link": "https://in.linkedin.com/company/accentureindia",\
                "location": "Bengaluru, Karnatka",\
                "name": "Accenture in India"\
            },\
            {\
                "industry": "IT Services and IT Consulting",\
                "link": "https://br.linkedin.com/company/accenturebrasil",\
                "location": "S\u00e3o Paulo, S\u00e3o Paulo",\
                "name": "Accenture Brasil"\
            }\
        ],
        "background_cover_image_url": "https://media.licdn.com/dms/image/D4E3DAQEJ2lIxxNO81Q/image-scale_191_1128/0/1689359170613/accenture_cover?e=1698901200\u0026v=beta\u0026t=8ygpwsa5GjMoubooCGg1MqfGomnBaU9WHwnI3_Ek0_0",
        "categories": null,
        "company_size": [\
            10001,\
            null\
        ],
        "company_size_on_linkedin": 541251,
        "company_type": "PUBLIC_COMPANY",
        "description": "Accenture is a global professional services company with leading capabilities in digital, cloud, and security. Combining unmatched experience and specialized skills across more than 40 industries, we offer Strategy and Consulting, Technology and Operations Services, and Accenture Song\u2014all powered by the world\u2019s largest network of Advanced Technology and Intelligent Operations centers. \n\nOur people deliver on the promise of technology and human ingenuity every day, serving clients in more than 120 countries. We embrace the power of change to create value and shared success for our clients, people, shareholders, partners, and communities. \n\nVisit us at accenture.com.",
        "exit_data": null,
        "extra": null,
        "follower_count": 11125167,
        "founded_year": null,
        "funding_data": null,
        "hq": {
            "city": "Dublin 2",
            "country": "IE",
            "is_hq": true,
            "line_1": "Grand Canal Harbour",
            "postal_code": null,
            "state": null
        },
        "industry": "Business Consulting and Services",
        "linkedin_internal_id": "1033",
        "locations": [\
            {\
                "city": "Dublin 2",\
                "country": "IE",\
                "is_hq": true,\
                "line_1": "Grand Canal Harbour",\
                "postal_code": null,\
                "state": null\
            },\
            {\
                "city": "San Francisco",\
                "country": "US",\
                "is_hq": false,\
                "line_1": "415 Mission Street Floor 31-34",\
                "postal_code": "94105",\
                "state": "California"\
            }\
        ],
        "name": "Accenture",
        "profile_pic_url": "https://media.licdn.com/dms/image/D4E0BAQGTUswcRlgg9A/company-logo_200_200/0/1689352303421/accenture_logo?e=2147483647\u0026v=beta\u0026t=cjQy2p9bf0c2mJqCNVzaiLqdByE0zboCX3vY5m4gRuY",
        "search_id": "1033",
        "similar_companies": [\
            {\
                "industry": "Business Consulting and Services",\
                "link": "https://www.linkedin.com/company/deloitte",\
                "location": null,\
                "name": "Deloitte"\
            },\
            {\
                "industry": "IT Services and IT Consulting",\
                "link": "https://in.linkedin.com/company/tata-consultancy-services",\
                "location": "Mumbai, Maharashtra",\
                "name": "Tata Consultancy Services"\
            }\
        ],
        "specialities": [\
            "Management Consulting",\
            "Systems Integration and Technology"\
        ],
        "tagline": null,
        "universal_name_id": "accenture",
        "updates": [\
            {\
                "article_link": null,\
                "image": null,\
                "posted_on": {\
                    "day": 25,\
                    "month": 10,\
                    "year": 2023\
                },\
                "text": "Explore #AccentureLifeTrends 2024 to learn more: https://accntu.re/3MfdMg4",\
                "total_likes": 325\
            },\
            {\
                "article_link": null,\
                "image": "https://media.licdn.com/dms/image/D5610AQEMoO_uNVz5BQ/ads-video-thumbnail_720_1280/0/1698154984087?e=1698901200\u0026v=beta\u0026t=WTxhLNSbSM-UBnFIcqYX4bdVhVUD6OoOoffR0xQnlDA",\
                "posted_on": {\
                    "day": 25,\
                    "month": 10,\
                    "year": 2023\
                },\
                "text": "The ability to learn new things, without forgetting those that came before, is a huge differentiator between the #AI we\u0027re familiar with, and the #GenerativeAI powered by foundation models that we\u0027re seeing now.\n \nDiscover the trends shaping the next decade: https://accntu.re/474YxOH\n \n#TechVision2023",\
                "total_likes": 541\
            }\
        ],
        "website": "http://www.accenture.com"
    },
    "url": "https://www.linkedin.com/company/accenture"
}

```

| Key | Description | Example |
| --- | --- | --- |
| url | The LinkedIn profile URL | `"https://www.linkedin.com/company/accenture"` |
| profile | A [LinkedinCompany](https://nubela.co/proxycurl/docs#company-api-company-lookup-endpoint-response-linkedincompany) object | See [LinkedinCompany](https://nubela.co/proxycurl/docs#company-api-company-lookup-endpoint-response-linkedincompany) object |
| last\_updated | ISO 8601 timestamp since the enriched profile was last scraped. | `"2023-10-26T11:33:24Z"` |

#### LinkedinCompany

| Key | Description | Example |
| --- | --- | --- |
| linkedin\_internal\_id | LinkedIn's Internal and immutable ID of this Company profile. | `"1033"` |
| description | A textual description of the company. | `"Accenture is a global professional services company with leading capabilities in digital, cloud, and security. Combining unmatched experience and specialized skills across more than 40 industries, we offer Strategy and Consulting, Technology and Operations Services, and Accenture Song\u2014all powered by the world\u2019s largest network of Advanced Technology and Intelligent Operations centers. \n\nOur people deliver on the promise of technology and human ingenuity every day, serving clients in more than 120 countries. We embrace the power of change to create value and shared success for our clients, people, shareholders, partners, and communities. \n\nVisit us at accenture.com."` |
| website | The URL of the company's website. | `"http://www.accenture.com"` |
| industry | The `industry` attribute, found in a LinkedIn Company profile, describes the industry in which the company operates. The value of this attribute is an enumerator. [This CSV file provides an exhaustive list of possible values for this attribute](https://drive.google.com/file/d/1T-ULD_mFc8lPogyVabtx-fereXENIhor/view). | `"Business Consulting and Services"` |
| company\_size | Sequenceed range of company head count | `[10001, null]` |
| company\_size\_on\_linkedin | The size of the company as indicated on LinkedIn. | `541251` |
| hq | A [CompanyLocation](https://nubela.co/proxycurl/docs#company-api-company-lookup-endpoint-response-companylocation) object | See [CompanyLocation](https://nubela.co/proxycurl/docs#company-api-company-lookup-endpoint-response-companylocation) object |
| company\_type | Possible values:<br>`EDUCATIONAL`: Educational Institution<br>`GOVERNMENT_AGENCY`: Government Agency<br>`NON_PROFIT` : Nonprofit<br>`PARTNERSHIP` : Partnership<br>`PRIVATELY_HELD`: Privately Held<br>`PUBLIC_COMPANY`: Public Company<br>`SELF_EMPLOYED`: Self-Employed<br>`SELF_OWNED`: Sole Proprietorship | `"PUBLIC_COMPANY"` |
| founded\_year | The year the company was founded. | `null` |
| specialities | A list of specialities. | `["Management Consulting", "Systems Integration and Technology"]` |
| locations | list of [CompanyLocation](https://nubela.co/proxycurl/docs#company-api-company-lookup-endpoint-response-companylocation) | See [CompanyLocation](https://nubela.co/proxycurl/docs#company-api-company-lookup-endpoint-response-companylocation) object |
| name | The name of the company. | `"Accenture"` |
| tagline | A short, catchy phrase that represents the company's mission or brand. | `"Think Different - But Not Too Different"` |
| universal\_name\_id | A unique numerical identifier for the company used in the LinkedIn platform. | `"accenture"` |
| profile\_pic\_url | The URL of the company's profile picture. | `"https://media.licdn.com/dms/image/D4E0BAQGTUswcRlgg9A/company-logo_200_200/0/1689352303421/accenture_logo?e=2147483647\u0026v=beta\u0026t=cjQy2p9bf0c2mJqCNVzaiLqdByE0zboCX3vY5m4gRuY"` |
| background\_cover\_image\_url | The URL of the company's background cover image. | `"https://media.licdn.com/dms/image/D4E3DAQEJ2lIxxNO81Q/image-scale_191_1128/0/1689359170613/accenture_cover?e=1698901200\u0026v=beta\u0026t=8ygpwsa5GjMoubooCGg1MqfGomnBaU9WHwnI3_Ek0_0"` |
| search\_id | Useable with [Job listing endpoint](https://nubela.co/proxycurl/docs#jobs-api-jobs-listing-endpoint) | `"1033"` |
| similar\_companies | list of [SimilarCompany](https://nubela.co/proxycurl/docs#company-api-company-lookup-endpoint-response-similarcompany) | See [SimilarCompany](https://nubela.co/proxycurl/docs#company-api-company-lookup-endpoint-response-similarcompany) object |
| affiliated\_companies | list of [AffiliatedCompany](https://nubela.co/proxycurl/docs#company-api-company-lookup-endpoint-response-affiliatedcompany) | See [AffiliatedCompany](https://nubela.co/proxycurl/docs#company-api-company-lookup-endpoint-response-affiliatedcompany) object |
| updates | A list of post updates made by the company. This field is not guaranteed to be returned. Do not rely on this attribute in production. | See [CompanyUpdate](https://nubela.co/proxycurl/docs#company-api-company-lookup-endpoint-response-companyupdate) object |
| follower\_count | The number of followers the company has on LinkedIn. | `11125167` |
| acquisitions | A [Acquisition](https://nubela.co/proxycurl/docs#company-api-company-lookup-endpoint-response-acquisition) object | See [Acquisition](https://nubela.co/proxycurl/docs#company-api-company-lookup-endpoint-response-acquisition) object |
| exit\_data | list of [Exit](https://nubela.co/proxycurl/docs#company-api-company-lookup-endpoint-response-exit) | See [Exit](https://nubela.co/proxycurl/docs#company-api-company-lookup-endpoint-response-exit) object |
| extra | Company extra when `extra=include` | See [CompanyDetails](https://nubela.co/proxycurl/docs#company-api-company-lookup-endpoint-response-companydetails) object |
| funding\_data | Company Funding data when `funding_data=include` | See [Funding](https://nubela.co/proxycurl/docs#company-api-company-lookup-endpoint-response-funding) object |
| categories | The `categories` attribute is fetched from the company's Crunchbase profile. Values for this attribute are free-form text, and there is no exhaustive list of categories. Consider the categories attribute as "hints" regarding the products or services offered by the company. | `["artificial-intelligence", "virtual-reality"]` |

#### CompanyLocation

| Key | Description | Example |
| --- | --- | --- |
| country |  | `"IE"` |
| city |  | `"Dublin 2"` |
| postal\_code |  | `null` |
| line\_1 |  | `"Grand Canal Harbour"` |
| is\_hq |  | `true` |
| state |  | `null` |

#### SimilarCompany

| Key | Description | Example |
| --- | --- | --- |
| name |  | `"Deloitte"` |
| link |  | `"https://www.linkedin.com/company/deloitte"` |
| industry |  | `"Business Consulting and Services"` |
| location |  | `null` |

#### AffiliatedCompany

| Key | Description | Example |
| --- | --- | --- |
| name |  | `"LinkedIn"` |
| link |  | `"https://www.linkedin.com/company/linkedin"` |
| industry |  | `"Internet"` |
| location |  | `"Sunnyvale, California"` |

#### CompanyUpdate

| Key | Description | Example |
| --- | --- | --- |
| article\_link | The URL for which the post links out to | `"https://lnkd.in/gr7cb5by"` |
| image | The URL to the image to the post (if it exists) | `"https://media-exp1.licdn.com/dms/image/C5622AQEGh8idEAm14Q/feedshare-shrink_800/0/1633089889886?e=1637798400\u0026v=beta\u0026t=LtGtAUSJNrPYdHpVhTBLhGTWYqrHtFJ86PKSmTpou7c"` |
| posted\_on | A [Date](https://nubela.co/proxycurl/docs#company-api-company-lookup-endpoint-response-date) object | See [Date](https://nubela.co/proxycurl/docs#company-api-company-lookup-endpoint-response-date) object |
| text | The body of the update | `"Introducing Personal Email Lookup API https://lnkd.in/gr7cb5by"` |
| total\_likes | The total likes a post has received | `3` |

#### Date

| Key | Description | Example |
| --- | --- | --- |
| day |  | `30` |
| month |  | `9` |
| year |  | `2023` |

#### Acquisition

| Key | Description | Example |
| --- | --- | --- |
| acquired | list of [AcquiredCompany](https://nubela.co/proxycurl/docs#company-api-company-lookup-endpoint-response-acquiredcompany) | See [AcquiredCompany](https://nubela.co/proxycurl/docs#company-api-company-lookup-endpoint-response-acquiredcompany) object |
| acquired\_by | A [Acquisitor](https://nubela.co/proxycurl/docs#company-api-company-lookup-endpoint-response-acquisitor) object | See [Acquisitor](https://nubela.co/proxycurl/docs#company-api-company-lookup-endpoint-response-acquisitor) object |

#### AcquiredCompany

| Key | Description | Example |
| --- | --- | --- |
| linkedin\_profile\_url | LinkedIn Company Profile URL of company that was involved | `"https://www.linkedin.com/company/apple"` |
| crunchbase\_profile\_url | Crunchbase Profile URL of company that was involved | `"https://www.crunchbase.com/organization/apple"` |
| announced\_date | Date by which this event was announced | See [Date](https://nubela.co/proxycurl/docs#company-api-company-lookup-endpoint-response-date) object |
| price | Price of acquisition | `300000000` |

#### Acquisitor

| Key | Description | Example |
| --- | --- | --- |
| linkedin\_profile\_url | LinkedIn Company Profile URL of company that was involved | `"https://www.linkedin.com/company/nvidia"` |
| crunchbase\_profile\_url | Crunchbase Profile URL of company that was involved | `"https://www.crunchbase.com/organization/nvidia"` |
| announced\_date | Date by which this event was announced | See [Date](https://nubela.co/proxycurl/docs#company-api-company-lookup-endpoint-response-date) object |
| price | Price of acquisition | `10000` |

#### Exit

| Key | Description | Example |
| --- | --- | --- |
| linkedin\_profile\_url | LinkedIn Profile URL of the company that has exited | `"https://www.linkedin.com/company/motiondsp"` |
| crunchbase\_profile\_url | Crunchbase Profile URL of the company that has exited | `"https://www.crunchbase.com/organization/motiondsp"` |
| name | Name of the company | `"MotionDSP"` |

#### CompanyDetails

| Key | Description | Example |
| --- | --- | --- |
| crunchbase\_profile\_url | Crunchbase Profile URL of the company | `"https://www.crunchbase.com/organization/nvidia"` |
| ipo\_status | IPO status of the company | `"Public"` |
| crunchbase\_rank | A measure of prominence of this company by Crunchbase | `13` |
| founding\_date | Date of founding | See [Date](https://nubela.co/proxycurl/docs#company-api-company-lookup-endpoint-response-date) object |
| operating\_status | Status of the company's operational status | `"Active"` |
| company\_type | Type of company | `"For Profit"` |
| contact\_email | General contact email of the company | `"info@nvidia.com"` |
| phone\_number | General contact number of the company | `"(140) 848-6200"` |
| facebook\_id | ID of the company's official Facebook account | `"NVIDIA.IN"` |
| twitter\_id | ID of the company's official Twitter account | `"nvidia"` |
| number\_of\_funding\_rounds | Total rounds of funding that this company has raised | `3` |
| total\_funding\_amount | Total venture capital raised by this company | `4000000` |
| stock\_symbol | Stock symbol of this public company | `"NASDAQ:NVDA"` |
| ipo\_date | The date by which this public company went public | See [Date](https://nubela.co/proxycurl/docs#company-api-company-lookup-endpoint-response-date) object |
| number\_of\_lead\_investors | Total lead investors | `3` |
| number\_of\_investors | Total investors | `4` |
| total\_fund\_raised | The total amount of funds raised (by this VC firm) to be deployed as<br>subsidiary investments (applicable only for VC firms) | `1000` |
| number\_of\_investments | Total investments made by this VC firm (applicable only for VC firms) | `50` |
| number\_of\_lead\_investments | Total investments that was led by this VC firm<br>(applicable only for VC firms) | `3` |
| number\_of\_exits | Total exits by this VC (applicable only for VC firms) | `7` |
| number\_of\_acquisitions | Total companies acquired by this company | `2` |

#### Funding

| Key | Description | Example |
| --- | --- | --- |
| funding\_type | Type of funding | `"Grant"` |
| money\_raised | Amount of money raised | `25000000` |
| announced\_date | Date of announcement | See [Date](https://nubela.co/proxycurl/docs#company-api-company-lookup-endpoint-response-date) object |
| number\_of\_investor | Number of investors in this round | `1` |
| investor\_list | list of [Investor](https://nubela.co/proxycurl/docs#company-api-company-lookup-endpoint-response-investor) | See [Investor](https://nubela.co/proxycurl/docs#company-api-company-lookup-endpoint-response-investor) object |

#### Investor

| Key | Description | Example |
| --- | --- | --- |
| linkedin\_profile\_url | LinkedIn Profile URL of investor | `"https://linkedin.com/company/darpa"` |
| name | Name of investor | `"DARPA"` |
| type | Type of investor | `"organization"` |

### Response Headers

| Header Key | Description | Example |
| --- | --- | --- |
| `X-Proxycurl-Credit-Cost` | Total cost of credits for this API call | `2` |

### Remarks

The accuracy of the linkedin company profile returned is on a
best-effort basis. Results are not guaranteed to be accurate.
We are always improving on the accuracy of these endpoints
iteratively.

## Employee Search Endpoint

`GET /proxycurl/api/linkedin/company/employee/search/`

Cost: `10` credits / successful request.
\+ `6` credits / employee returned. Extra charges might be incurred if premium optional parameters are used. Please read the description of the parameters that you intend to use.

Search employees of a target by their job title. This API endpoint is syntactic
sugar for the role\_search parameter under the [Employee Listing Endpoint](https://nubela.co/proxycurl/docs#company-api-employee-listing-endpoint).
This API endpoint is powered by [LinkDB](https://nubela.co/proxycurl/linkdb), our comprehensive dataset of people
and company profiles. For a detailed comparison between this API endpoint
and the [Role Lookup Endpoint](https://nubela.co/proxycurl/docs#people-api-role-lookup-endpoint) or the [Person Search Endpoint](https://nubela.co/proxycurl/docs#search-api-person-search-endpoint), refer to [this article](https://nubela.co/blog/what-is-the-difference-between-the-person-search-endpoint-role-lookup-endpoint-and-the-employee-search-endpoint).

```
curl \
    -G \
    -H "Authorization: Bearer ${YOUR_API_KEY}" \
    'https://nubela.co/proxycurl/api/linkedin/company/employee/search/' \
    --data-urlencode 'linkedin_company_profile_url=https://www.linkedin.com/company/microsoft/' \
    --data-urlencode 'keyword_regex=ceo|cto' \
    --data-urlencode 'page_size=10' \
    --data-urlencode 'country=us' \
    --data-urlencode 'enrich_profiles=enrich' \
    --data-urlencode 'resolve_numeric_id=false'

```

```
import requests

api_key = 'YOUR_API_KEY'
headers = {'Authorization': 'Bearer ' + api_key}
api_endpoint = 'https://nubela.co/proxycurl/api/linkedin/company/employee/search/'
params = {
    'linkedin_company_profile_url': 'https://www.linkedin.com/company/microsoft/',
    'keyword_regex': 'ceo|cto',
    'page_size': '10',
    'country': 'us',
    'enrich_profiles': 'enrich',
    'resolve_numeric_id': 'false',
}
response = requests.get(api_endpoint,
                        params=params,
                        headers=headers)

```

[![Run in Postman](https://run.pstmn.io/button.svg)](https://pxlcl.co/run-collection)

### URL Parameters

| Parameter | Required | Description | Example |
| --- | --- | --- | --- |
| `linkedin_company_profile_url` | yes | LinkedIn Profile URL of the target company. | `https://www.linkedin.com/company/microsoft/` |
| `keyword_regex` | yes | Job title keyword to search for in regular expression format.<br>The accepted value for this parameter is a **case-insensitive** regular expression. | `ceo|cto` |
| `page_size` | no | Tune the maximum results returned per API call.<br>The default value of this parameter is `200000`.<br>Accepted values for this parameter is an integer ranging from `1` to `200000`.<br>When `enrich_profiles=enrich`, this parameter accepts value ranging from `1` to `10` and the default value is `100`. | `10` |
| `country` | no | Limit the result set to the country locality of the profile. For example, set the parameter of `country=us` if you only want profiles from the US.<br>This parameter accepts a case-insensitive [Alpha-2 ISO3166 country code](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2).<br>Costs an extra `3` credit per result returned. | `us` |
| `enrich_profiles` | no | Get the full profile of employees instead of only their profile urls.<br>Each request respond with a streaming response of profiles.<br>The valid values are:<br>\\* `skip` (default): lists employee's profile url<br>\\* `enrich`: lists full profile of employees<br>Calling this API endpoint with this parameter would add `1` credit per employee returned. | `enrich` |
| `resolve_numeric_id` | no | Enable support for Company Profile URLs with numerical IDs that you most frequently fetch from Sales Navigator. <br>We achieve this by resolving numerical IDs into vanity IDs with cached company profiles from [LinkDB](https://nubela.co/proxycurl/linkdb). <br>For example, we will turn `https://www.linkedin.com/company/1234567890` to `https://www.linkedin.com/company/acme-corp` \-\- for which the API endpoint only supports the latter.<br>This parameter accepts the following values:<br>\- `false` (default value) - Will not resolve numerical IDs.<br>\- `true` \- Enable support for Company Profile URLs with numerical IDs. <br>Costs an extra `2` credit on top of the base cost of the endpoint. | `false` |

### Response

```
{
    "employees": [\
        {\
            "last_updated": "2023-10-26T11:34:30Z",\
            "profile": {\
                "accomplishment_courses": [],\
                "accomplishment_honors_awards": [],\
                "accomplishment_organisations": [],\
                "accomplishment_patents": [],\
                "accomplishment_projects": [],\
                "accomplishment_publications": [],\
                "accomplishment_test_scores": [],\
                "activities": [],\
                "articles": [],\
                "background_cover_image_url": null,\
                "certifications": [],\
                "city": "Seattle",\
                "connections": null,\
                "country": "US",\
                "country_full_name": "United States of America",\
                "education": [\
                    {\
                        "degree_name": null,\
                        "description": null,\
                        "ends_at": {\
                            "day": 31,\
                            "month": 12,\
                            "year": 1975\
                        },\
                        "field_of_study": null,\
                        "logo_url": "https://media-exp1.licdn.com/dms/image/C4E0BAQF5t62bcL0e9g/company-logo_400_400/0/1519855919126?e=1672876800\u0026v=beta\u0026t=9twXof1JlnNHfFprrDMi-C1Kp55HTT4ahINKHRflUHw",\
                        "school": "Harvard University",\
                        "school_linkedin_profile_url": null,\
                        "starts_at": {\
                            "day": 1,\
                            "month": 1,\
                            "year": 1973\
                        }\
                    },\
                    {\
                        "degree_name": null,\
                        "description": null,\
                        "ends_at": null,\
                        "field_of_study": null,\
                        "logo_url": "https://media-exp1.licdn.com/dms/image/C4D0BAQENlfOPKBEk3Q/company-logo_400_400/0/1519856497259?e=1672876800\u0026v=beta\u0026t=v7nJTPaJMfH7WOBjb22dyvNKxAgdPdVd8uLCUkMB1LQ",\
                        "school": "Lakeside School",\
                        "school_linkedin_profile_url": null,\
                        "starts_at": null\
                    }\
                ],\
                "experiences": [\
                    {\
                        "company": "Breakthrough Energy ",\
                        "company_linkedin_profile_url": "https://www.linkedin.com/company/breakthrough-energy/",\
                        "description": null,\
                        "ends_at": null,\
                        "location": null,\
                        "logo_url": "https://media-exp1.licdn.com/dms/image/C4D0BAQGwD9vNu044FA/company-logo_400_400/0/1601560874941?e=1672876800\u0026v=beta\u0026t=VKb6OAHEwlnazKYKm4fc9go-y4zkUv2BT6tosOdQ54Y",\
                        "starts_at": {\
                            "day": 1,\
                            "month": 1,\
                            "year": 2015\
                        },\
                        "title": "Founder"\
                    },\
                    {\
                        "company": "Bill \u0026 Melinda Gates Foundation",\
                        "company_linkedin_profile_url": "https://www.linkedin.com/company/bill-\u0026-melinda-gates-foundation/",\
                        "description": null,\
                        "ends_at": null,\
                        "location": null,\
                        "logo_url": "https://media-exp1.licdn.com/dms/image/C4E0BAQE7Na_mKQhIJg/company-logo_400_400/0/1633731810932?e=1672876800\u0026v=beta\u0026t=Mz_ntwD4meCMcgo1L3JqDxBQRabFLIesd0Yz2ciAXNs",\
                        "starts_at": {\
                            "day": 1,\
                            "month": 1,\
                            "year": 2000\
                        },\
                        "title": "Co-chair"\
                    }\
                ],\
                "first_name": "Bill",\
                "full_name": "Bill Gates",\
                "groups": [],\
                "headline": "Co-chair, Bill \u0026 Melinda Gates Foundation",\
                "languages": [],\
                "last_name": "Gates",\
                "occupation": "Co-chair at Bill \u0026 Melinda Gates Foundation",\
                "people_also_viewed": [],\
                "profile_pic_url": "https://media.licdn.com/dms/image/C5616AQH9tkBTUhHfng/profile-displaybackgroundimage-shrink_200_800/0/1614530499015?e=2147483647\u0026v=beta\u0026t=VEoCyedtZulnAVYWT9BXfKHi5OFp8avElNjiz8kjSTU",\
                "public_identifier": "williamhgates",\
                "recommendations": [],\
                "similarly_named_profiles": [],\
                "state": "Washington",\
                "summary": "Co-chair of the Bill \u0026 Melinda Gates Foundation. Founder of Breakthrough Energy. Co-founder of Microsoft. Voracious reader. Avid traveler. Active blogger.",\
                "volunteer_work": []\
            },\
            "profile_url": "https://www.linkedin.com/in/satyanadella"\
        }\
    ],
    "next_page": null
}

```

| Key | Description | Example |
| --- | --- | --- |
| employees | A list of employee profiles (if enriched) and their associated profile URL. | See [Employee](https://nubela.co/proxycurl/docs#company-api-employee-search-endpoint-response-employee) object |
| next\_page | The API URI that will lead to the next page of results. This will be null for the final page. | `null` |

#### Employee

| Key | Description | Example |
| --- | --- | --- |
| profile\_url | LinkedIn Profile URL of the employee. | `"https://www.linkedin.com/in/satyanadella"` |
| profile | Enriched profile data of the employee. | `{"accomplishment_courses": [], "accomplishment_honors_awards": [], "accomplishment_organisations": [], "accomplishment_patents": [], "accomplishment_projects": [], "accomplishment_publications": [], "accomplishment_test_scores": [], "activities": [], "articles": [], "background_cover_image_url": null, "certifications": [], "city": "Seattle", "connections": null, "country": "US", "country_full_name": "United States of America", "education": [{"degree_name": null, "description": null, "ends_at": {"day": 31, "month": 12, "year": 1975}, "field_of_study": null, "logo_url": "https://media-exp1.licdn.com/dms/image/C4E0BAQF5t62bcL0e9g/company-logo_400_400/0/1519855919126?e=1672876800\u0026v=beta\u0026t=9twXof1JlnNHfFprrDMi-C1Kp55HTT4ahINKHRflUHw", "school": "Harvard University", "school_linkedin_profile_url": null, "starts_at": {"day": 1, "month": 1, "year": 1973}}, {"degree_name": null, "description": null, "ends_at": null, "field_of_study": null, "logo_url": "https://media-exp1.licdn.com/dms/image/C4D0BAQENlfOPKBEk3Q/company-logo_400_400/0/1519856497259?e=1672876800\u0026v=beta\u0026t=v7nJTPaJMfH7WOBjb22dyvNKxAgdPdVd8uLCUkMB1LQ", "school": "Lakeside School", "school_linkedin_profile_url": null, "starts_at": null}], "experiences": [{"company": "Breakthrough Energy ", "company_linkedin_profile_url": "https://www.linkedin.com/company/breakthrough-energy/", "description": null, "ends_at": null, "location": null, "logo_url": "https://media-exp1.licdn.com/dms/image/C4D0BAQGwD9vNu044FA/company-logo_400_400/0/1601560874941?e=1672876800\u0026v=beta\u0026t=VKb6OAHEwlnazKYKm4fc9go-y4zkUv2BT6tosOdQ54Y", "starts_at": {"day": 1, "month": 1, "year": 2015}, "title": "Founder"}, {"company": "Bill \u0026 Melinda Gates Foundation", "company_linkedin_profile_url": "https://www.linkedin.com/company/bill-\u0026-melinda-gates-foundation/", "description": null, "ends_at": null, "location": null, "logo_url": "https://media-exp1.licdn.com/dms/image/C4E0BAQE7Na_mKQhIJg/company-logo_400_400/0/1633731810932?e=1672876800\u0026v=beta\u0026t=Mz_ntwD4meCMcgo1L3JqDxBQRabFLIesd0Yz2ciAXNs", "starts_at": {"day": 1, "month": 1, "year": 2000}, "title": "Co-chair"}], "first_name": "Bill", "full_name": "Bill Gates", "groups": [], "headline": "Co-chair, Bill \u0026 Melinda Gates Foundation", "languages": [], "last_name": "Gates", "occupation": "Co-chair at Bill \u0026 Melinda Gates Foundation", "people_also_viewed": [], "profile_pic_url": "https://media.licdn.com/dms/image/C5616AQH9tkBTUhHfng/profile-displaybackgroundimage-shrink_200_800/0/1614530499015?e=2147483647\u0026v=beta\u0026t=VEoCyedtZulnAVYWT9BXfKHi5OFp8avElNjiz8kjSTU", "public_identifier": "williamhgates", "recommendations": [], "similarly_named_profiles": [], "state": "Washington", "summary": "Co-chair of the Bill \u0026 Melinda Gates Foundation. Founder of Breakthrough Energy. Co-founder of Microsoft. Voracious reader. Avid traveler. Active blogger.", "volunteer_work": []}` |
| last\_updated | ISO 8601 timestamp since the enriched profile was last scraped. | `"2023-10-26T11:34:30Z"` |

### Response Headers

| Header Key | Description | Example |
| --- | --- | --- |
| `X-Proxycurl-Credit-Cost` | Total cost of credits for this API call | `10` |

# People API

## Person Profile Endpoint

`GET /proxycurl/api/v2/linkedin`

Cost: `1` credit / successful request.
Extra charges might be incurred if premium optional parameters are used. Please read the description of the parameters that you intend to use. Credits are charged even if a successful request returns an empty result.

Get structured data of a Personal Profile

```
curl \
    -G \
    -H "Authorization: Bearer ${YOUR_API_KEY}" \
    'https://nubela.co/proxycurl/api/v2/linkedin' \
    --data-urlencode 'twitter_profile_url=https://x.com/johnrmarty/' \
    --data-urlencode 'facebook_profile_url=https://facebook.com/johnrmarty/' \
    --data-urlencode 'linkedin_profile_url=https://linkedin.com/in/johnrmarty/' \
    --data-urlencode 'extra=include' \
    --data-urlencode 'github_profile_id=include' \
    --data-urlencode 'facebook_profile_id=include' \
    --data-urlencode 'twitter_profile_id=include' \
    --data-urlencode 'personal_contact_number=include' \
    --data-urlencode 'personal_email=include' \
    --data-urlencode 'inferred_salary=include' \
    --data-urlencode 'skills=include' \
    --data-urlencode 'use_cache=if-present' \
    --data-urlencode 'fallback_to_cache=on-error'

```

```
import requests

api_key = 'YOUR_API_KEY'
headers = {'Authorization': 'Bearer ' + api_key}
api_endpoint = 'https://nubela.co/proxycurl/api/v2/linkedin'
params = {
    'twitter_profile_url': 'https://x.com/johnrmarty/',
    'facebook_profile_url': 'https://facebook.com/johnrmarty/',
    'linkedin_profile_url': 'https://linkedin.com/in/johnrmarty/',
    'extra': 'include',
    'github_profile_id': 'include',
    'facebook_profile_id': 'include',
    'twitter_profile_id': 'include',
    'personal_contact_number': 'include',
    'personal_email': 'include',
    'inferred_salary': 'include',
    'skills': 'include',
    'use_cache': 'if-present',
    'fallback_to_cache': 'on-error',
}
response = requests.get(api_endpoint,
                        params=params,
                        headers=headers)

```

[![Run in Postman](https://run.pstmn.io/button.svg)](https://pxlcl.co/run-collection)

### URL Parameters

| Parameter | Required | Description | Example |
| --- | --- | --- | --- |
| `twitter_profile_url` | yes (Include only one of: `linkedin_profile_url`, `twitter_profile_url`, or `facebook_profile_url`) | The Twitter/X Profile URL from which you wish to extract person profile<br>URL should be in the format of `https://x.com/<public-identifier>` | `https://x.com/johnrmarty/` |
| `facebook_profile_url` | yes (Include only one of: `linkedin_profile_url`, `twitter_profile_url`, or `facebook_profile_url`) | The Facebook Profile URL from which you wish to extract person profile<br>URL should be in the format of `https://facebook.com/<public-identifier>` | `https://facebook.com/johnrmarty/` |
| `linkedin_profile_url` | yes (Include only one of: `linkedin_profile_url`, `twitter_profile_url`, or `facebook_profile_url`) | The LinkedIn Profile URL from which you wish to extract person profile<br>URL should be in the format of `https://linkedin.com/in/<public-identifier>` | `https://linkedin.com/in/johnrmarty/` |
| `extra` | no | Enriches the Person Profile with extra details from external sources.<br>Extra details include gender, birth date, industry and interests.<br>This parameter accepts the following values:<br>\- `exclude` (default value) - Does not provide extra data field.<br>\- `include` \- Append extra data to the person profile object.<br>Costs an extra `1` credit on top of the cost of the base endpoint (if data is available). | `include` |
| `github_profile_id` | no | Enriches the Person Profile with Github Id from external sources.<br>This parameter accepts the following values:<br>\- `exclude` (default value) - Does not provide Github Id data field.<br>\- `include` \- Append Github Id data to the person profile object.<br>Costs an extra `1` credit on top of the cost of the base endpoint (if data is available). | `include` |
| `facebook_profile_id` | no | Enriches the Person Profile with Facebook Id from external sources.<br>This parameter accepts the following values:<br>\- `exclude` (default value) - Does not provide Facebook Id data field.<br>\- `include` \- Append Facebook Id data to the person profile object.<br>Costs an extra `1` credit on top of the cost of the base endpoint (if data is available). | `include` |
| `twitter_profile_id` | no | Enriches the Person Profile with Twitter Id from external sources.<br>This parameter accepts the following values:<br>\- `exclude` (default value) - Does not provide Twitter Id data field.<br>\- `include` \- Append Twitter Id data to the person profile object.<br>Costs an extra `1` credit on top of the cost of the base endpoint (if data is available). | `include` |
| `personal_contact_number` | no | Enriches the Person Profile with personal numbers from external sources.<br>This parameter accepts the following values:<br>\- `exclude` (default value) - Does not provide personal numbers data field.<br>\- `include` \- Append personal numbers data to the person profile object.<br>Costs an extra `1` credit per personal number returned on top of the cost of the base endpoint (if data is available). | `include` |
| `personal_email` | no | Enriches the Person Profile with personal emails from external sources.<br>This parameter accepts the following values:<br>\- `exclude` (default value) - Does not provide personal emails data field.<br>\- `include` \- Append personal emails data to the person profile object.<br>Costs an extra `1` credit per email returned on top of the cost of the base endpoint (if data is available). | `include` |
| `inferred_salary` | no | Include inferred salary range from external sources.<br>This parameter accepts the following values:<br>\- `exclude` (default value) - Does not provide inferred salary data field.<br>\- `include` \- Append inferred salary range data to the person profile object.<br>Costs an extra `1` credit on top of the cost of the base endpoint (if data is available). | `include` |
| `skills` | no | Include skills data from external sources.<br>This parameter accepts the following values:<br>\- `exclude` (default value) - Does not provide skills data field.<br>\- `include` \- Append skills data to the person profile object.<br>Costs an extra `1` credit on top of the cost of the base endpoint (if data is available). | `include` |
| `use_cache` | no | `if-present` \- Fetches profile from cache regardless of age of profile.<br>If profile is not available in cache, API will attempt to source profile externally.<br>`if-recent` (Default) - API will make a best effort to return a fresh profile no older than 29 days.<br>Costs an extra `1` credit on top of the cost of the base endpoint. | `if-present` |
| `fallback_to_cache` | no | Tweaks the fallback behavior if an error arises from fetching a fresh profile.<br>This parameter accepts the following values:<br>\\* `on-error` (default value) - Fallback to reading the profile from cache if an error arises.<br>\\* `never` \- Do not ever read profile from cache. | `on-error` |

### Response

```
{
    "accomplishment_courses": [],
    "accomplishment_honors_awards": [],
    "accomplishment_organisations": [],
    "accomplishment_patents": [],
    "accomplishment_projects": [\
        {\
            "description": "gMessenger was built using Ruby on Rails, and the Bootstrap HTML, CSS, and JavaScript framework. It uses a Websocket-Rails integration to post a user\u0027s message content to the page in real time, with no page refresh required. gMessenger also includes custom authentication with three different permissions levels.",\
            "ends_at": null,\
            "starts_at": {\
                "day": 1,\
                "month": 3,\
                "year": 2015\
            },\
            "title": "gMessenger",\
            "url": "http://gmessenger.herokuapp.com/"\
        },\
        {\
            "description": "A task and project management responsive web app utilizing Ruby on Rails - CSS and HTML",\
            "ends_at": null,\
            "starts_at": {\
                "day": 1,\
                "month": 1,\
                "year": 2015\
            },\
            "title": "Taskly",\
            "url": "https://hidden-coast-7204.herokuapp.com/"\
        }\
    ],
    "accomplishment_publications": [],
    "accomplishment_test_scores": [],
    "activities": [\
        {\
            "activity_status": "Shared by John Marty",\
            "link": "https://www.linkedin.com/posts/johnrmarty_financialfreedom-realestate-technology-activity-6940294635743301632-rsLo",\
            "title": "Yesterday I toured a $1.2M property in California that has a large 13K sq ft lot with two homes on it. After 5 minutes of being on-site I\u2026"\
        }\
    ],
    "articles": [],
    "background_cover_image_url": "https://media.licdn.com/dms/image/C5616AQH9tkBTUhHfng/profile-displaybackgroundimage-shrink_200_800/0/1614530499015?e=2147483647\u0026v=beta\u0026t=VEoCyedtZulnAVYWT9BXfKHi5OFp8avElNjiz8kjSTU",
    "certifications": [\
        {\
            "authority": "Scaled Agile, Inc.",\
            "display_source": null,\
            "ends_at": null,\
            "license_number": null,\
            "name": "SAFe Agile Framework Practitioner - ( Scrum, XP, and Lean Practices in the SAFe Enterprise)",\
            "starts_at": null,\
            "url": null\
        },\
        {\
            "authority": "Scrum Alliance",\
            "display_source": null,\
            "ends_at": null,\
            "license_number": null,\
            "name": "SCRUM Alliance Certified Product Owner",\
            "starts_at": null,\
            "url": null\
        }\
    ],
    "city": "Seattle",
    "connections": 500,
    "country": "US",
    "country_full_name": "United States of America",
    "education": [\
        {\
            "activities_and_societies": null,\
            "degree_name": "Master of Business Administration (MBA)",\
            "description": null,\
            "ends_at": {\
                "day": 31,\
                "month": 12,\
                "year": 2015\
            },\
            "field_of_study": "Finance + Economics",\
            "grade": null,\
            "logo_url": "https://media.licdn.com/dms/image/C560BAQGVi9eAHgWxFw/company-logo_100_100/0/1673448029676?e=2147483647\u0026v=beta\u0026t=NG6ttckXvnS2DX3abTfVACRY2E9Q1EcryNaJLRbE9OE",\
            "school": "University of Colorado Denver",\
            "school_facebook_profile_url": null,\
            "school_linkedin_profile_url": "https://www.linkedin.com/school/university-of-colorado-denver/",\
            "starts_at": {\
                "day": 1,\
                "month": 1,\
                "year": 2013\
            }\
        },\
        {\
            "activities_and_societies": null,\
            "degree_name": null,\
            "description": "rails, ruby, rspec, capybara, bootstrap, css, html, api integration, Jquery, Javascript",\
            "ends_at": {\
                "day": 31,\
                "month": 12,\
                "year": 2015\
            },\
            "field_of_study": "School of Software Development",\
            "grade": null,\
            "logo_url": "https://media.licdn.com/dms/image/C560BAQFKNxOZ4X0g8Q/company-logo_100_100/0/1670610916338?e=2147483647\u0026v=beta\u0026t=t7ImfhmsuIJ7HJGHEbPJ2suxdslKhzp9v-5h9_G4sWE",\
            "school": "Galvanize Inc",\
            "school_facebook_profile_url": null,\
            "school_linkedin_profile_url": "https://www.linkedin.com/school/galvanize-it/",\
            "starts_at": {\
                "day": 1,\
                "month": 1,\
                "year": 2015\
            }\
        }\
    ],
    "experiences": [\
        {\
            "company": "Freedom Fund Real Estate",\
            "company_facebook_profile_url": null,\
            "company_linkedin_profile_url": "https://www.linkedin.com/company/freedomfund",\
            "description": "Our mission is to provide everyday people seeking financial freedom long before the age of 65 with the ability to invest in high yield, short-term real estate investments that were only accessible in the past for a select few wealthy individuals. Each of our single family rehab projects require a minimum investment contribution of only $10K, we have simple terms, no multi-year hold periods, and no fees. With our unique model investors can log into our easy to use website, select the projects that they want to invest in, and get realtime updates on the status of their investments.\n\nWebsite: https://www.freedomfundinvestments.com/home",\
            "ends_at": null,\
            "location": null,\
            "logo_url": "https://media.licdn.com/dms/image/C560BAQEYxazZM_hXgQ/company-logo_100_100/0/1634934418976?e=2147483647\u0026v=beta\u0026t=wI0YdMmxIctkzvnKxRfuAbT8h5eok_DlUqEph68J37s",\
            "starts_at": {\
                "day": 1,\
                "month": 8,\
                "year": 2021\
            },\
            "title": "Co-Founder"\
        },\
        {\
            "company": "Mindset Reset Podcast",\
            "company_facebook_profile_url": null,\
            "company_linkedin_profile_url": "https://www.linkedin.com/company/mindset-reset-podcast",\
            "description": "We dive into the mindsets of the world\u2019s foremost thought leaders and turn them into actionable insights so that others can discover greater happiness, success, and fulfillment.\n\nhttps://podcasts.apple.com/us/podcast/mindset-reset/id1553212607",\
            "ends_at": null,\
            "location": "Denver, Colorado, United States",\
            "logo_url": "https://media.licdn.com/dms/image/C560BAQF9QJVQm3SOvA/company-logo_100_100/0/1614527476576?e=2147483647\u0026v=beta\u0026t=m3tx83nMN-E3XQFoJG0Wmch8U4qKnJ9i--5NSAfffC0",\
            "starts_at": {\
                "day": 1,\
                "month": 1,\
                "year": 2021\
            },\
            "title": "Founder"\
        }\
    ],
    "first_name": "John",
    "follower_count": null,
    "full_name": "John Marty",
    "groups": [],
    "headline": "Financial Freedom through Real Estate - LinkedIn Top Voice",
    "last_name": "Marty",
    "occupation": "Co-Founder at Freedom Fund Real Estate",
    "people_also_viewed": [],
    "profile_pic_url": "https://media.licdn.com/dms/image/C5603AQHaJSx0CBAUIA/profile-displayphoto-shrink_800_800/0/1558325759208?e=2147483647\u0026v=beta\u0026t=BluXpPg88xFnU2wMGLjuCUykSk_wKNdh8x3PI9wm6MI",
    "public_identifier": "johnrmarty",
    "recommendations": [\
        "Rebecca Canfield\n\n      \n          \n          \n\n\n\n              \n                \n        \n              \n  \n\n      \n          John Marty is a genius at his craft. He is skilled in the art of making people feel empowered to seek out roles that they are qualified for, ask for salaries that they deserve, and creates a kind of pay it forward lifestyle. John helps you to get to places that you only thought were possible for other people. Anyone that is fortunate enough to learn from John should consider themselves extremely lucky. I know I do. ",\
        "Zoe Sanoff\n\n      \n          \n          \n\n\n\n              \n                \n        \n              \n  \n\n      \n          John is so focused on helping guide you through an interview process not just for Amazon but on interviewing in general.  I\u0027ve generally done well at interviewing, my skills are top notch now.  John is so focused on on his clients and really goes above and beyond.  John is genuine, knowledgeable, well spoken and non-judgemental.  He is so encouraging, so positive and really easy to talk to.  Thank you John!"\
    ],
    "similarly_named_profiles": [\
        {\
            "link": "https://www.linkedin.com/in/john-martinez-90384a229",\
            "location": "San Antonio, TX",\
            "name": "John Martinez",\
            "summary": "Owner of Fight or Flight Medical Consultants, LLC  , Owner Marty\u2019s Hardwood Works"\
        },\
        {\
            "link": "https://www.linkedin.com/in/senatormarty",\
            "location": "St Paul, MN",\
            "name": "John Marty",\
            "summary": null\
        }\
    ],
    "state": "Washington",
    "summary": "Most people go through life lost, disengaged, and unhappy at work and in their lives - I\u0027m on a mission to solve that.\n\nI spent 10 years as the founder of Axxis Audio, an electronics company that grew to multi-million dollar sales, which I sold in 2012. At that time, I funneled my earnings into the creation of an Internet of Things company, but numerous factors lead to its demise after 2 hard fought years. \n\nAt 31, I was penny-less, had a baby on the way, and had zero job prospects (despite applying to 150 companies). My desperate situation led me to take a job at Best Buy for $12 an hour while reinventing myself through the completion of an MBA at the University of Colorado, and a 6-month software development boot camp. \n\nAfter graduation, I landed at American Express as a Senior Product Manager and then got poached by Amazon in 2017 (because of my LinkedIn profile). My journey has led to a deep sense of perspective, humility, and purpose that I draw on to help others find clarity, meaning, and happiness in their careers and lives. \n\nCheck out my website for details on my Mindset Reset Podcast, Public Speaking, Consulting, or my free 40 page LinkedIn guide\n\nhttp://www.johnraphaelmarty.com/\n\nFAQ\u0027s\n\nQ: Can you speak at my Company, University, event or podcast?\nA: I\u0027d love to! I\u0027ve shared my message on the future of employment, breaking into big tech, and my personal story of reinventing myself and discovering my sense of purpose (and how you can too!).\n\n\u2611\ufe0f  YouTube Channel #1 (John Marty) : http://www.youtube.com/c/JohnMarty-uncommon\n\u2611\ufe0f  YouTube Channel #2 (Tech Careers for non-engineers: https://www.youtube.com/channel/UC900gMMPLwRGGXSTW1gdZHA\n\nFUN FACTS:\n\u2611\ufe0f I am an Avid cyclist and runner, and I just started learning to skateboard a half-pipe.\n\u2611\ufe0f Into the Enneagram? - I\u0027m a #3 (The Achiever)\n\nLETS CONNECT:\n\u2611\ufe0f Email: JohnRmarty@gmail.com (don\u0027t forget that \"R\"....The other guy gets my emails all the time)",
    "volunteer_work": []
}

```

| Key | Description | Example |
| --- | --- | --- |
| public\_identifier | The vanity identifier of the LinkedIn profile.<br>The vanity identifier comes after the `/in/` part of the LinkedIn Profile URL<br>in the following format: `https://www.linkedin.com/in/<_identifier>` | `"johnrmarty"` |
| profile\_pic\_url | A temporary link to the user's profile picture that is valid for 30 minutes.<br>The temporal nature of the link is by design to prevent having Proxycurl be the mirror for the images.<br>The developer is expected to handle these images by downloading the image and re-hosting the image.<br>See [this post](https://nubela.co/blog/why-is-the-api-returning-s3-links-for-profile-pictures-scraped-from-linkedin-profiles/) for context.<br>Some profile pictures might be of the standard LinkedIn's profile picture placeholder. It is so because. See [this post](https://nubela.co/blog/why-do-most-linkedin-profiles-fetched-via-the-person-profile-endpoint-return-a-placeholder-profile-picture/) for context. | `"https://media.licdn.com/dms/image/C5603AQHaJSx0CBAUIA/profile-displayphoto-shrink_800_800/0/1558325759208?e=2147483647\u0026v=beta\u0026t=BluXpPg88xFnU2wMGLjuCUykSk_wKNdh8x3PI9wm6MI"` |
| background\_cover\_image\_url | A temporary link to the user's background cover picture<br>that is valid for 30 minutes.<br>The temporal nature of the link is by design to prevent<br>having Proxycurl be the mirror for the images.<br>The developer is expected to handle these images<br>by downloading the image and re-hosting the image.<br>See [this post](https://nubela.co/blog/why-is-the-api-returning-s3-links-for-profile-pictures-scraped-from-linkedin-profiles/) for context. | `"https://media.licdn.com/dms/image/C5616AQH9tkBTUhHfng/profile-displaybackgroundimage-shrink_200_800/0/1614530499015?e=2147483647\u0026v=beta\u0026t=VEoCyedtZulnAVYWT9BXfKHi5OFp8avElNjiz8kjSTU"` |
| first\_name | First name of the user. | `"John"` |
| last\_name | Last name of the user. | `"Marty"` |
| full\_name | Full name of the user ( `first_name` \+ `last_name`) | `"John Marty"` |
| follower\_count | Follower count for this profile | `null` |
| occupation | The title and company name of the user's current employment. | `"Co-Founder at Freedom Fund Real Estate"` |
| headline | The tagline written by the user for his profile. | `"Financial Freedom through Real Estate - LinkedIn Top Voice"` |
| summary | A blurb (longer than the tagline) written by the user for his profile. | `"Most people go through life lost, disengaged, and unhappy at work and in their lives - I\u0027m on a mission to solve that.\n\nI spent 10 years as the founder of Axxis Audio, an electronics company that grew to multi-million dollar sales, which I sold in 2012. At that time, I funneled my earnings into the creation of an Internet of Things company, but numerous factors lead to its demise after 2 hard fought years. \n\nAt 31, I was penny-less, had a baby on the way, and had zero job prospects (despite applying to 150 companies). My desperate situation led me to take a job at Best Buy for $12 an hour while reinventing myself through the completion of an MBA at the University of Colorado, and a 6-month software development boot camp. \n\nAfter graduation, I landed at American Express as a Senior Product Manager and then got poached by Amazon in 2017 (because of my LinkedIn profile). My journey has led to a deep sense of perspective, humility, and purpose that I draw on to help others find clarity, meaning, and happiness in their careers and lives. \n\nCheck out my website for details on my Mindset Reset Podcast, Public Speaking, Consulting, or my free 40 page LinkedIn guide\n\nhttp://www.johnraphaelmarty.com/\n\nFAQ\u0027s\n\nQ: Can you speak at my Company, University, event or podcast?\nA: I\u0027d love to! I\u0027ve shared my message on the future of employment, breaking into big tech, and my personal story of reinventing myself and discovering my sense of purpose (and how you can too!).\n\n\u2611\ufe0f  YouTube Channel #1 (John Marty) : http://www.youtube.com/c/JohnMarty-uncommon\n\u2611\ufe0f  YouTube Channel #2 (Tech Careers for non-engineers: https://www.youtube.com/channel/UC900gMMPLwRGGXSTW1gdZHA\n\nFUN FACTS:\n\u2611\ufe0f I am an Avid cyclist and runner, and I just started learning to skateboard a half-pipe.\n\u2611\ufe0f Into the Enneagram? - I\u0027m a #3 (The Achiever)\n\nLETS CONNECT:\n\u2611\ufe0f Email: JohnRmarty@gmail.com (don\u0027t forget that \"R\"....The other guy gets my emails all the time)"` |
| country | The user's country of residence depicted by<br>a 2-letter country code (ISO 3166-1 alpha-2). | `"US"` |
| country\_full\_name | The user's country of residence, in English words. | `"United States of America"` |
| city | The city that the user is living at. | `"Seattle"` |
| state | The state that the user is living at. | `"Washington"` |
| experiences | The user's list of historic work experiences. | See [Experience](https://nubela.co/proxycurl/docs#people-api-person-profile-endpoint-response-experience) object |
| education | The user's list of education background. | See [Education](https://nubela.co/proxycurl/docs#people-api-person-profile-endpoint-response-education) object |
| languages\_and\_proficiencies | The user's list of languages along with their proficiency<br>level. | See [Language](https://nubela.co/proxycurl/docs#people-api-person-profile-endpoint-response-language) object |
| accomplishment\_organisations | List of noteworthy organizations that this user is part of. | See [AccomplishmentOrg](https://nubela.co/proxycurl/docs#people-api-person-profile-endpoint-response-accomplishmentorg) object |
| accomplishment\_publications | List of noteworthy publications that this user has partook in. | See [Publication](https://nubela.co/proxycurl/docs#people-api-person-profile-endpoint-response-publication) object |
| accomplishment\_honors\_awards | List of noteworthy honours and awards that this user has won. | See [HonourAward](https://nubela.co/proxycurl/docs#people-api-person-profile-endpoint-response-honouraward) object |
| accomplishment\_patents | List of noteworthy patents won by this user. | See [Patent](https://nubela.co/proxycurl/docs#people-api-person-profile-endpoint-response-patent) object |
| accomplishment\_courses | List of noteworthy courses partook by this user. | See [Course](https://nubela.co/proxycurl/docs#people-api-person-profile-endpoint-response-course) object |
| accomplishment\_projects | List of noteworthy projects undertaken by this user. | See [Project](https://nubela.co/proxycurl/docs#people-api-person-profile-endpoint-response-project) object |
| accomplishment\_test\_scores | List of noteworthy test scores accomplished by this user. | See [TestScore](https://nubela.co/proxycurl/docs#people-api-person-profile-endpoint-response-testscore) object |
| volunteer\_work | List of historic volunteer work experiences. | See [VolunteeringExperience](https://nubela.co/proxycurl/docs#people-api-person-profile-endpoint-response-volunteeringexperience) object |
| certifications | List of noteworthy certifications accomplished by this user. | See [Certification](https://nubela.co/proxycurl/docs#people-api-person-profile-endpoint-response-certification) object |
| connections | Total _count_ of LinkedIn connections. | `500` |
| people\_also\_viewed | A list of other LinkedIn profiles closely related to this user. | See [PeopleAlsoViewed](https://nubela.co/proxycurl/docs#people-api-person-profile-endpoint-response-peoplealsoviewed) object |
| recommendations | List of recommendations made by other users about this profile. | `["Professional and dedicated approach towards clients and collegues."]` |
| activities | A list of LinkedIn status activities. This field is not guaranteed to be returned. Do not rely on this attribute in production. | See [Activity](https://nubela.co/proxycurl/docs#people-api-person-profile-endpoint-response-activity) object |
| similarly\_named\_profiles | A list of other LinkedIn profiles with similar names. | See [SimilarProfile](https://nubela.co/proxycurl/docs#people-api-person-profile-endpoint-response-similarprofile) object |
| articles | A list of content-based articles posted by this user. This field is not guaranteed to be returned. Do not rely on this attribute in production. | See [Article](https://nubela.co/proxycurl/docs#people-api-person-profile-endpoint-response-article) object |
| groups | A list of LinkedIn groups that this user is a part of.", | See [PersonGroup](https://nubela.co/proxycurl/docs#people-api-person-profile-endpoint-response-persongroup) object |
| inferred\_salary | A salary range inferred from the user's current job title and company. | See [InferredSalary](https://nubela.co/proxycurl/docs#people-api-person-profile-endpoint-response-inferredsalary) object |
| gender | Gender of the user. | `"male"` |
| birth\_date | Birth date of the user. | See [Date](https://nubela.co/proxycurl/docs#people-api-person-profile-endpoint-response-date) object |
| industry | Industry that the user works in. | `"government administration"` |
| extra | A bundle of extra data on this user. | See [PersonExtra](https://nubela.co/proxycurl/docs#people-api-person-profile-endpoint-response-personextra) object |
| interests | A list of interests that the user has. | `["education", "health", "human rights"]` |
| personal\_emails | A list of personal emails associated with this user. | `["abc@gmail.com", "bcd@gmail.com", "cde@@outlook.com"]` |
| personal\_numbers | A list of personal mobile phone numbers associated with this user. | `["+6512345678", "+6285123450953", "+6502300340"]` |

#### Experience

| Key | Description | Example |
| --- | --- | --- |
| starts\_at |  | `{"day": 1, "month": 8, "year": 2021}` |
| ends\_at |  | `null` |
| company | The company's display name. | `"Freedom Fund Real Estate"` |
| company\_linkedin\_profile\_url | The company's profile URL on Linkedin.<br>If present, could be used with<br>[Company Profile Endpoint](https://nubela.co/proxycurl/docs#company-api-company-profile-endpoint) for more info. | `"https://www.linkedin.com/company/freedomfund"` |
| company\_facebook\_profile\_url | The company's profile URL on Facebook. | `null` |
| title |  | `"Co-Founder"` |
| description |  | `"Our mission is to provide everyday people seeking financial freedom long before the age of 65 with the ability to invest in high yield, short-term real estate investments that were only accessible in the past for a select few wealthy individuals. Each of our single family rehab projects require a minimum investment contribution of only $10K, we have simple terms, no multi-year hold periods, and no fees. With our unique model investors can log into our easy to use website, select the projects that they want to invest in, and get realtime updates on the status of their investments.\n\nWebsite: https://www.freedomfundinvestments.com/home"` |
| location |  | `null` |
| logo\_url | URL of the logo of the organisation. | `"https://media.licdn.com/dms/image/C560BAQEYxazZM_hXgQ/company-logo_100_100/0/1634934418976?e=2147483647\u0026v=beta\u0026t=wI0YdMmxIctkzvnKxRfuAbT8h5eok_DlUqEph68J37s"` |

#### Education

| Key | Description | Example |
| --- | --- | --- |
| starts\_at |  | `{"day": 1, "month": 1, "year": 2013}` |
| ends\_at |  | `{"day": 31, "month": 12, "year": 2015}` |
| field\_of\_study | The field of study that the user majored in. | `"Finance + Economics"` |
| degree\_name | The degree that the user obtained. | `"Master of Business Administration (MBA)"` |
| school | The school that the user attended. | `"University of Colorado Denver"` |
| school\_linkedin\_profile\_url | The school's profile URL on Linkedin.<br>If present, could be used with<br>[School Profile Endpoint](https://nubela.co/proxycurl/docs#school-api-school-profile-endpoint) for more info. | `"https://www.linkedin.com/school/university-of-colorado-denver/"` |
| school\_facebook\_profile\_url | The school's profile URL on Facebook. | `null` |
| description | Description of the education. | `null` |
| logo\_url | URL of the logo of the organisation. | `"https://media.licdn.com/dms/image/C560BAQGVi9eAHgWxFw/company-logo_100_100/0/1673448029676?e=2147483647\u0026v=beta\u0026t=NG6ttckXvnS2DX3abTfVACRY2E9Q1EcryNaJLRbE9OE"` |
| grade | The grade that the user obtained. | `null` |
| activities\_and\_societies | The activities and societies that the user participated in. | `null` |

#### Language

| Key | Description | Example |
| --- | --- | --- |
| name | Name of the language. | `"English"` |
| proficiency | Proficiency level of the user in the language.<br>Possible values:<br>\- `ELEMENTARY` (Elementary proficiency)<br>\- `LIMITED_WORKING` (Limited working proficiency)<br>\- `PROFESSIONAL_WORKING` (Professional working proficiency)<br>\- `FULL_PROFESSIONAL` (Full professional proficiency)<br>\- `NATIVE_OR_BILINGUAL` (Native or bilingual proficiency) | `"NATIVE_OR_BILINGUAL"` |

#### AccomplishmentOrg

| Key | Description | Example |
| --- | --- | --- |
| starts\_at |  | `{"day": 1, "month": 1, "year": 2012}` |
| ends\_at |  | `{"day": 1, "month": 8, "year": 2016}` |
| org\_name |  | `"Microsoft"` |
| title |  | `"Software Developer"` |
| description |  | `null` |

#### Publication

| Key | Description | Example |
| --- | --- | --- |
| name | Name of the Publication. | `"Nobel Peace Prize"` |
| publisher | The publishing organisation body. | `"Acme Corp"` |
| published\_on | Date of Publication. | See [Date](https://nubela.co/proxycurl/docs#people-api-person-profile-endpoint-response-date) object |
| description | Description of the Publication. | `"\n                        Lorem ipsum dolor sit amet, consectetur adipiscing elit\n                    "` |
| url | URL of the Publication. | `"https://example.com"` |

#### Date

| Key | Description | Example |
| --- | --- | --- |
| day |  | `1` |
| month |  | `1` |
| year |  | `2023` |

#### HonourAward

| Key | Description | Example |
| --- | --- | --- |
| title | Title of the honour/award. | `"Nobel Peace Prize"` |
| issuer | The organisation body issuing this honour/award. | `"Acme Corp"` |
| issued\_on | Date that this honour/awared was issued. | See [Date](https://nubela.co/proxycurl/docs#people-api-person-profile-endpoint-response-date) object |
| description | Description of the honour/award. | `"\n                        Lorem ipsum dolor sit amet, consectetur adipiscing elit\n                    "` |

#### Patent

| Key | Description | Example |
| --- | --- | --- |
| title | Title of the patent. | `"The art of war"` |
| issuer | The organisation body that issued the patent. | `"Acme Corp"` |
| issued\_on | Date of patent issuance. | See [Date](https://nubela.co/proxycurl/docs#people-api-person-profile-endpoint-response-date) object |
| description | Description of the patent. | `"\n                        Lorem ipsum dolor sit amet, consectetur adipiscing elit\n                    "` |
| application\_number | Numerical representation that identifies the patent. | `"123"` |
| patent\_number | Application number of the patent. | `"123"` |
| url |  | `null` |

#### Course

| Key | Description | Example |
| --- | --- | --- |
| name | Name of the course | `"The course about ABCs"` |
| number | The numerical representation of the course | `"123"` |

#### Project

| Key | Description | Example |
| --- | --- | --- |
| starts\_at |  | `{"day": 1, "month": 3, "year": 2015}` |
| ends\_at |  | `null` |
| title | Name of the project that has been or is currently being worked on. | `"gMessenger"` |
| description | Description of the project. | `"gMessenger was built using Ruby on Rails, and the Bootstrap HTML, CSS, and JavaScript framework. It uses a Websocket-Rails integration to post a user\u0027s message content to the page in real time, with no page refresh required. gMessenger also includes custom authentication with three different permissions levels."` |
| url | A web location related to the project. | `"http://gmessenger.herokuapp.com/"` |

#### TestScore

| Key | Description | Example |
| --- | --- | --- |
| name | Title of the course for which test score was derived from. | `"CS1101S"` |
| score | Test score | `"A"` |
| date\_on | Date of test was assesed. | See [Date](https://nubela.co/proxycurl/docs#people-api-person-profile-endpoint-response-date) object |
| description | Description of the test score. | `"Nailed it without studying."` |

#### VolunteeringExperience

| Key | Description | Example |
| --- | --- | --- |
| starts\_at |  | `{"day": 1, "month": 1, "year": 2012}` |
| ends\_at |  | `{"day": 1, "month": 8, "year": 2016}` |
| title | Name of volunteer activity. | `"Surveyor"` |
| cause |  | `"To help the world"` |
| company | The company's display name. | `"Microsoft"` |
| company\_linkedin\_profile\_url | The company's profile URL.<br>If present, could be used with<br>[Company Profile Endpoint](https://nubela.co/proxycurl/docs#company-api-company-profile-endpoint) for more info. | `"https://www.linkedin.com/company/microsoft"` |
| description |  | `null` |
| logo\_url | URL of the logo of the organisation. | `null` |

#### Certification

| Key | Description | Example |
| --- | --- | --- |
| starts\_at |  | `null` |
| ends\_at |  | `null` |
| name | Name of the course or program. | `"SAFe Agile Framework Practitioner - ( Scrum, XP, and Lean Practices in the SAFe Enterprise)"` |
| license\_number |  | `null` |
| display\_source |  | `null` |
| authority | The organisation body issuing this certificate. | `"Scaled Agile, Inc."` |
| url |  | `null` |

#### PeopleAlsoViewed

| Key | Description | Example |
| --- | --- | --- |
| link | URL of the profile.<br>Useable with [Person profile endpoint](https://nubela.co/proxycurl/docs#people-api-person-profile-endpoint) | `"https://www.linkedin.com/in/johndoe"` |
| name |  | `"John Doe"` |
| summary |  | `"Software Engineer at Google"` |
| location |  | `"Singapore"` |

#### Activity

| Key | Description | Example |
| --- | --- | --- |
| title |  | `"I am hiring!"` |
| link |  | `"https://www.linkedin.com/feed/update/urn:li:activity:666"` |
| activity\_status |  | `"posted"` |

#### SimilarProfile

| Key | Description | Example |
| --- | --- | --- |
| name |  | `"John Martinez"` |
| link |  | `"https://www.linkedin.com/in/john-martinez-90384a229"` |
| summary |  | `"Owner of Fight or Flight Medical Consultants, LLC  , Owner Marty\u2019s Hardwood Works"` |
| location |  | `"San Antonio, TX"` |

#### Article

| Key | Description | Example |
| --- | --- | --- |
| title |  | `"Manufacturing opportunity"` |
| link |  | `"https://www.linkedin.com/pulse/manufacturing-opportunity-bill-gates/"` |
| published\_date | A [Date](https://nubela.co/proxycurl/docs#people-api-person-profile-endpoint-response-date) object | See [Date](https://nubela.co/proxycurl/docs#people-api-person-profile-endpoint-response-date) object |
| author |  | `"Bill Gates"` |
| image\_url |  | `"https://media-exp1.licdn.com/dms/image/C4E12AQFftuPi0UiqWA/article-cover_image-shrink_720_1280/0/1574801149114?e=1640822400\u0026v=beta\u0026t=ZAe3ERmQCM8QHGmRPS2LJ-C76GD5PR7FBHMVL4Z6iVg"` |

#### PersonGroup

| Key | Description | Example |
| --- | --- | --- |
| profile\_pic\_url | The URL to the profile picture of this LinkedIn Group | `"https://media-exp1.licdn.com/dms/image/C4D07AQG9IK9V0pk3mQ/group-logo_image-shrink_92x92/0/1631371531293?e=1642060800\u0026v=beta\u0026t=UK1tfIppWa-Nx7k9whmm5f9XdZoBdJhApf9N3ke3204"` |
| name | Name of LinkedIn group for which this user is in | `"Hadoop Users"` |
| url | URL to the LinkedIn Group | `"https://www.linkedin.com/groups/988957"` |

#### InferredSalary

| Key | Description | Example |
| --- | --- | --- |
| min |  | `35000` |
| max |  | `45000` |

#### PersonExtra

| Key | Description | Example |
| --- | --- | --- |
| github\_profile\_id | This profile's Github account. | `"github-username"` |
| facebook\_profile\_id | This profile's Facebook account. | `"facebook-username"` |
| twitter\_profile\_id | This profile's twitter account. | `"twitter-username"` |
| website | This account's website listed on his profile. | `"https://proxycurl.com"` |

### Response Headers

| Header Key | Description | Example |
| --- | --- | --- |
| `X-Proxycurl-Credit-Cost` | Total cost of credits for this API call | `1` |

## Person Profile Picture Endpoint

`GET /proxycurl/api/linkedin/person/profile-picture`

Cost: `0` credit / successful request.
This free API endpoint is unlocked after your first payment top-up and will remain free perpetually.
Prior to the first top-up, this endpoint costs `1` credit / successful request.

Get the profile picture of a person.

Profile pictures are served from cached people profiles found within [LinkDB](https://nubela.co/proxycurl/linkdb).
If the profile does not exist within [LinkDB](https://nubela.co/proxycurl/linkdb), then the API will return a `404` status code.

```
curl \
    -G \
    -H "Authorization: Bearer ${YOUR_API_KEY}" \
    'https://nubela.co/proxycurl/api/linkedin/person/profile-picture' \
    --data-urlencode 'linkedin_person_profile_url=https://www.linkedin.com/in/williamhgates/'

```

```
import requests

api_key = 'YOUR_API_KEY'
headers = {'Authorization': 'Bearer ' + api_key}
api_endpoint = 'https://nubela.co/proxycurl/api/linkedin/person/profile-picture'
params = {
    'linkedin_person_profile_url': 'https://www.linkedin.com/in/williamhgates/',
}
response = requests.get(api_endpoint,
                        params=params,
                        headers=headers)

```

[![Run in Postman](https://run.pstmn.io/button.svg)](https://pxlcl.co/run-collection)

### URL Parameters

| Parameter | Required | Description | Example |
| --- | --- | --- | --- |
| `linkedin_person_profile_url` | yes | LinkedIn Profile URL of the person that you are trying to get the profile picture of. | `https://www.linkedin.com/in/williamhgates/` |

### Response

```
{
    "tmp_profile_pic_url": "https://media.licdn.com/dms/image/C5616AQH9tkBTUhHfng/profile-displaybackgroundimage-shrink_200_800/0/1614530499015?e=2147483647\u0026v=beta\u0026t=VEoCyedtZulnAVYWT9BXfKHi5OFp8avElNjiz8kjSTU"
}

```

| Key | Description | Example |
| --- | --- | --- |
| tmp\_profile\_pic\_url | Temporary URL to the profile picture (valid for just 30 minutes).<br>See this [blog post](https://nubela.co/blog/why-is-the-api-returning-s3-links-for-profile-pictures-scraped-from-linkedin-profiles/) for more information. | `"https://s3.us-west-000.backblazeb2.com/proxycurl/"` |

### Response Headers

| Header Key | Description | Example |
| --- | --- | --- |
| `X-Proxycurl-Credit-Cost` | Total cost of credits for this API call | `0` |

## Person Lookup Endpoint

`GET /proxycurl/api/linkedin/profile/resolve`

Cost: `2` credits / successful request.
Credits are charged even if a successful request returns an empty result.

Look up a person with a name and company information.

```
curl \
    -G \
    -H "Authorization: Bearer ${YOUR_API_KEY}" \
    'https://nubela.co/proxycurl/api/linkedin/profile/resolve' \
    --data-urlencode 'company_domain=gatesfoundation.org' \
    --data-urlencode 'first_name=Bill' \
    --data-urlencode 'similarity_checks=include' \
    --data-urlencode 'enrich_profile=enrich' \
    --data-urlencode 'location=Seattle' \
    --data-urlencode 'title=Co-chair' \
    --data-urlencode 'last_name=Gates'

```

```
import requests

api_key = 'YOUR_API_KEY'
headers = {'Authorization': 'Bearer ' + api_key}
api_endpoint = 'https://nubela.co/proxycurl/api/linkedin/profile/resolve'
params = {
    'company_domain': 'gatesfoundation.org',
    'first_name': 'Bill',
    'similarity_checks': 'include',
    'enrich_profile': 'enrich',
    'location': 'Seattle',
    'title': 'Co-chair',
    'last_name': 'Gates',
}
response = requests.get(api_endpoint,
                        params=params,
                        headers=headers)

```

[![Run in Postman](https://run.pstmn.io/button.svg)](https://pxlcl.co/run-collection)

### URL Parameters

| Parameter | Required | Description | Example |
| --- | --- | --- | --- |
| `company_domain` | yes | Company name or domain | `gatesfoundation.org` |
| `first_name` | yes | First name of the user | `Bill` |
| `similarity_checks` | no | Controls whether the API endpoint performs<br>similarity comparisons between the input parameters<br>and the results or simply returns the closest match.<br>For instance, if you are searching for a person named<br>"Ben Chad", and the closest result we have is "Chavvy<br>Plum", our similarity checks will discard the obviously<br>incorrect result and return `null` instead of a false<br>positive.<br>Include similarity checks to eliminate false positives.<br>However, be aware that this might yield fewer results<br>as false positives are discarded. Credits will still be<br>deducted even if we return `null`.<br>You can choose to skip similarity checks, in which<br>case no credits will be charged if we return `null`.<br>This parameter accepts the following values:<br>\\* `include` (default) - Perform similarity checks and<br>discard false positives. Credits will be deducted even<br>if we return null .<br>\\* `skip` \- Bypass similarity checks. No credits will be<br>deducted if no results are returned. | `include` |
| `enrich_profile` | no | Enrich the result with a cached profile of the lookup result.<br>The valid values are:<br>\\* `skip` (default): do not enrich the results with cached profile data<br>\\* `enrich`: enriches the result with cached profile data<br>Calling this API endpoint with this parameter would add 1 credit.<br>If you require [fresh profile data](https://nubela.co/blog/how-fresh-are-profiles-returned-by-proxycurl-api/),<br>please chain this API call with the [People Profile Endpoint](https://nubela.co/proxycurl/docs#people-api-person-profile-endpoint) with the `use_cache=if-recent` parameter. | `enrich` |
| `location` | no | The location of this user.<br>Name of country, city or state. | `Seattle` |
| `title` | no | Title that user is holding at his/her current job | `Co-chair` |
| `last_name` | no | Last name of the user | `Gates` |

### Response

```
{
    "last_updated": "2023-10-26T11:34:30Z",
    "profile": {
        "accomplishment_courses": [],
        "accomplishment_honors_awards": [],
        "accomplishment_organisations": [],
        "accomplishment_patents": [],
        "accomplishment_projects": [\
            {\
                "description": "gMessenger was built using Ruby on Rails, and the Bootstrap HTML, CSS, and JavaScript framework. It uses a Websocket-Rails integration to post a user\u0027s message content to the page in real time, with no page refresh required. gMessenger also includes custom authentication with three different permissions levels.",\
                "ends_at": null,\
                "starts_at": {\
                    "day": 1,\
                    "month": 3,\
                    "year": 2015\
                },\
                "title": "gMessenger",\
                "url": "http://gmessenger.herokuapp.com/"\
            },\
            {\
                "description": "A task and project management responsive web app utilizing Ruby on Rails - CSS and HTML",\
                "ends_at": null,\
                "starts_at": {\
                    "day": 1,\
                    "month": 1,\
                    "year": 2015\
                },\
                "title": "Taskly",\
                "url": "https://hidden-coast-7204.herokuapp.com/"\
            }\
        ],
        "accomplishment_publications": [],
        "accomplishment_test_scores": [],
        "activities": [\
            {\
                "activity_status": "Shared by John Marty",\
                "link": "https://www.linkedin.com/posts/johnrmarty_financialfreedom-realestate-technology-activity-6940294635743301632-rsLo",\
                "title": "Yesterday I toured a $1.2M property in California that has a large 13K sq ft lot with two homes on it. After 5 minutes of being on-site I\u2026"\
            }\
        ],
        "articles": [],
        "background_cover_image_url": "https://media.licdn.com/dms/image/C5616AQH9tkBTUhHfng/profile-displaybackgroundimage-shrink_200_800/0/1614530499015?e=2147483647\u0026v=beta\u0026t=VEoCyedtZulnAVYWT9BXfKHi5OFp8avElNjiz8kjSTU",
        "certifications": [\
            {\
                "authority": "Scaled Agile, Inc.",\
                "display_source": null,\
                "ends_at": null,\
                "license_number": null,\
                "name": "SAFe Agile Framework Practitioner - ( Scrum, XP, and Lean Practices in the SAFe Enterprise)",\
                "starts_at": null,\
                "url": null\
            },\
            {\
                "authority": "Scrum Alliance",\
                "display_source": null,\
                "ends_at": null,\
                "license_number": null,\
                "name": "SCRUM Alliance Certified Product Owner",\
                "starts_at": null,\
                "url": null\
            }\
        ],
        "city": "Seattle",
        "connections": 500,
        "country": "US",
        "country_full_name": "United States of America",
        "education": [\
            {\
                "activities_and_societies": null,\
                "degree_name": "Master of Business Administration (MBA)",\
                "description": null,\
                "ends_at": {\
                    "day": 31,\
                    "month": 12,\
                    "year": 2015\
                },\
                "field_of_study": "Finance + Economics",\
                "grade": null,\
                "logo_url": "https://media.licdn.com/dms/image/C560BAQGVi9eAHgWxFw/company-logo_100_100/0/1673448029676?e=2147483647\u0026v=beta\u0026t=NG6ttckXvnS2DX3abTfVACRY2E9Q1EcryNaJLRbE9OE",\
                "school": "University of Colorado Denver",\
                "school_facebook_profile_url": null,\
                "school_linkedin_profile_url": "https://www.linkedin.com/school/university-of-colorado-denver/",\
                "starts_at": {\
                    "day": 1,\
                    "month": 1,\
                    "year": 2013\
                }\
            },\
            {\
                "activities_and_societies": null,\
                "degree_name": null,\
                "description": "rails, ruby, rspec, capybara, bootstrap, css, html, api integration, Jquery, Javascript",\
                "ends_at": {\
                    "day": 31,\
                    "month": 12,\
                    "year": 2015\
                },\
                "field_of_study": "School of Software Development",\
                "grade": null,\
                "logo_url": "https://media.licdn.com/dms/image/C560BAQFKNxOZ4X0g8Q/company-logo_100_100/0/1670610916338?e=2147483647\u0026v=beta\u0026t=t7ImfhmsuIJ7HJGHEbPJ2suxdslKhzp9v-5h9_G4sWE",\
                "school": "Galvanize Inc",\
                "school_facebook_profile_url": null,\
                "school_linkedin_profile_url": "https://www.linkedin.com/school/galvanize-it/",\
                "starts_at": {\
                    "day": 1,\
                    "month": 1,\
                    "year": 2015\
                }\
            }\
        ],
        "experiences": [\
            {\
                "company": "Freedom Fund Real Estate",\
                "company_facebook_profile_url": null,\
                "company_linkedin_profile_url": "https://www.linkedin.com/company/freedomfund",\
                "description": "Our mission is to provide everyday people seeking financial freedom long before the age of 65 with the ability to invest in high yield, short-term real estate investments that were only accessible in the past for a select few wealthy individuals. Each of our single family rehab projects require a minimum investment contribution of only $10K, we have simple terms, no multi-year hold periods, and no fees. With our unique model investors can log into our easy to use website, select the projects that they want to invest in, and get realtime updates on the status of their investments.\n\nWebsite: https://www.freedomfundinvestments.com/home",\
                "ends_at": null,\
                "location": null,\
                "logo_url": "https://media.licdn.com/dms/image/C560BAQEYxazZM_hXgQ/company-logo_100_100/0/1634934418976?e=2147483647\u0026v=beta\u0026t=wI0YdMmxIctkzvnKxRfuAbT8h5eok_DlUqEph68J37s",\
                "starts_at": {\
                    "day": 1,\
                    "month": 8,\
                    "year": 2021\
                },\
                "title": "Co-Founder"\
            },\
            {\
                "company": "Mindset Reset Podcast",\
                "company_facebook_profile_url": null,\
                "company_linkedin_profile_url": "https://www.linkedin.com/company/mindset-reset-podcast",\
                "description": "We dive into the mindsets of the world\u2019s foremost thought leaders and turn them into actionable insights so that others can discover greater happiness, success, and fulfillment.\n\nhttps://podcasts.apple.com/us/podcast/mindset-reset/id1553212607",\
                "ends_at": null,\
                "location": "Denver, Colorado, United States",\
                "logo_url": "https://media.licdn.com/dms/image/C560BAQF9QJVQm3SOvA/company-logo_100_100/0/1614527476576?e=2147483647\u0026v=beta\u0026t=m3tx83nMN-E3XQFoJG0Wmch8U4qKnJ9i--5NSAfffC0",\
                "starts_at": {\
                    "day": 1,\
                    "month": 1,\
                    "year": 2021\
                },\
                "title": "Founder"\
            }\
        ],
        "first_name": "John",
        "follower_count": null,
        "full_name": "John Marty",
        "groups": [],
        "headline": "Financial Freedom through Real Estate - LinkedIn Top Voice",
        "languages_and_proficiencies": [\
            {\
                "name": "English",\
                "proficiency": "NATIVE_OR_BILINGUAL"\
            },\
            {\
                "name": "Japanese",\
                "proficiency": "ELEMENTARY"\
            }\
        ],
        "last_name": "Marty",
        "occupation": "Co-Founder at Freedom Fund Real Estate",
        "people_also_viewed": [],
        "profile_pic_url": "https://media.licdn.com/dms/image/C5603AQHaJSx0CBAUIA/profile-displayphoto-shrink_800_800/0/1558325759208?e=2147483647\u0026v=beta\u0026t=BluXpPg88xFnU2wMGLjuCUykSk_wKNdh8x3PI9wm6MI",
        "public_identifier": "johnrmarty",
        "recommendations": [\
            "Rebecca Canfield\n\n      \n          \n          \n\n\n\n              \n                \n        \n              \n  \n\n      \n          John Marty is a genius at his craft. He is skilled in the art of making people feel empowered to seek out roles that they are qualified for, ask for salaries that they deserve, and creates a kind of pay it forward lifestyle. John helps you to get to places that you only thought were possible for other people. Anyone that is fortunate enough to learn from John should consider themselves extremely lucky. I know I do. ",\
            "Zoe Sanoff\n\n      \n          \n          \n\n\n\n              \n                \n        \n              \n  \n\n      \n          John is so focused on helping guide you through an interview process not just for Amazon but on interviewing in general.  I\u0027ve generally done well at interviewing, my skills are top notch now.  John is so focused on on his clients and really goes above and beyond.  John is genuine, knowledgeable, well spoken and non-judgemental.  He is so encouraging, so positive and really easy to talk to.  Thank you John!"\
        ],
        "similarly_named_profiles": [\
            {\
                "link": "https://www.linkedin.com/in/john-martinez-90384a229",\
                "location": "San Antonio, TX",\
                "name": "John Martinez",\
                "summary": "Owner of Fight or Flight Medical Consultants, LLC  , Owner Marty\u2019s Hardwood Works"\
            },\
            {\
                "link": "https://www.linkedin.com/in/senatormarty",\
                "location": "St Paul, MN",\
                "name": "John Marty",\
                "summary": null\
            }\
        ],
        "state": "Washington",
        "summary": "Most people go through life lost, disengaged, and unhappy at work and in their lives - I\u0027m on a mission to solve that.\n\nI spent 10 years as the founder of Axxis Audio, an electronics company that grew to multi-million dollar sales, which I sold in 2012. At that time, I funneled my earnings into the creation of an Internet of Things company, but numerous factors lead to its demise after 2 hard fought years. \n\nAt 31, I was penny-less, had a baby on the way, and had zero job prospects (despite applying to 150 companies). My desperate situation led me to take a job at Best Buy for $12 an hour while reinventing myself through the completion of an MBA at the University of Colorado, and a 6-month software development boot camp. \n\nAfter graduation, I landed at American Express as a Senior Product Manager and then got poached by Amazon in 2017 (because of my LinkedIn profile). My journey has led to a deep sense of perspective, humility, and purpose that I draw on to help others find clarity, meaning, and happiness in their careers and lives. \n\nCheck out my website for details on my Mindset Reset Podcast, Public Speaking, Consulting, or my free 40 page LinkedIn guide\n\nhttp://www.johnraphaelmarty.com/\n\nFAQ\u0027s\n\nQ: Can you speak at my Company, University, event or podcast?\nA: I\u0027d love to! I\u0027ve shared my message on the future of employment, breaking into big tech, and my personal story of reinventing myself and discovering my sense of purpose (and how you can too!).\n\n\u2611\ufe0f  YouTube Channel #1 (John Marty) : http://www.youtube.com/c/JohnMarty-uncommon\n\u2611\ufe0f  YouTube Channel #2 (Tech Careers for non-engineers: https://www.youtube.com/channel/UC900gMMPLwRGGXSTW1gdZHA\n\nFUN FACTS:\n\u2611\ufe0f I am an Avid cyclist and runner, and I just started learning to skateboard a half-pipe.\n\u2611\ufe0f Into the Enneagram? - I\u0027m a #3 (The Achiever)\n\nLETS CONNECT:\n\u2611\ufe0f Email: JohnRmarty@gmail.com (don\u0027t forget that \"R\"....The other guy gets my emails all the time)",
        "volunteer_work": []
    },
    "url": "https://www.linkedin.com/in/senatormarty"
}

```

| Key | Description | Example |
| --- | --- | --- |
| url | The LinkedIn profile URL | `"https://www.linkedin.com/in/senatormarty"` |
| name\_similarity\_score | A measure of how similar the input name is to the name in the returned profile. Values can range from `0` to `1` , with `0` indicating no similarity and `1` implying high similarity. In cases where a current profile for comparison is not available in our dataset, the result may be `null`. | `0.5` |
| company\_similarity\_score | A measure of how similar the input company name/domain is to the name/domain of past or present companies in the returned profile. The score ranges from `0` to `1` , with `0` signifying no similarity and `1` denoting high similarity. If a relevant profile is unavailable in our dataset for comparison, a `null` score may be returned. | `0.5` |
| title\_similarity\_score | A measure of how similar the input title is to the returned profile's past or present titles. Scores vary from `0` to `1` , where `0` means no similarity and `1` indicates high similarity. If a relevant profile for comparison isn't available in our dataset, a `null` result may occur. | `0.5` |
| location\_similarity\_score | A measure of how similar the input location is to the returned profile's current location. The range is from `0` to `1` , with `0` representing no similarity and `1` signifying high similarity. If there isn't a relevant profile in our dataset for comparison, the score might be `null`. | `0.5` |
| profile | A [PersonEndpointResponse](https://nubela.co/proxycurl/docs#people-api-person-lookup-endpoint-response-personendpointresponse) object | See [PersonEndpointResponse](https://nubela.co/proxycurl/docs#people-api-person-lookup-endpoint-response-personendpointresponse) object |
| last\_updated | ISO 8601 timestamp since the enriched profile was last scraped. | `"2023-10-26T11:34:30Z"` |

#### PersonEndpointResponse

| Key | Description | Example |
| --- | --- | --- |
| public\_identifier | The vanity identifier of the LinkedIn profile.<br>The vanity identifier comes after the `/in/` part of the LinkedIn Profile URL<br>in the following format: `https://www.linkedin.com/in/<_identifier>` | `"johnrmarty"` |
| profile\_pic\_url | A temporary link to the user's profile picture that is valid for 30 minutes.<br>The temporal nature of the link is by design to prevent having Proxycurl be the mirror for the images.<br>The developer is expected to handle these images by downloading the image and re-hosting the image.<br>See [this post](https://nubela.co/blog/why-is-the-api-returning-s3-links-for-profile-pictures-scraped-from-linkedin-profiles/) for context.<br>Some profile pictures might be of the standard LinkedIn's profile picture placeholder. It is so because. See [this post](https://nubela.co/blog/why-do-most-linkedin-profiles-fetched-via-the-person-profile-endpoint-return-a-placeholder-profile-picture/) for context. | `"https://media.licdn.com/dms/image/C5603AQHaJSx0CBAUIA/profile-displayphoto-shrink_800_800/0/1558325759208?e=2147483647\u0026v=beta\u0026t=BluXpPg88xFnU2wMGLjuCUykSk_wKNdh8x3PI9wm6MI"` |
| background\_cover\_image\_url | A temporary link to the user's background cover picture<br>that is valid for 30 minutes.<br>The temporal nature of the link is by design to prevent<br>having Proxycurl be the mirror for the images.<br>The developer is expected to handle these images<br>by downloading the image and re-hosting the image.<br>See [this post](https://nubela.co/blog/why-is-the-api-returning-s3-links-for-profile-pictures-scraped-from-linkedin-profiles/) for context. | `"https://media.licdn.com/dms/image/C5616AQH9tkBTUhHfng/profile-displaybackgroundimage-shrink_200_800/0/1614530499015?e=2147483647\u0026v=beta\u0026t=VEoCyedtZulnAVYWT9BXfKHi5OFp8avElNjiz8kjSTU"` |
| first\_name | First name of the user. | `"John"` |
| last\_name | Last name of the user. | `"Marty"` |
| full\_name | Full name of the user ( `first_name` \+ `last_name`) | `"John Marty"` |
| follower\_count | Follower count for this profile | `null` |
| occupation | The title and company name of the user's current employment. | `"Co-Founder at Freedom Fund Real Estate"` |
| headline | The tagline written by the user for his profile. | `"Financial Freedom through Real Estate - LinkedIn Top Voice"` |
| summary | A blurb (longer than the tagline) written by the user for his profile. | `"Most people go through life lost, disengaged, and unhappy at work and in their lives - I\u0027m on a mission to solve that.\n\nI spent 10 years as the founder of Axxis Audio, an electronics company that grew to multi-million dollar sales, which I sold in 2012. At that time, I funneled my earnings into the creation of an Internet of Things company, but numerous factors lead to its demise after 2 hard fought years. \n\nAt 31, I was penny-less, had a baby on the way, and had zero job prospects (despite applying to 150 companies). My desperate situation led me to take a job at Best Buy for $12 an hour while reinventing myself through the completion of an MBA at the University of Colorado, and a 6-month software development boot camp. \n\nAfter graduation, I landed at American Express as a Senior Product Manager and then got poached by Amazon in 2017 (because of my LinkedIn profile). My journey has led to a deep sense of perspective, humility, and purpose that I draw on to help others find clarity, meaning, and happiness in their careers and lives. \n\nCheck out my website for details on my Mindset Reset Podcast, Public Speaking, Consulting, or my free 40 page LinkedIn guide\n\nhttp://www.johnraphaelmarty.com/\n\nFAQ\u0027s\n\nQ: Can you speak at my Company, University, event or podcast?\nA: I\u0027d love to! I\u0027ve shared my message on the future of employment, breaking into big tech, and my personal story of reinventing myself and discovering my sense of purpose (and how you can too!).\n\n\u2611\ufe0f  YouTube Channel #1 (John Marty) : http://www.youtube.com/c/JohnMarty-uncommon\n\u2611\ufe0f  YouTube Channel #2 (Tech Careers for non-engineers: https://www.youtube.com/channel/UC900gMMPLwRGGXSTW1gdZHA\n\nFUN FACTS:\n\u2611\ufe0f I am an Avid cyclist and runner, and I just started learning to skateboard a half-pipe.\n\u2611\ufe0f Into the Enneagram? - I\u0027m a #3 (The Achiever)\n\nLETS CONNECT:\n\u2611\ufe0f Email: JohnRmarty@gmail.com (don\u0027t forget that \"R\"....The other guy gets my emails all the time)"` |
| country | The user's country of residence depicted by<br>a 2-letter country code (ISO 3166-1 alpha-2). | `"US"` |
| country\_full\_name | The user's country of residence, in English words. | `"United States of America"` |
| city | The city that the user is living at. | `"Seattle"` |
| state | The state that the user is living at. | `"Washington"` |
| experiences | The user's list of historic work experiences. | See [Experience](https://nubela.co/proxycurl/docs#people-api-person-lookup-endpoint-response-experience) object |
| education | The user's list of education background. | See [Education](https://nubela.co/proxycurl/docs#people-api-person-lookup-endpoint-response-education) object |
| languages\_and\_proficiencies | The user's list of languages along with their proficiency<br>level. | See [Language](https://nubela.co/proxycurl/docs#people-api-person-lookup-endpoint-response-language) object |
| accomplishment\_organisations | List of noteworthy organizations that this user is part of. | See [AccomplishmentOrg](https://nubela.co/proxycurl/docs#people-api-person-lookup-endpoint-response-accomplishmentorg) object |
| accomplishment\_publications | List of noteworthy publications that this user has partook in. | See [Publication](https://nubela.co/proxycurl/docs#people-api-person-lookup-endpoint-response-publication) object |
| accomplishment\_honors\_awards | List of noteworthy honours and awards that this user has won. | See [HonourAward](https://nubela.co/proxycurl/docs#people-api-person-lookup-endpoint-response-honouraward) object |
| accomplishment\_patents | List of noteworthy patents won by this user. | See [Patent](https://nubela.co/proxycurl/docs#people-api-person-lookup-endpoint-response-patent) object |
| accomplishment\_courses | List of noteworthy courses partook by this user. | See [Course](https://nubela.co/proxycurl/docs#people-api-person-lookup-endpoint-response-course) object |
| accomplishment\_projects | List of noteworthy projects undertaken by this user. | See [Project](https://nubela.co/proxycurl/docs#people-api-person-lookup-endpoint-response-project) object |
| accomplishment\_test\_scores | List of noteworthy test scores accomplished by this user. | See [TestScore](https://nubela.co/proxycurl/docs#people-api-person-lookup-endpoint-response-testscore) object |
| volunteer\_work | List of historic volunteer work experiences. | See [VolunteeringExperience](https://nubela.co/proxycurl/docs#people-api-person-lookup-endpoint-response-volunteeringexperience) object |
| certifications | List of noteworthy certifications accomplished by this user. | See [Certification](https://nubela.co/proxycurl/docs#people-api-person-lookup-endpoint-response-certification) object |
| connections | Total _count_ of LinkedIn connections. | `500` |
| people\_also\_viewed | A list of other LinkedIn profiles closely related to this user. | See [PeopleAlsoViewed](https://nubela.co/proxycurl/docs#people-api-person-lookup-endpoint-response-peoplealsoviewed) object |
| recommendations | List of recommendations made by other users about this profile. | `["Professional and dedicated approach towards clients and collegues."]` |
| activities | A list of LinkedIn status activities. This field is not guaranteed to be returned. Do not rely on this attribute in production. | See [Activity](https://nubela.co/proxycurl/docs#people-api-person-lookup-endpoint-response-activity) object |
| similarly\_named\_profiles | A list of other LinkedIn profiles with similar names. | See [SimilarProfile](https://nubela.co/proxycurl/docs#people-api-person-lookup-endpoint-response-similarprofile) object |
| articles | A list of content-based articles posted by this user. This field is not guaranteed to be returned. Do not rely on this attribute in production. | See [Article](https://nubela.co/proxycurl/docs#people-api-person-lookup-endpoint-response-article) object |
| groups | A list of LinkedIn groups that this user is a part of.", | See [PersonGroup](https://nubela.co/proxycurl/docs#people-api-person-lookup-endpoint-response-persongroup) object |
| inferred\_salary | A salary range inferred from the user's current job title and company. | See [InferredSalary](https://nubela.co/proxycurl/docs#people-api-person-lookup-endpoint-response-inferredsalary) object |
| gender | Gender of the user. | `"male"` |
| birth\_date | Birth date of the user. | See [Date](https://nubela.co/proxycurl/docs#people-api-person-lookup-endpoint-response-date) object |
| industry | Industry that the user works in. | `"government administration"` |
| extra | A bundle of extra data on this user. | See [PersonExtra](https://nubela.co/proxycurl/docs#people-api-person-lookup-endpoint-response-personextra) object |
| interests | A list of interests that the user has. | `["education", "health", "human rights"]` |
| personal\_emails | A list of personal emails associated with this user. | `["abc@gmail.com", "bcd@gmail.com", "cde@@outlook.com"]` |
| personal\_numbers | A list of personal mobile phone numbers associated with this user. | `["+6512345678", "+6285123450953", "+6502300340"]` |

#### Experience

| Key | Description | Example |
| --- | --- | --- |
| starts\_at |  | `{"day": 1, "month": 8, "year": 2021}` |
| ends\_at |  | `null` |
| company | The company's display name. | `"Freedom Fund Real Estate"` |
| company\_linkedin\_profile\_url | The company's profile URL on Linkedin.<br>If present, could be used with<br>[Company Profile Endpoint](https://nubela.co/proxycurl/docs#company-api-company-profile-endpoint) for more info. | `"https://www.linkedin.com/company/freedomfund"` |
| company\_facebook\_profile\_url | The company's profile URL on Facebook. | `null` |
| title |  | `"Co-Founder"` |
| description |  | `"Our mission is to provide everyday people seeking financial freedom long before the age of 65 with the ability to invest in high yield, short-term real estate investments that were only accessible in the past for a select few wealthy individuals. Each of our single family rehab projects require a minimum investment contribution of only $10K, we have simple terms, no multi-year hold periods, and no fees. With our unique model investors can log into our easy to use website, select the projects that they want to invest in, and get realtime updates on the status of their investments.\n\nWebsite: https://www.freedomfundinvestments.com/home"` |
| location |  | `null` |
| logo\_url | URL of the logo of the organisation. | `"https://media.licdn.com/dms/image/C560BAQEYxazZM_hXgQ/company-logo_100_100/0/1634934418976?e=2147483647\u0026v=beta\u0026t=wI0YdMmxIctkzvnKxRfuAbT8h5eok_DlUqEph68J37s"` |

#### Education

| Key | Description | Example |
| --- | --- | --- |
| starts\_at |  | `{"day": 1, "month": 1, "year": 2013}` |
| ends\_at |  | `{"day": 31, "month": 12, "year": 2015}` |
| field\_of\_study | The field of study that the user majored in. | `"Finance + Economics"` |
| degree\_name | The degree that the user obtained. | `"Master of Business Administration (MBA)"` |
| school | The school that the user attended. | `"University of Colorado Denver"` |
| school\_linkedin\_profile\_url | The school's profile URL on Linkedin.<br>If present, could be used with<br>[School Profile Endpoint](https://nubela.co/proxycurl/docs#school-api-school-profile-endpoint) for more info. | `"https://www.linkedin.com/school/university-of-colorado-denver/"` |
| school\_facebook\_profile\_url | The school's profile URL on Facebook. | `null` |
| description | Description of the education. | `null` |
| logo\_url | URL of the logo of the organisation. | `"https://media.licdn.com/dms/image/C560BAQGVi9eAHgWxFw/company-logo_100_100/0/1673448029676?e=2147483647\u0026v=beta\u0026t=NG6ttckXvnS2DX3abTfVACRY2E9Q1EcryNaJLRbE9OE"` |
| grade | The grade that the user obtained. | `null` |
| activities\_and\_societies | The activities and societies that the user participated in. | `null` |

#### Language

| Key | Description | Example |
| --- | --- | --- |
| name | Name of the language. | `"English"` |
| proficiency | Proficiency level of the user in the language.<br>Possible values:<br>\- `ELEMENTARY` (Elementary proficiency)<br>\- `LIMITED_WORKING` (Limited working proficiency)<br>\- `PROFESSIONAL_WORKING` (Professional working proficiency)<br>\- `FULL_PROFESSIONAL` (Full professional proficiency)<br>\- `NATIVE_OR_BILINGUAL` (Native or bilingual proficiency) | `"NATIVE_OR_BILINGUAL"` |

#### AccomplishmentOrg

| Key | Description | Example |
| --- | --- | --- |
| starts\_at |  | `{"day": 1, "month": 1, "year": 2012}` |
| ends\_at |  | `{"day": 1, "month": 8, "year": 2016}` |
| org\_name |  | `"Microsoft"` |
| title |  | `"Software Developer"` |
| description |  | `null` |

#### Publication

| Key | Description | Example |
| --- | --- | --- |
| name | Name of the Publication. | `"Nobel Peace Prize"` |
| publisher | The publishing organisation body. | `"Acme Corp"` |
| published\_on | Date of Publication. | See [Date](https://nubela.co/proxycurl/docs#people-api-person-lookup-endpoint-response-date) object |
| description | Description of the Publication. | `"\n                        Lorem ipsum dolor sit amet, consectetur adipiscing elit\n                    "` |
| url | URL of the Publication. | `"https://example.com"` |

#### Date

| Key | Description | Example |
| --- | --- | --- |
| day |  | `1` |
| month |  | `1` |
| year |  | `2023` |

#### HonourAward

| Key | Description | Example |
| --- | --- | --- |
| title | Title of the honour/award. | `"Nobel Peace Prize"` |
| issuer | The organisation body issuing this honour/award. | `"Acme Corp"` |
| issued\_on | Date that this honour/awared was issued. | See [Date](https://nubela.co/proxycurl/docs#people-api-person-lookup-endpoint-response-date) object |
| description | Description of the honour/award. | `"\n                        Lorem ipsum dolor sit amet, consectetur adipiscing elit\n                    "` |

#### Patent

| Key | Description | Example |
| --- | --- | --- |
| title | Title of the patent. | `"The art of war"` |
| issuer | The organisation body that issued the patent. | `"Acme Corp"` |
| issued\_on | Date of patent issuance. | See [Date](https://nubela.co/proxycurl/docs#people-api-person-lookup-endpoint-response-date) object |
| description | Description of the patent. | `"\n                        Lorem ipsum dolor sit amet, consectetur adipiscing elit\n                    "` |
| application\_number | Numerical representation that identifies the patent. | `"123"` |
| patent\_number | Application number of the patent. | `"123"` |
| url |  | `null` |

#### Course

| Key | Description | Example |
| --- | --- | --- |
| name | Name of the course | `"The course about ABCs"` |
| number | The numerical representation of the course | `"123"` |

#### Project

| Key | Description | Example |
| --- | --- | --- |
| starts\_at |  | `{"day": 1, "month": 3, "year": 2015}` |
| ends\_at |  | `null` |
| title | Name of the project that has been or is currently being worked on. | `"gMessenger"` |
| description | Description of the project. | `"gMessenger was built using Ruby on Rails, and the Bootstrap HTML, CSS, and JavaScript framework. It uses a Websocket-Rails integration to post a user\u0027s message content to the page in real time, with no page refresh required. gMessenger also includes custom authentication with three different permissions levels."` |
| url | A web location related to the project. | `"http://gmessenger.herokuapp.com/"` |

#### TestScore

| Key | Description | Example |
| --- | --- | --- |
| name | Title of the course for which test score was derived from. | `"CS1101S"` |
| score | Test score | `"A"` |
| date\_on | Date of test was assesed. | See [Date](https://nubela.co/proxycurl/docs#people-api-person-lookup-endpoint-response-date) object |
| description | Description of the test score. | `"Nailed it without studying."` |

#### VolunteeringExperience

| Key | Description | Example |
| --- | --- | --- |
| starts\_at |  | `{"day": 1, "month": 1, "year": 2012}` |
| ends\_at |  | `{"day": 1, "month": 8, "year": 2016}` |
| title | Name of volunteer activity. | `"Surveyor"` |
| cause |  | `"To help the world"` |
| company | The company's display name. | `"Microsoft"` |
| company\_linkedin\_profile\_url | The company's profile URL.<br>If present, could be used with<br>[Company Profile Endpoint](https://nubela.co/proxycurl/docs#company-api-company-profile-endpoint) for more info. | `"https://www.linkedin.com/company/microsoft"` |
| description |  | `null` |
| logo\_url | URL of the logo of the organisation. | `null` |

#### Certification

| Key | Description | Example |
| --- | --- | --- |
| starts\_at |  | `null` |
| ends\_at |  | `null` |
| name | Name of the course or program. | `"SAFe Agile Framework Practitioner - ( Scrum, XP, and Lean Practices in the SAFe Enterprise)"` |
| license\_number |  | `null` |
| display\_source |  | `null` |
| authority | The organisation body issuing this certificate. | `"Scaled Agile, Inc."` |
| url |  | `null` |

#### PeopleAlsoViewed

| Key | Description | Example |
| --- | --- | --- |
| link | URL of the profile.<br>Useable with [Person profile endpoint](https://nubela.co/proxycurl/docs#people-api-person-profile-endpoint) | `"https://www.linkedin.com/in/johndoe"` |
| name |  | `"John Doe"` |
| summary |  | `"Software Engineer at Google"` |
| location |  | `"Singapore"` |

#### Activity

| Key | Description | Example |
| --- | --- | --- |
| title |  | `"I am hiring!"` |
| link |  | `"https://www.linkedin.com/feed/update/urn:li:activity:666"` |
| activity\_status |  | `"posted"` |

#### SimilarProfile

| Key | Description | Example |
| --- | --- | --- |
| name |  | `"John Martinez"` |
| link |  | `"https://www.linkedin.com/in/john-martinez-90384a229"` |
| summary |  | `"Owner of Fight or Flight Medical Consultants, LLC  , Owner Marty\u2019s Hardwood Works"` |
| location |  | `"San Antonio, TX"` |

#### Article

| Key | Description | Example |
| --- | --- | --- |
| title |  | `"Manufacturing opportunity"` |
| link |  | `"https://www.linkedin.com/pulse/manufacturing-opportunity-bill-gates/"` |
| published\_date | A [Date](https://nubela.co/proxycurl/docs#people-api-person-lookup-endpoint-response-date) object | See [Date](https://nubela.co/proxycurl/docs#people-api-person-lookup-endpoint-response-date) object |
| author |  | `"Bill Gates"` |
| image\_url |  | `"https://media-exp1.licdn.com/dms/image/C4E12AQFftuPi0UiqWA/article-cover_image-shrink_720_1280/0/1574801149114?e=1640822400\u0026v=beta\u0026t=ZAe3ERmQCM8QHGmRPS2LJ-C76GD5PR7FBHMVL4Z6iVg"` |

#### PersonGroup

| Key | Description | Example |
| --- | --- | --- |
| profile\_pic\_url | The URL to the profile picture of this LinkedIn Group | `"https://media-exp1.licdn.com/dms/image/C4D07AQG9IK9V0pk3mQ/group-logo_image-shrink_92x92/0/1631371531293?e=1642060800\u0026v=beta\u0026t=UK1tfIppWa-Nx7k9whmm5f9XdZoBdJhApf9N3ke3204"` |
| name | Name of LinkedIn group for which this user is in | `"Hadoop Users"` |
| url | URL to the LinkedIn Group | `"https://www.linkedin.com/groups/988957"` |

#### InferredSalary

| Key | Description | Example |
| --- | --- | --- |
| min |  | `35000` |
| max |  | `45000` |

#### PersonExtra

| Key | Description | Example |
| --- | --- | --- |
| github\_profile\_id | This profile's Github account. | `"github-username"` |
| facebook\_profile\_id | This profile's Facebook account. | `"facebook-username"` |
| twitter\_profile\_id | This profile's twitter account. | `"twitter-username"` |
| website | This account's website listed on his profile. | `"https://proxycurl.com"` |

### Response Headers

| Header Key | Description | Example |
| --- | --- | --- |
| `X-Proxycurl-Credit-Cost` | Total cost of credits for this API call | `2` |

### Remarks

The accuracy of the linkedin profile returned is on a best-effort basis.
Results are not guaranteed to be accurate.
We are always improving on the accuracy of these endpoints iteratively.

## Role Lookup Endpoint

`GET /proxycurl/api/find/company/role/`

Cost: `3` credits / successful request.
Credits are charged even if a successful request returns an empty result.

Returns the profile of a person who most closely matches a specified role
in a company. For instance, it can be used to identify the "CTO" of
"Apple". The endpoint yields a single result that represents the closest
match. For a detailed comparison between this API endpoint and the
[Employee Search Endpoint](https://nubela.co/proxycurl/docs#company-api-employee-search-endpoint)
or the [Person Search Endpoint](https://nubela.co/proxycurl/docs#search-api-person-search-endpoint),
refer to [this article](https://nubela.co/blog/what-is-the-difference-between-the-person-search-endpoint-role-lookup-endpoint-and-the-employee-search-endpoint).

```
curl \
    -G \
    -H "Authorization: Bearer ${YOUR_API_KEY}" \
    'https://nubela.co/proxycurl/api/find/company/role/' \
    --data-urlencode 'role=ceo' \
    --data-urlencode 'company_name=nubela' \
    --data-urlencode 'enrich_profile=enrich'

```

```
import requests

api_key = 'YOUR_API_KEY'
headers = {'Authorization': 'Bearer ' + api_key}
api_endpoint = 'https://nubela.co/proxycurl/api/find/company/role/'
params = {
    'role': 'ceo',
    'company_name': 'nubela',
    'enrich_profile': 'enrich',
}
response = requests.get(api_endpoint,
                        params=params,
                        headers=headers)

```

[![Run in Postman](https://run.pstmn.io/button.svg)](https://pxlcl.co/run-collection)

### URL Parameters

| Parameter | Required | Description | Example |
| --- | --- | --- | --- |
| `role` | yes | Role of the profile that you are lookin up | `ceo` |
| `company_name` | yes | Name of the company that you are searching for | `nubela` |
| `enrich_profile` | no | Enrich the result with a cached profile of the lookup result.<br>The valid values are:<br>\\* `skip` (default): do not enrich the results with cached profile data<br>\\* `enrich`: enriches the result with cached profile data<br>Calling this API endpoint with this parameter would add 1 credit.<br>If you require [fresh profile data](https://nubela.co/blog/how-fresh-are-profiles-returned-by-proxycurl-api/),<br>please chain this API call with the [Person Profile Endpoint](https://nubela.co/proxycurl/docs#people-api-person-profile-endpoint) with the `use_cache=if-recent` parameter. | `enrich` |

### Response

```
{
    "last_updated": "2023-10-26T11:34:30Z",
    "linkedin_profile_url": "https://www.linkedin.com/in/senatormarty",
    "profile": {
        "accomplishment_courses": [],
        "accomplishment_honors_awards": [],
        "accomplishment_organisations": [],
        "accomplishment_patents": [],
        "accomplishment_projects": [\
            {\
                "description": "gMessenger was built using Ruby on Rails, and the Bootstrap HTML, CSS, and JavaScript framework. It uses a Websocket-Rails integration to post a user\u0027s message content to the page in real time, with no page refresh required. gMessenger also includes custom authentication with three different permissions levels.",\
                "ends_at": null,\
                "starts_at": {\
                    "day": 1,\
                    "month": 3,\
                    "year": 2015\
                },\
                "title": "gMessenger",\
                "url": "http://gmessenger.herokuapp.com/"\
            },\
            {\
                "description": "A task and project management responsive web app utilizing Ruby on Rails - CSS and HTML",\
                "ends_at": null,\
                "starts_at": {\
                    "day": 1,\
                    "month": 1,\
                    "year": 2015\
                },\
                "title": "Taskly",\
                "url": "https://hidden-coast-7204.herokuapp.com/"\
            }\
        ],
        "accomplishment_publications": [],
        "accomplishment_test_scores": [],
        "activities": [\
            {\
                "activity_status": "Shared by John Marty",\
                "link": "https://www.linkedin.com/posts/johnrmarty_financialfreedom-realestate-technology-activity-6940294635743301632-rsLo",\
                "title": "Yesterday I toured a $1.2M property in California that has a large 13K sq ft lot with two homes on it. After 5 minutes of being on-site I\u2026"\
            }\
        ],
        "articles": [],
        "background_cover_image_url": "https://media.licdn.com/dms/image/C5616AQH9tkBTUhHfng/profile-displaybackgroundimage-shrink_200_800/0/1614530499015?e=2147483647\u0026v=beta\u0026t=VEoCyedtZulnAVYWT9BXfKHi5OFp8avElNjiz8kjSTU",
        "certifications": [\
            {\
                "authority": "Scaled Agile, Inc.",\
                "display_source": null,\
                "ends_at": null,\
                "license_number": null,\
                "name": "SAFe Agile Framework Practitioner - ( Scrum, XP, and Lean Practices in the SAFe Enterprise)",\
                "starts_at": null,\
                "url": null\
            },\
            {\
                "authority": "Scrum Alliance",\
                "display_source": null,\
                "ends_at": null,\
                "license_number": null,\
                "name": "SCRUM Alliance Certified Product Owner",\
                "starts_at": null,\
                "url": null\
            }\
        ],
        "city": "Seattle",
        "connections": 500,
        "country": "US",
        "country_full_name": "United States of America",
        "education": [\
            {\
                "activities_and_societies": null,\
                "degree_name": "Master of Business Administration (MBA)",\
                "description": null,\
                "ends_at": {\
                    "day": 31,\
                    "month": 12,\
                    "year": 2015\
                },\
                "field_of_study": "Finance + Economics",\
                "grade": null,\
                "logo_url": "https://media.licdn.com/dms/image/C560BAQGVi9eAHgWxFw/company-logo_100_100/0/1673448029676?e=2147483647\u0026v=beta\u0026t=NG6ttckXvnS2DX3abTfVACRY2E9Q1EcryNaJLRbE9OE",\
                "school": "University of Colorado Denver",\
                "school_facebook_profile_url": null,\
                "school_linkedin_profile_url": "https://www.linkedin.com/school/university-of-colorado-denver/",\
                "starts_at": {\
                    "day": 1,\
                    "month": 1,\
                    "year": 2013\
                }\
            },\
            {\
                "activities_and_societies": null,\
                "degree_name": null,\
                "description": "rails, ruby, rspec, capybara, bootstrap, css, html, api integration, Jquery, Javascript",\
                "ends_at": {\
                    "day": 31,\
                    "month": 12,\
                    "year": 2015\
                },\
                "field_of_study": "School of Software Development",\
                "grade": null,\
                "logo_url": "https://media.licdn.com/dms/image/C560BAQFKNxOZ4X0g8Q/company-logo_100_100/0/1670610916338?e=2147483647\u0026v=beta\u0026t=t7ImfhmsuIJ7HJGHEbPJ2suxdslKhzp9v-5h9_G4sWE",\
                "school": "Galvanize Inc",\
                "school_facebook_profile_url": null,\
                "school_linkedin_profile_url": "https://www.linkedin.com/school/galvanize-it/",\
                "starts_at": {\
                    "day": 1,\
                    "month": 1,\
                    "year": 2015\
                }\
            }\
        ],
        "experiences": [\
            {\
                "company": "Freedom Fund Real Estate",\
                "company_facebook_profile_url": null,\
                "company_linkedin_profile_url": "https://www.linkedin.com/company/freedomfund",\
                "description": "Our mission is to provide everyday people seeking financial freedom long before the age of 65 with the ability to invest in high yield, short-term real estate investments that were only accessible in the past for a select few wealthy individuals. Each of our single family rehab projects require a minimum investment contribution of only $10K, we have simple terms, no multi-year hold periods, and no fees. With our unique model investors can log into our easy to use website, select the projects that they want to invest in, and get realtime updates on the status of their investments.\n\nWebsite: https://www.freedomfundinvestments.com/home",\
                "ends_at": null,\
                "location": null,\
                "logo_url": "https://media.licdn.com/dms/image/C560BAQEYxazZM_hXgQ/company-logo_100_100/0/1634934418976?e=2147483647\u0026v=beta\u0026t=wI0YdMmxIctkzvnKxRfuAbT8h5eok_DlUqEph68J37s",\
                "starts_at": {\
                    "day": 1,\
                    "month": 8,\
                    "year": 2021\
                },\
                "title": "Co-Founder"\
            },\
            {\
                "company": "Mindset Reset Podcast",\
                "company_facebook_profile_url": null,\
                "company_linkedin_profile_url": "https://www.linkedin.com/company/mindset-reset-podcast",\
                "description": "We dive into the mindsets of the world\u2019s foremost thought leaders and turn them into actionable insights so that others can discover greater happiness, success, and fulfillment.\n\nhttps://podcasts.apple.com/us/podcast/mindset-reset/id1553212607",\
                "ends_at": null,\
                "location": "Denver, Colorado, United States",\
                "logo_url": "https://media.licdn.com/dms/image/C560BAQF9QJVQm3SOvA/company-logo_100_100/0/1614527476576?e=2147483647\u0026v=beta\u0026t=m3tx83nMN-E3XQFoJG0Wmch8U4qKnJ9i--5NSAfffC0",\
                "starts_at": {\
                    "day": 1,\
                    "month": 1,\
                    "year": 2021\
                },\
                "title": "Founder"\
            }\
        ],
        "first_name": "John",
        "follower_count": null,
        "full_name": "John Marty",
        "groups": [],
        "headline": "Financial Freedom through Real Estate - LinkedIn Top Voice",
        "languages": [\
            "English",\
            "Spanish"\
        ],
        "last_name": "Marty",
        "occupation": "Co-Founder at Freedom Fund Real Estate",
        "people_also_viewed": [],
        "profile_pic_url": "https://media.licdn.com/dms/image/C5603AQHaJSx0CBAUIA/profile-displayphoto-shrink_800_800/0/1558325759208?e=2147483647\u0026v=beta\u0026t=BluXpPg88xFnU2wMGLjuCUykSk_wKNdh8x3PI9wm6MI",
        "public_identifier": "johnrmarty",
        "recommendations": [\
            "Rebecca Canfield\n\n      \n          \n          \n\n\n\n              \n                \n        \n              \n  \n\n      \n          John Marty is a genius at his craft. He is skilled in the art of making people feel empowered to seek out roles that they are qualified for, ask for salaries that they deserve, and creates a kind of pay it forward lifestyle. John helps you to get to places that you only thought were possible for other people. Anyone that is fortunate enough to learn from John should consider themselves extremely lucky. I know I do. ",\
            "Zoe Sanoff\n\n      \n          \n          \n\n\n\n              \n                \n        \n              \n  \n\n      \n          John is so focused on helping guide you through an interview process not just for Amazon but on interviewing in general.  I\u0027ve generally done well at interviewing, my skills are top notch now.  John is so focused on on his clients and really goes above and beyond.  John is genuine, knowledgeable, well spoken and non-judgemental.  He is so encouraging, so positive and really easy to talk to.  Thank you John!"\
        ],
        "similarly_named_profiles": [\
            {\
                "link": "https://www.linkedin.com/in/john-martinez-90384a229",\
                "location": "San Antonio, TX",\
                "name": "John Martinez",\
                "summary": "Owner of Fight or Flight Medical Consultants, LLC  , Owner Marty\u2019s Hardwood Works"\
            },\
            {\
                "link": "https://www.linkedin.com/in/senatormarty",\
                "location": "St Paul, MN",\
                "name": "John Marty",\
                "summary": null\
            }\
        ],
        "state": "Washington",
        "summary": "Most people go through life lost, disengaged, and unhappy at work and in their lives - I\u0027m on a mission to solve that.\n\nI spent 10 years as the founder of Axxis Audio, an electronics company that grew to multi-million dollar sales, which I sold in 2012. At that time, I funneled my earnings into the creation of an Internet of Things company, but numerous factors lead to its demise after 2 hard fought years. \n\nAt 31, I was penny-less, had a baby on the way, and had zero job prospects (despite applying to 150 companies). My desperate situation led me to take a job at Best Buy for $12 an hour while reinventing myself through the completion of an MBA at the University of Colorado, and a 6-month software development boot camp. \n\nAfter graduation, I landed at American Express as a Senior Product Manager and then got poached by Amazon in 2017 (because of my LinkedIn profile). My journey has led to a deep sense of perspective, humility, and purpose that I draw on to help others find clarity, meaning, and happiness in their careers and lives. \n\nCheck out my website for details on my Mindset Reset Podcast, Public Speaking, Consulting, or my free 40 page LinkedIn guide\n\nhttp://www.johnraphaelmarty.com/\n\nFAQ\u0027s\n\nQ: Can you speak at my Company, University, event or podcast?\nA: I\u0027d love to! I\u0027ve shared my message on the future of employment, breaking into big tech, and my personal story of reinventing myself and discovering my sense of purpose (and how you can too!).\n\n\u2611\ufe0f  YouTube Channel #1 (John Marty) : http://www.youtube.com/c/JohnMarty-uncommon\n\u2611\ufe0f  YouTube Channel #2 (Tech Careers for non-engineers: https://www.youtube.com/channel/UC900gMMPLwRGGXSTW1gdZHA\n\nFUN FACTS:\n\u2611\ufe0f I am an Avid cyclist and runner, and I just started learning to skateboard a half-pipe.\n\u2611\ufe0f Into the Enneagram? - I\u0027m a #3 (The Achiever)\n\nLETS CONNECT:\n\u2611\ufe0f Email: JohnRmarty@gmail.com (don\u0027t forget that \"R\"....The other guy gets my emails all the time)",
        "volunteer_work": []
    }
}

```

| Key | Description | Example |
| --- | --- | --- |
| linkedin\_profile\_url | LinkedIn Profile URL of the person that most closely matches the role | `"https://www.linkedin.com/in/senatormarty"` |
| profile | A [PersonEndpointResponse](https://nubela.co/proxycurl/docs#people-api-role-lookup-endpoint-response-personendpointresponse) object | See [PersonEndpointResponse](https://nubela.co/proxycurl/docs#people-api-role-lookup-endpoint-response-personendpointresponse) object |
| last\_updated | ISO 8601 timestamp since the enriched profile was last scraped. | `"2023-10-26T11:34:30Z"` |

#### PersonEndpointResponse

| Key | Description | Example |
| --- | --- | --- |
| public\_identifier | The vanity identifier of the LinkedIn profile.<br>The vanity identifier comes after the `/in/` part of the LinkedIn Profile URL<br>in the following format: `https://www.linkedin.com/in/<_identifier>` | `"johnrmarty"` |
| profile\_pic\_url | A temporary link to the user's profile picture that is valid for 30 minutes.<br>The temporal nature of the link is by design to prevent having Proxycurl be the mirror for the images.<br>The developer is expected to handle these images by downloading the image and re-hosting the image.<br>See [this post](https://nubela.co/blog/why-is-the-api-returning-s3-links-for-profile-pictures-scraped-from-linkedin-profiles/) for context.<br>Some profile pictures might be of the standard LinkedIn's profile picture placeholder. It is so because. See [this post](https://nubela.co/blog/why-do-most-linkedin-profiles-fetched-via-the-person-profile-endpoint-return-a-placeholder-profile-picture/) for context. | `"https://media.licdn.com/dms/image/C5603AQHaJSx0CBAUIA/profile-displayphoto-shrink_800_800/0/1558325759208?e=2147483647\u0026v=beta\u0026t=BluXpPg88xFnU2wMGLjuCUykSk_wKNdh8x3PI9wm6MI"` |
| background\_cover\_image\_url | A temporary link to the user's background cover picture<br>that is valid for 30 minutes.<br>The temporal nature of the link is by design to prevent<br>having Proxycurl be the mirror for the images.<br>The developer is expected to handle these images<br>by downloading the image and re-hosting the image.<br>See [this post](https://nubela.co/blog/why-is-the-api-returning-s3-links-for-profile-pictures-scraped-from-linkedin-profiles/) for context. | `"https://media.licdn.com/dms/image/C5616AQH9tkBTUhHfng/profile-displaybackgroundimage-shrink_200_800/0/1614530499015?e=2147483647\u0026v=beta\u0026t=VEoCyedtZulnAVYWT9BXfKHi5OFp8avElNjiz8kjSTU"` |
| first\_name | First name of the user. | `"John"` |
| last\_name | Last name of the user. | `"Marty"` |
| full\_name | Full name of the user ( `first_name` \+ `last_name`) | `"John Marty"` |
| follower\_count | Follower count for this profile | `null` |
| occupation | The title and company name of the user's current employment. | `"Co-Founder at Freedom Fund Real Estate"` |
| headline | The tagline written by the user for his profile. | `"Financial Freedom through Real Estate - LinkedIn Top Voice"` |
| summary | A blurb (longer than the tagline) written by the user for his profile. | `"Most people go through life lost, disengaged, and unhappy at work and in their lives - I\u0027m on a mission to solve that.\n\nI spent 10 years as the founder of Axxis Audio, an electronics company that grew to multi-million dollar sales, which I sold in 2012. At that time, I funneled my earnings into the creation of an Internet of Things company, but numerous factors lead to its demise after 2 hard fought years. \n\nAt 31, I was penny-less, had a baby on the way, and had zero job prospects (despite applying to 150 companies). My desperate situation led me to take a job at Best Buy for $12 an hour while reinventing myself through the completion of an MBA at the University of Colorado, and a 6-month software development boot camp. \n\nAfter graduation, I landed at American Express as a Senior Product Manager and then got poached by Amazon in 2017 (because of my LinkedIn profile). My journey has led to a deep sense of perspective, humility, and purpose that I draw on to help others find clarity, meaning, and happiness in their careers and lives. \n\nCheck out my website for details on my Mindset Reset Podcast, Public Speaking, Consulting, or my free 40 page LinkedIn guide\n\nhttp://www.johnraphaelmarty.com/\n\nFAQ\u0027s\n\nQ: Can you speak at my Company, University, event or podcast?\nA: I\u0027d love to! I\u0027ve shared my message on the future of employment, breaking into big tech, and my personal story of reinventing myself and discovering my sense of purpose (and how you can too!).\n\n\u2611\ufe0f  YouTube Channel #1 (John Marty) : http://www.youtube.com/c/JohnMarty-uncommon\n\u2611\ufe0f  YouTube Channel #2 (Tech Careers for non-engineers: https://www.youtube.com/channel/UC900gMMPLwRGGXSTW1gdZHA\n\nFUN FACTS:\n\u2611\ufe0f I am an Avid cyclist and runner, and I just started learning to skateboard a half-pipe.\n\u2611\ufe0f Into the Enneagram? - I\u0027m a #3 (The Achiever)\n\nLETS CONNECT:\n\u2611\ufe0f Email: JohnRmarty@gmail.com (don\u0027t forget that \"R\"....The other guy gets my emails all the time)"` |
| country | The user's country of residence depicted by<br>a 2-letter country code (ISO 3166-1 alpha-2). | `"US"` |
| country\_full\_name | The user's country of residence, in English words. | `"United States of America"` |
| city | The city that the user is living at. | `"Seattle"` |
| state | The state that the user is living at. | `"Washington"` |
| experiences | The user's list of historic work experiences. | See [Experience](https://nubela.co/proxycurl/docs#people-api-role-lookup-endpoint-response-experience) object |
| education | The user's list of education background. | See [Education](https://nubela.co/proxycurl/docs#people-api-role-lookup-endpoint-response-education) object |
| languages\_and\_proficiencies | The user's list of languages along with their proficiency<br>level. | See [Language](https://nubela.co/proxycurl/docs#people-api-role-lookup-endpoint-response-language) object |
| accomplishment\_organisations | List of noteworthy organizations that this user is part of. | See [AccomplishmentOrg](https://nubela.co/proxycurl/docs#people-api-role-lookup-endpoint-response-accomplishmentorg) object |
| accomplishment\_publications | List of noteworthy publications that this user has partook in. | See [Publication](https://nubela.co/proxycurl/docs#people-api-role-lookup-endpoint-response-publication) object |
| accomplishment\_honors\_awards | List of noteworthy honours and awards that this user has won. | See [HonourAward](https://nubela.co/proxycurl/docs#people-api-role-lookup-endpoint-response-honouraward) object |
| accomplishment\_patents | List of noteworthy patents won by this user. | See [Patent](https://nubela.co/proxycurl/docs#people-api-role-lookup-endpoint-response-patent) object |
| accomplishment\_courses | List of noteworthy courses partook by this user. | See [Course](https://nubela.co/proxycurl/docs#people-api-role-lookup-endpoint-response-course) object |
| accomplishment\_projects | List of noteworthy projects undertaken by this user. | See [Project](https://nubela.co/proxycurl/docs#people-api-role-lookup-endpoint-response-project) object |
| accomplishment\_test\_scores | List of noteworthy test scores accomplished by this user. | See [TestScore](https://nubela.co/proxycurl/docs#people-api-role-lookup-endpoint-response-testscore) object |
| volunteer\_work | List of historic volunteer work experiences. | See [VolunteeringExperience](https://nubela.co/proxycurl/docs#people-api-role-lookup-endpoint-response-volunteeringexperience) object |
| certifications | List of noteworthy certifications accomplished by this user. | See [Certification](https://nubela.co/proxycurl/docs#people-api-role-lookup-endpoint-response-certification) object |
| connections | Total _count_ of LinkedIn connections. | `500` |
| people\_also\_viewed | A list of other LinkedIn profiles closely related to this user. | See [PeopleAlsoViewed](https://nubela.co/proxycurl/docs#people-api-role-lookup-endpoint-response-peoplealsoviewed) object |
| recommendations | List of recommendations made by other users about this profile. | `["Professional and dedicated approach towards clients and collegues."]` |
| activities | A list of LinkedIn status activities. This field is not guaranteed to be returned. Do not rely on this attribute in production. | See [Activity](https://nubela.co/proxycurl/docs#people-api-role-lookup-endpoint-response-activity) object |
| similarly\_named\_profiles | A list of other LinkedIn profiles with similar names. | See [SimilarProfile](https://nubela.co/proxycurl/docs#people-api-role-lookup-endpoint-response-similarprofile) object |
| articles | A list of content-based articles posted by this user. This field is not guaranteed to be returned. Do not rely on this attribute in production. | See [Article](https://nubela.co/proxycurl/docs#people-api-role-lookup-endpoint-response-article) object |
| groups | A list of LinkedIn groups that this user is a part of.", | See [PersonGroup](https://nubela.co/proxycurl/docs#people-api-role-lookup-endpoint-response-persongroup) object |
| inferred\_salary | A salary range inferred from the user's current job title and company. | See [InferredSalary](https://nubela.co/proxycurl/docs#people-api-role-lookup-endpoint-response-inferredsalary) object |
| gender | Gender of the user. | `"male"` |
| birth\_date | Birth date of the user. | See [Date](https://nubela.co/proxycurl/docs#people-api-role-lookup-endpoint-response-date) object |
| industry | Industry that the user works in. | `"government administration"` |
| extra | A bundle of extra data on this user. | See [PersonExtra](https://nubela.co/proxycurl/docs#people-api-role-lookup-endpoint-response-personextra) object |
| interests | A list of interests that the user has. | `["education", "health", "human rights"]` |
| personal\_emails | A list of personal emails associated with this user. | `["abc@gmail.com", "bcd@gmail.com", "cde@@outlook.com"]` |
| personal\_numbers | A list of personal mobile phone numbers associated with this user. | `["+6512345678", "+6285123450953", "+6502300340"]` |

#### Experience

| Key | Description | Example |
| --- | --- | --- |
| starts\_at |  | `{"day": 1, "month": 8, "year": 2021}` |
| ends\_at |  | `null` |
| company | The company's display name. | `"Freedom Fund Real Estate"` |
| company\_linkedin\_profile\_url | The company's profile URL on Linkedin.<br>If present, could be used with<br>[Company Profile Endpoint](https://nubela.co/proxycurl/docs#company-api-company-profile-endpoint) for more info. | `"https://www.linkedin.com/company/freedomfund"` |
| company\_facebook\_profile\_url | The company's profile URL on Facebook. | `null` |
| title |  | `"Co-Founder"` |
| description |  | `"Our mission is to provide everyday people seeking financial freedom long before the age of 65 with the ability to invest in high yield, short-term real estate investments that were only accessible in the past for a select few wealthy individuals. Each of our single family rehab projects require a minimum investment contribution of only $10K, we have simple terms, no multi-year hold periods, and no fees. With our unique model investors can log into our easy to use website, select the projects that they want to invest in, and get realtime updates on the status of their investments.\n\nWebsite: https://www.freedomfundinvestments.com/home"` |
| location |  | `null` |
| logo\_url | URL of the logo of the organisation. | `"https://media.licdn.com/dms/image/C560BAQEYxazZM_hXgQ/company-logo_100_100/0/1634934418976?e=2147483647\u0026v=beta\u0026t=wI0YdMmxIctkzvnKxRfuAbT8h5eok_DlUqEph68J37s"` |

#### Education

| Key | Description | Example |
| --- | --- | --- |
| starts\_at |  | `{"day": 1, "month": 1, "year": 2013}` |
| ends\_at |  | `{"day": 31, "month": 12, "year": 2015}` |
| field\_of\_study | The field of study that the user majored in. | `"Finance + Economics"` |
| degree\_name | The degree that the user obtained. | `"Master of Business Administration (MBA)"` |
| school | The school that the user attended. | `"University of Colorado Denver"` |
| school\_linkedin\_profile\_url | The school's profile URL on Linkedin.<br>If present, could be used with<br>[School Profile Endpoint](https://nubela.co/proxycurl/docs#school-api-school-profile-endpoint) for more info. | `"https://www.linkedin.com/school/university-of-colorado-denver/"` |
| school\_facebook\_profile\_url | The school's profile URL on Facebook. | `null` |
| description | Description of the education. | `null` |
| logo\_url | URL of the logo of the organisation. | `"https://media.licdn.com/dms/image/C560BAQGVi9eAHgWxFw/company-logo_100_100/0/1673448029676?e=2147483647\u0026v=beta\u0026t=NG6ttckXvnS2DX3abTfVACRY2E9Q1EcryNaJLRbE9OE"` |
| grade | The grade that the user obtained. | `null` |
| activities\_and\_societies | The activities and societies that the user participated in. | `null` |

#### Language

| Key | Description | Example |
| --- | --- | --- |
| name | Name of the language. | `"English"` |
| proficiency | Proficiency level of the user in the language.<br>Possible values:<br>\- `ELEMENTARY` (Elementary proficiency)<br>\- `LIMITED_WORKING` (Limited working proficiency)<br>\- `PROFESSIONAL_WORKING` (Professional working proficiency)<br>\- `FULL_PROFESSIONAL` (Full professional proficiency)<br>\- `NATIVE_OR_BILINGUAL` (Native or bilingual proficiency) | `"NATIVE_OR_BILINGUAL"` |

#### AccomplishmentOrg

| Key | Description | Example |
| --- | --- | --- |
| starts\_at |  | `{"day": 1, "month": 1, "year": 2012}` |
| ends\_at |  | `{"day": 1, "month": 8, "year": 2016}` |
| org\_name |  | `"Microsoft"` |
| title |  | `"Software Developer"` |
| description |  | `null` |

#### Publication

| Key | Description | Example |
| --- | --- | --- |
| name | Name of the Publication. | `"Nobel Peace Prize"` |
| publisher | The publishing organisation body. | `"Acme Corp"` |
| published\_on | Date of Publication. | See [Date](https://nubela.co/proxycurl/docs#people-api-role-lookup-endpoint-response-date) object |
| description | Description of the Publication. | `"\n                        Lorem ipsum dolor sit amet, consectetur adipiscing elit\n                    "` |
| url | URL of the Publication. | `"https://example.com"` |

#### Date

| Key | Description | Example |
| --- | --- | --- |
| day |  | `1` |
| month |  | `1` |
| year |  | `2023` |

#### HonourAward

| Key | Description | Example |
| --- | --- | --- |
| title | Title of the honour/award. | `"Nobel Peace Prize"` |
| issuer | The organisation body issuing this honour/award. | `"Acme Corp"` |
| issued\_on | Date that this honour/awared was issued. | See [Date](https://nubela.co/proxycurl/docs#people-api-role-lookup-endpoint-response-date) object |
| description | Description of the honour/award. | `"\n                        Lorem ipsum dolor sit amet, consectetur adipiscing elit\n                    "` |

#### Patent

| Key | Description | Example |
| --- | --- | --- |
| title | Title of the patent. | `"The art of war"` |
| issuer | The organisation body that issued the patent. | `"Acme Corp"` |
| issued\_on | Date of patent issuance. | See [Date](https://nubela.co/proxycurl/docs#people-api-role-lookup-endpoint-response-date) object |
| description | Description of the patent. | `"\n                        Lorem ipsum dolor sit amet, consectetur adipiscing elit\n                    "` |
| application\_number | Numerical representation that identifies the patent. | `"123"` |
| patent\_number | Application number of the patent. | `"123"` |
| url |  | `null` |

#### Course

| Key | Description | Example |
| --- | --- | --- |
| name | Name of the course | `"The course about ABCs"` |
| number | The numerical representation of the course | `"123"` |

#### Project

| Key | Description | Example |
| --- | --- | --- |
| starts\_at |  | `{"day": 1, "month": 3, "year": 2015}` |
| ends\_at |  | `null` |
| title | Name of the project that has been or is currently being worked on. | `"gMessenger"` |
| description | Description of the project. | `"gMessenger was built using Ruby on Rails, and the Bootstrap HTML, CSS, and JavaScript framework. It uses a Websocket-Rails integration to post a user\u0027s message content to the page in real time, with no page refresh required. gMessenger also includes custom authentication with three different permissions levels."` |
| url | A web location related to the project. | `"http://gmessenger.herokuapp.com/"` |

#### TestScore

| Key | Description | Example |
| --- | --- | --- |
| name | Title of the course for which test score was derived from. | `"CS1101S"` |
| score | Test score | `"A"` |
| date\_on | Date of test was assesed. | See [Date](https://nubela.co/proxycurl/docs#people-api-role-lookup-endpoint-response-date) object |
| description | Description of the test score. | `"Nailed it without studying."` |

#### VolunteeringExperience

| Key | Description | Example |
| --- | --- | --- |
| starts\_at |  | `{"day": 1, "month": 1, "year": 2012}` |
| ends\_at |  | `{"day": 1, "month": 8, "year": 2016}` |
| title | Name of volunteer activity. | `"Surveyor"` |
| cause |  | `"To help the world"` |
| company | The company's display name. | `"Microsoft"` |
| company\_linkedin\_profile\_url | The company's profile URL.<br>If present, could be used with<br>[Company Profile Endpoint](https://nubela.co/proxycurl/docs#company-api-company-profile-endpoint) for more info. | `"https://www.linkedin.com/company/microsoft"` |
| description |  | `null` |
| logo\_url | URL of the logo of the organisation. | `null` |

#### Certification

| Key | Description | Example |
| --- | --- | --- |
| starts\_at |  | `null` |
| ends\_at |  | `null` |
| name | Name of the course or program. | `"SAFe Agile Framework Practitioner - ( Scrum, XP, and Lean Practices in the SAFe Enterprise)"` |
| license\_number |  | `null` |
| display\_source |  | `null` |
| authority | The organisation body issuing this certificate. | `"Scaled Agile, Inc."` |
| url |  | `null` |

#### PeopleAlsoViewed

| Key | Description | Example |
| --- | --- | --- |
| link | URL of the profile.<br>Useable with [Person profile endpoint](https://nubela.co/proxycurl/docs#people-api-person-profile-endpoint) | `"https://www.linkedin.com/in/johndoe"` |
| name |  | `"John Doe"` |
| summary |  | `"Software Engineer at Google"` |
| location |  | `"Singapore"` |

#### Activity

| Key | Description | Example |
| --- | --- | --- |
| title |  | `"I am hiring!"` |
| link |  | `"https://www.linkedin.com/feed/update/urn:li:activity:666"` |
| activity\_status |  | `"posted"` |

#### SimilarProfile

| Key | Description | Example |
| --- | --- | --- |
| name |  | `"John Martinez"` |
| link |  | `"https://www.linkedin.com/in/john-martinez-90384a229"` |
| summary |  | `"Owner of Fight or Flight Medical Consultants, LLC  , Owner Marty\u2019s Hardwood Works"` |
| location |  | `"San Antonio, TX"` |

#### Article

| Key | Description | Example |
| --- | --- | --- |
| title |  | `"Manufacturing opportunity"` |
| link |  | `"https://www.linkedin.com/pulse/manufacturing-opportunity-bill-gates/"` |
| published\_date | A [Date](https://nubela.co/proxycurl/docs#people-api-role-lookup-endpoint-response-date) object | See [Date](https://nubela.co/proxycurl/docs#people-api-role-lookup-endpoint-response-date) object |
| author |  | `"Bill Gates"` |
| image\_url |  | `"https://media-exp1.licdn.com/dms/image/C4E12AQFftuPi0UiqWA/article-cover_image-shrink_720_1280/0/1574801149114?e=1640822400\u0026v=beta\u0026t=ZAe3ERmQCM8QHGmRPS2LJ-C76GD5PR7FBHMVL4Z6iVg"` |

#### PersonGroup

| Key | Description | Example |
| --- | --- | --- |
| profile\_pic\_url | The URL to the profile picture of this LinkedIn Group | `"https://media-exp1.licdn.com/dms/image/C4D07AQG9IK9V0pk3mQ/group-logo_image-shrink_92x92/0/1631371531293?e=1642060800\u0026v=beta\u0026t=UK1tfIppWa-Nx7k9whmm5f9XdZoBdJhApf9N3ke3204"` |
| name | Name of LinkedIn group for which this user is in | `"Hadoop Users"` |
| url | URL to the LinkedIn Group | `"https://www.linkedin.com/groups/988957"` |

#### InferredSalary

| Key | Description | Example |
| --- | --- | --- |
| min |  | `35000` |
| max |  | `45000` |

#### PersonExtra

| Key | Description | Example |
| --- | --- | --- |
| github\_profile\_id | This profile's Github account. | `"github-username"` |
| facebook\_profile\_id | This profile's Facebook account. | `"facebook-username"` |
| twitter\_profile\_id | This profile's twitter account. | `"twitter-username"` |
| website | This account's website listed on his profile. | `"https://proxycurl.com"` |

### Response Headers

| Header Key | Description | Example |
| --- | --- | --- |
| `X-Proxycurl-Credit-Cost` | Total cost of credits for this API call | `3` |

# Customer API `EXPERIMENTAL`

## Customer Listing Endpoint `EXPERIMENTAL`

`GET /proxycurl/api/customers`

Cost: `10` credits /
LinkedIn URL for users on an annual subscription or Enterprise plan
.
`100` credits / LinkedIn URL for all other users. For example, `page_size=10` costs `10` × `100` credits for monthly subscribers. It does not consume any credits if no results are returned.

Get a list of probable corporate customers of a target company.

```
curl \
    -G \
    -H "Authorization: Bearer ${YOUR_API_KEY}" \
    'https://nubela.co/proxycurl/api/customers' \
    --data-urlencode 'linkedin_company_profile_url=https://www.linkedin.com/company/watsons' \
    --data-urlencode 'twitter_profile_url=https://x.com/watsonsproperty' \
    --data-urlencode 'page_size=10'

```

```
import requests

api_key = 'YOUR_API_KEY'
headers = {'Authorization': 'Bearer ' + api_key}
api_endpoint = 'https://nubela.co/proxycurl/api/customers'
params = {
    'linkedin_company_profile_url': 'https://www.linkedin.com/company/watsons',
    'twitter_profile_url': 'https://x.com/watsonsproperty',
    'page_size': '10',
}
response = requests.get(api_endpoint,
                        params=params,
                        headers=headers)

```

[![Run in Postman](https://run.pstmn.io/button.svg)](https://pxlcl.co/run-collection)

### URL Parameters

| Parameter | Required | Description | Example |
| --- | --- | --- | --- |
| `linkedin_company_profile_url` | Yes (Include only one of: `linkedin_company_profile_url` or `twitter_profile_url`) | The LinkedIn Profile URL of the company from which you want to get a list of customers of.<br>URL should be in the format of `https://www.linkedin.com/company/<public-identifier>` | `https://www.linkedin.com/company/watsons` |
| `twitter_profile_url` | Yes (Include only one of: `linkedin_company_profile_url` or `twitter_profile_url`) | The Twitter/X Profile URL belonging to the company that you want to get a list of customers of.<br>URL should be in the format of `https://x.com/<public-identifier>` | `https://x.com/watsonsproperty` |
| `page_size` | no | Limit the maximum results of customer companies returned per API call.<br>The default value of this parameter is 10.<br>Accepted values for this parameter is an integer ranging from 0 to 1000. | `10` |

### Response

```
{
    "companies": [\
        {\
            "email": "info@spiresolicitors.co.uk",\
            "linkedin_company_profile_url": "https://www.linkedin.com/company/spire-solicitors-llp",\
            "twitter_profile_url": "https://twitter.com/spirellp"\
        },\
        {\
            "email": null,\
            "linkedin_company_profile_url": "https://www.linkedin.com/company/mall-wood-insurance-services-ltd",\
            "twitter_profile_url": "https://twitter.com/draytonins"\
        }\
    ],
    "next_page": null,
    "update_url": "https://nubela.co/proxycurl/api/customers?linkedin_company_profile_url=https%3A%2F%2Fwww.linkedin.com%2Fcompany%2Fwatsons\u0026after=mall-wood-insurance-services-ltd"
}

```

| Key | Description | Example |
| --- | --- | --- |
| companies | A list of companies that are probable customers. | See [CompanyCustomer](https://nubela.co/proxycurl/docs#customer-api-%60experimental%60-customer-listing-endpoint-%60experimental%60-response-companycustomer) object |
| next\_page | The API URI that will lead to the next page of results. This will be null for the final page. | `null` |
| update\_url | This will lead to the next set of results.<br>Should the company acquire new customers, it will contain the new set of customers.<br>Otherwise, the result set will be empty. | `"https://nubela.co/proxycurl/api/customers?linkedin_company_profile_url=https%3A%2F%2Fwww.linkedin.com%2Fcompany%2Fwatsons\u0026after=mall-wood-insurance-services-ltd"` |

#### CompanyCustomer

| Key | Description | Example |
| --- | --- | --- |
| linkedin\_company\_profile\_url | LinkedIn Company Profile URL of a probable customer | `"https://www.linkedin.com/company/apple"` |
| twitter\_profile\_url | Twitter Profile URL of a probable customer | `"https://twitter.com/apple"` |
| email | General Email address of company (if any) | `"hello@example.com"` |

### Response Headers

| Header Key | Description | Example |
| --- | --- | --- |
| `X-Proxycurl-Credit-Cost` | Total cost of credits for this API call | `10` |

## Customer Listing Count Endpoint `EXPERIMENTAL`

`GET /proxycurl/api/customers/count/`

Cost: `1` credit /
successful request for users on an annual subscription or Enterprise plan
.
`10` credits / successful request for all other users. It does not consume any credits if the `customer_count` result is `0`.

Get the total count of probable corporate customers of a target company.

```
curl \
    -G \
    -H "Authorization: Bearer ${YOUR_API_KEY}" \
    'https://nubela.co/proxycurl/api/customers/count/' \
    --data-urlencode 'linkedin_company_profile_url=https://www.linkedin.com/company/watsons' \
    --data-urlencode 'twitter_profile_url=https://x.com/watsonsproperty'

```

```
import requests

api_key = 'YOUR_API_KEY'
headers = {'Authorization': 'Bearer ' + api_key}
api_endpoint = 'https://nubela.co/proxycurl/api/customers/count/'
params = {
    'linkedin_company_profile_url': 'https://www.linkedin.com/company/watsons',
    'twitter_profile_url': 'https://x.com/watsonsproperty',
}
response = requests.get(api_endpoint,
                        params=params,
                        headers=headers)

```

[![Run in Postman](https://run.pstmn.io/button.svg)](https://pxlcl.co/run-collection)

### URL Parameters

| Parameter | Required | Description | Example |
| --- | --- | --- | --- |
| `linkedin_company_profile_url` | Yes (Include only one of: `linkedin_company_profile_url` or `twitter_profile_url`) | The LinkedIn Profile URL of the company from which you want to get a list of customers of.<br>URL should be in the format of `https://www.linkedin.com/company/<public-identifier>` | `https://www.linkedin.com/company/watsons` |
| `twitter_profile_url` | Yes (Include only one of: `linkedin_company_profile_url` or `twitter_profile_url`) | The Twitter/X Profile URL belonging to the company that you want to get a list of customers of.<br>URL should be in the format of https://x.com/\` | `https://x.com/watsonsproperty` |

### Response

```
{
    "company_count": 125
}

```

| Key | Description | Example |
| --- | --- | --- |
| company\_count | A count of of companies that are probable customers. | `629` |

### Response Headers

| Header Key | Description | Example |
| --- | --- | --- |
| `X-Proxycurl-Credit-Cost` | Total cost of credits for this API call | `1` |

## Follower Listing Endpoint `EXPERIMENTAL`

`GET /proxycurl/api/followers`

Cost: `10` credits /
LinkedIn URL for users on an annual subscription or Enterprise plan
.
`100` credits / LinkedIn URL for all other users. For example, `page_size=10` costs `10` × `100` credits for monthly subscribers. It does not consume any credits if no result is returned.

Get a list of individual followers of a company.

```
curl \
    -G \
    -H "Authorization: Bearer ${YOUR_API_KEY}" \
    'https://nubela.co/proxycurl/api/followers' \
    --data-urlencode 'linkedin_company_profile_url=https://www.linkedin.com/company/henry-schein' \
    --data-urlencode 'twitter_profile_url=https://x.com/henryschein' \
    --data-urlencode 'page_size=10'

```

```
import requests

api_key = 'YOUR_API_KEY'
headers = {'Authorization': 'Bearer ' + api_key}
api_endpoint = 'https://nubela.co/proxycurl/api/followers'
params = {
    'linkedin_company_profile_url': 'https://www.linkedin.com/company/henry-schein',
    'twitter_profile_url': 'https://x.com/henryschein',
    'page_size': '10',
}
response = requests.get(api_endpoint,
                        params=params,
                        headers=headers)

```

[![Run in Postman](https://run.pstmn.io/button.svg)](https://pxlcl.co/run-collection)

### URL Parameters

| Parameter | Required | Description | Example |
| --- | --- | --- | --- |
| `linkedin_company_profile_url` | Yes (Include only one of: `linkedin_company_profile_url` or `twitter_profile_url`) | The LinkedIn Profile URL of the company from which you want to get a list of followers of.<br>URL should be in the format of `https://www.linkedin.com/company/<public-identifier>` | `https://www.linkedin.com/company/henry-schein` |
| `twitter_profile_url` | Yes (Include only one of: `linkedin_company_profile_url` or `twitter_profile_url`) | The Twitter/X Profile URL belonging to the company that you want to get a list of followers of.<br>URL should be in the format of `https://x.com/<public-identifier>` | `https://x.com/henryschein` |
| `page_size` | no | Limit the maximum results of followers returned per API call.<br>The default value of this parameter is 10.<br>Accepted values for this parameter is an integer ranging from 0 to 1000. | `10` |

### Response

```
{
    "followers": [\
        {\
            "email": null,\
            "linkedin_profile_url": "https://www.linkedin.com/in/agiliosoftware",\
            "twitter_profile_url": "https://www.x.com/agilio_software"\
        },\
        {\
            "email": null,\
            "linkedin_profile_url": "https://www.linkedin.com/in/air-techniques",\
            "twitter_profile_url": "https://www.x.com/airtechniques"\
        }\
    ],
    "next_page": null
}

```

| Key | Description | Example |
| --- | --- | --- |
| followers | A list of individual followers of a company. | See [Follower](https://nubela.co/proxycurl/docs#customer-api-%60experimental%60-follower-listing-endpoint-%60experimental%60-response-follower) object |
| next\_page | The API URI that will lead to the next page of results. This will be null for the final page. | `null` |

#### Follower

| Key | Description | Example |
| --- | --- | --- |
| linkedin\_profile\_url |  | `"https://www.linkedin.com/in/agiliosoftware"` |
| twitter\_profile\_url |  | `"https://www.x.com/agilio_software"` |
| email |  | `null` |

### Response Headers

| Header Key | Description | Example |
| --- | --- | --- |
| `X-Proxycurl-Credit-Cost` | Total cost of credits for this API call | `10` |

## Follower Listing Count Endpoint `EXPERIMENTAL`

`GET /proxycurl/api/followers/count`

Cost: `1` credit /
successful request for users on an annual subscription or Enterprise plan
.
`10` credits / successful request for all other users. It does not consume any credits if the `follower_count` result is `0`.

Get the count of followers of a company.

```
curl \
    -G \
    -H "Authorization: Bearer ${YOUR_API_KEY}" \
    'https://nubela.co/proxycurl/api/followers/count' \
    --data-urlencode 'linkedin_company_profile_url=https://www.linkedin.com/company/henry-schein' \
    --data-urlencode 'twitter_profile_url=https://x.com/henryschein'

```

```
import requests

api_key = 'YOUR_API_KEY'
headers = {'Authorization': 'Bearer ' + api_key}
api_endpoint = 'https://nubela.co/proxycurl/api/followers/count'
params = {
    'linkedin_company_profile_url': 'https://www.linkedin.com/company/henry-schein',
    'twitter_profile_url': 'https://x.com/henryschein',
}
response = requests.get(api_endpoint,
                        params=params,
                        headers=headers)

```

[![Run in Postman](https://run.pstmn.io/button.svg)](https://pxlcl.co/run-collection)

### URL Parameters

| Parameter | Required | Description | Example |
| --- | --- | --- | --- |
| `linkedin_company_profile_url` | Yes (Include only one of: `linkedin_company_profile_url` or `twitter_profile_url`) | The LinkedIn Profile URL of the company from which you want to get a list of followers of.<br>URL should be in the format of `https://www.linkedin.com/company/<public-identifier>` | `https://www.linkedin.com/company/henry-schein` |
| `twitter_profile_url` | Yes (Include only one of: `linkedin_company_profile_url` or `twitter_profile_url`) | The Twitter/X Profile URL belonging to the company that you want to get a list of followers of.<br>URL should be in the format of `https://x.com/<public-identifier>` | `https://x.com/henryschein` |

### Response

```
{
    "follower_count": 74
}

```

| Key | Description | Example |
| --- | --- | --- |
| follower\_count | A count of all individuals that are probable customers or followers. | `492` |

### Response Headers

| Header Key | Description | Example |
| --- | --- | --- |
| `X-Proxycurl-Credit-Cost` | Total cost of credits for this API call | `1` |

# Jobs API

## Job Search Endpoint

`GET /proxycurl/api/v2/linkedin/company/job`

Cost: `2` credits / successful request.
Credits are charged even if a successful request returns an empty result.

List jobs posted by a company on LinkedIn

```
curl \
    -G \
    -H "Authorization: Bearer ${YOUR_API_KEY}" \
    'https://nubela.co/proxycurl/api/v2/linkedin/company/job' \
    --data-urlencode 'job_type=anything' \
    --data-urlencode 'experience_level=entry_level' \
    --data-urlencode 'when=past-month' \
    --data-urlencode 'flexibility=remote' \
    --data-urlencode 'geo_id=92000000' \
    --data-urlencode 'keyword=software engineer' \
    --data-urlencode 'search_id=1035'

```

```
import requests

api_key = 'YOUR_API_KEY'
headers = {'Authorization': 'Bearer ' + api_key}
api_endpoint = 'https://nubela.co/proxycurl/api/v2/linkedin/company/job'
params = {
    'job_type': 'anything',
    'experience_level': 'entry_level',
    'when': 'past-month',
    'flexibility': 'remote',
    'geo_id': '92000000',
    'keyword': 'software engineer',
    'search_id': '1035',
}
response = requests.get(api_endpoint,
                        params=params,
                        headers=headers)

```

[![Run in Postman](https://run.pstmn.io/button.svg)](https://pxlcl.co/run-collection)

### URL Parameters

| Parameter | Required | Description | Example |
| --- | --- | --- | --- |
| `job_type` | no | The nature of the job.<br>It accepts the following 7 case-insensitive values only:<br>\- `full-time`<br>\- `part-time`<br>\- `contract`<br>\- `internship`<br>\- `temporary`<br>\- `volunteer`<br>\- `anything` (default) | `anything` |
| `experience_level` | no | The experience level needed for the job.<br>It accepts the following 6 case-insensitive values only:<br>\- `internship`<br>\- `entry_level`<br>\- `associate`<br>\- `mid_senior_level`<br>\- `director`<br>\- `anything` (default) | `entry_level` |
| `when` | no | The time when the job is posted,<br>It accepts the following case-insensitive values only:<br>\- `yesterday`<br>\- `past-week`<br>\- `past-month`<br>\- `anytime` (default) | `past-month` |
| `flexibility` | no | The flexibility of the job.<br>It accepts the following 3 case insensitive values only:<br>\- `remote`<br>\- `on-site`<br>\- `hybrid`<br>\- `anything` (default) | `remote` |
| `geo_id` | no | The `geo_id` of the location to search for.<br>For example, `92000000` is the `geo_id` of world wide.<br>See [this article](https://nubela.co/blog/how-to-fetch-geo_id-parameter-for-the-job-api/?utm_source=blog&utm_medium=web&utm_campaign=docs-redirect-to-geo_id-article) as to how you may be able to match regions to `geo_id` input values. | `92000000` |
| `keyword` | no | The keyword to search for. | `software engineer` |
| `search_id` | no | The `search_id` of the company on LinkedIn.<br>You can get the `search_id` of a LinkedIn company via<br>[Company Profile API](https://nubela.co/proxycurl/docs#company-api-company-profile-endpoint). | `1035` |

### Response

```
{
    "job": [\
        {\
            "company": "Microsoft",\
            "company_url": "https://www.linkedin.com/company/microsoft",\
            "job_title": "Product Management: Intern Opportunities for University Students",\
            "job_url": "https://www.linkedin.com/jobs/view/product-management-intern-opportunities-for-university-students-at-microsoft-3203330682",\
            "list_date": "2022-10-09",\
            "location": "New York, NY"\
        },\
        {\
            "company": "Microsoft",\
            "company_url": "https://www.linkedin.com/company/microsoft",\
            "job_title": "Content Strategist",\
            "job_url": "https://www.linkedin.com/jobs/view/content-strategist-at-microsoft-3257692764",\
            "list_date": "2022-10-21",\
            "location": "United States"\
        }\
    ],
    "next_page_api_url": "http://nubela.co/proxycurl/proxycurl/api/v2/linkedin/company/job?pagination=eyJwYWdlIjogMX0\u0026search_id=1035",
    "next_page_no": 1,
    "previous_page_api_url": null,
    "previous_page_no": null
}

```

| Key | Description | Example |
| --- | --- | --- |
| job | list of [JobListEntry](https://nubela.co/proxycurl/docs#jobs-api-job-search-endpoint-response-joblistentry) | See [JobListEntry](https://nubela.co/proxycurl/docs#jobs-api-job-search-endpoint-response-joblistentry) object |
| next\_page\_no |  | `1` |
| next\_page\_api\_url | The URL to the next page of results. This will be null for the final page. | `"https://nubela.co/proxycurl/api/v2/linkedin/company/job?pagination=eyJwYWdlIjogMX0\u0026search_id=1035"` |
| previous\_page\_no |  | `null` |
| previous\_page\_api\_url | The URL to the previous page of results. This will be null for the first page. | `"https://nubela.co/proxycurl/api/v2/linkedin/company/job?pagination=eyJwYWdlIjogMX0\u0026search_id=1035"` |

#### JobListEntry

| Key | Description | Example |
| --- | --- | --- |
| company | The name of the company that posted this job. | `"Microsoft"` |
| company\_url | The LinkedIn Company Profile URL that posted this job. | `"https://www.linkedin.com/company/microsoft"` |
| job\_title | Job title of the posted job. | `"Product Management: Intern Opportunities for University Students"` |
| job\_url | Job Profile URL. You can fetch details about this job using this URL via the [Job Profile API Endpoint](https://nubela.co/proxycurl/docs#jobs-api-job-profile-endpoint). | `"https://www.linkedin.com/jobs/view/product-management-intern-opportunities-for-university-students-at-microsoft-3203330682"` |
| list\_date | The date that this job was listed. | `"2022-10-09"` |
| location | The job location. | `"New York, NY"` |

### Response Headers

| Header Key | Description | Example |
| --- | --- | --- |
| `X-Proxycurl-Credit-Cost` | Total cost of credits for this API call | `2` |

## Jobs Listing Count Endpoint

`GET /proxycurl/api/v2/linkedin/company/job/count`

Cost: `2` credits / successful request.
Credits are charged even if a successful request returns an empty result.

Count number of jobs posted by a company on LinkedIn

```
curl \
    -G \
    -H "Authorization: Bearer ${YOUR_API_KEY}" \
    'https://nubela.co/proxycurl/api/v2/linkedin/company/job/count' \
    --data-urlencode 'job_type=entry_level' \
    --data-urlencode 'experience_level=entry_level' \
    --data-urlencode 'when=past-month' \
    --data-urlencode 'flexibility=remote' \
    --data-urlencode 'geo_id=92000000' \
    --data-urlencode 'keyword=software engineer' \
    --data-urlencode 'search_id=1035'

```

```
import requests

api_key = 'YOUR_API_KEY'
headers = {'Authorization': 'Bearer ' + api_key}
api_endpoint = 'https://nubela.co/proxycurl/api/v2/linkedin/company/job/count'
params = {
    'job_type': 'entry_level',
    'experience_level': 'entry_level',
    'when': 'past-month',
    'flexibility': 'remote',
    'geo_id': '92000000',
    'keyword': 'software engineer',
    'search_id': '1035',
}
response = requests.get(api_endpoint,
                        params=params,
                        headers=headers)

```

[![Run in Postman](https://run.pstmn.io/button.svg)](https://pxlcl.co/run-collection)

### URL Parameters

| Parameter | Required | Description | Example |
| --- | --- | --- | --- |
| `job_type` | no | The nature of the job.<br>It accepts the following 7 case-insensitive values only:<br>\- `full-time`<br>\- `part-time`<br>\- `contract`<br>\- `internship`<br>\- `temporary`<br>\- `volunteer`<br>\- `anything` (default) | `entry_level` |
| `experience_level` | no | The experience level needed for the job.<br>It accepts the following 6 case-insensitive values only:<br>\- `internship`<br>\- `entry_level`<br>\- `associate`<br>\- `mid_senior_level`<br>\- `director`<br>\- `anything` (default) | `entry_level` |
| `when` | no | The time when the job is posted,<br>It accepts the following case-insensitive values only:<br>\- `yesterday`<br>\- `past-week`<br>\- `past-month`<br>\- `anytime` (default) | `past-month` |
| `flexibility` | no | The flexibility of the job.<br>It accepts the following 3 case insensitive values only:<br>\- `remote`<br>\- `on-site`<br>\- `hybrid`<br>\- `anything` (default) | `remote` |
| `geo_id` | no | The `geo_id` of the location to search for.<br>For example, `92000000` is the `geo_id` of world wide.<br>See [this article](https://nubela.co/blog/how-to-fetch-geo_id-parameter-for-the-job-api/?utm_source=blog&utm_medium=web&utm_campaign=docs-redirect-to-geo_id-article) as to how you may be able to match regions to `geo_id` input values. | `92000000` |
| `keyword` | no | The keyword to search for. | `software engineer` |
| `search_id` | no | The `search_id` of the company on LinkedIn.<br>You can get the `search_id` of a LinkedIn company via<br>[Company Profile API](https://nubela.co/proxycurl/docs#company-api-company-profile-endpoint). | `1035` |

### Response

```
{
    "count": 887622
}

```

| Key | Description | Example |
| --- | --- | --- |
| count |  | `887622` |

### Response Headers

| Header Key | Description | Example |
| --- | --- | --- |
| `X-Proxycurl-Credit-Cost` | Total cost of credits for this API call | `2` |

## Job Profile Endpoint

`GET /proxycurl/api/linkedin/job`

Cost: `2` credits / successful request.
Credits are charged even if a successful request returns an empty result.

Get structured data of a LinkedIn Job Profile

```
curl \
    -G \
    -H "Authorization: Bearer ${YOUR_API_KEY}" \
    'https://nubela.co/proxycurl/api/linkedin/job' \
    --data-urlencode 'url=https://www.linkedin.com/jobs/view/3667167926/'

```

```
import requests

api_key = 'YOUR_API_KEY'
headers = {'Authorization': 'Bearer ' + api_key}
api_endpoint = 'https://nubela.co/proxycurl/api/linkedin/job'
params = {
    'url': 'https://www.linkedin.com/jobs/view/3667167926/',
}
response = requests.get(api_endpoint,
                        params=params,
                        headers=headers)

```

[![Run in Postman](https://run.pstmn.io/button.svg)](https://pxlcl.co/run-collection)

### URL Parameters

| Parameter | Required | Description | Example |
| --- | --- | --- | --- |
| `url` | yes | URL of the LinkedIn Job Profile to target.<br>URL should be in the format of<br>`https://www.linkedin.com/jobs/view/<job_id>`.<br>[Jobs Listing Endpoint](https://nubela.co/proxycurl/docs#jobs-api-jobs-listing-endpoint)<br>can be used to retrieve a job URL. | `https://www.linkedin.com/jobs/view/3667167926/` |

### Response

```
{
    "apply_url": "https://sg.linkedin.com/jobs/view/externalApply/3257696537?url=https%3A%2F%2Fcareers%2Emicrosoft%2Ecom%2Fus%2Fen%2Fjob%2F1451110%2FContent-Strategist%3Fjobsource%3Dlinkedin%26utm_source%3Dlinkedin%26utm_medium%3Dlinkedin%26utm_campaign%3Dlinkedin-feed\u0026urlHash=I9BQ\u0026trk=public_jobs_apply-link-offsite",
    "company": {
        "logo": "https://media.licdn.com/dms/image/C560BAQE88xCsONDULQ/company-logo_100_100/0/1618231291419?e=2147483647\u0026v=beta\u0026t=rffql7GLHsSqWXKbdP2LJMMv7CMTqu7-Ms9d9tophKI",
        "name": "Microsoft",
        "url": "https://www.linkedin.com/company/microsoft"
    },
    "employment_type": "Full-time",
    "industry": [\
        "IT Services and IT Consulting, Computer Hardware Manufacturing, and Software Development"\
    ],
    "job_description": "The Global Demand Center (GDC) within the Cloud Marketing group is leading the marketing transformation of Microsoft\u2019s largest and fastest growing commercial businesses. Our always-on integrated marketing programs work to nurture and acquire new customers across segments, targeting business and technical audiences across our commercial cloud portfolio, with programs available in 42 markets and 30 languages. The GDC team is modernizing and integrating these channels through advanced analytics, marketing automation, and digital marketing. We are on a mission to drive market share, consumption, and consistent double-digit+ revenue growth. Content is the fuel that drives the digitally connected customer journeys at the core of the GDC engine, and we\u2019re looking for a skilled, self-motivated, data-driven content strategist to build the content that motivates customers to take action. The Content Strategist will develop and execute content strategies for the ever-critical security space. You will be accountable for understanding the business priorities, getting close to our target audiences, defining the content journeys that attract, nurture, inspire, and retain customers, and manage quality execution and delivery of the content. You will work closely with your counterparts, the integrated marketing strategists, to drive business outcomes. Your network will include product marketers, integrated marketers, relationship marketers, sales, engineering, and agency partners to develop and execute on your plan. Our team: The Lifecycle Programs team is a fast-paced digital marketing organization. We put a focus on getting things done, simplifying anything and everything, and having fun while doing it. We all believe in connecting with customers at scale, supporting them at each stage of the customer journey, from early awareness and consideration, through onboarding and post purchase engagement. You will be in the middle of it all helping to identify the right content that delivers what customers want\u2014where they want it, when they want it, and how they want it.   \n  \n**_Responsibilities  \n_**\n  * Define content journeys for Security and IT professionals across industries.\n  * Build the resulting content strategies designed to accelerate the customer through the lifecycle.\n  * Create a content plan to address the insights in the customer journey and strategy, ensuring the content is aligned to what the customer needs at each stage.\n  * Deliver the content through our internal Studio or with select agency partners.\n  * Be a customer advocate. Relentlessly champion the customer and the experiences they have with the content you create\u2014how they find it, how they consume it, how they use it to make decisions.\n  * Leverage data and market insights for decision making including content optimization and new concept development.  \n\n\n**_Qualifications  \n  \n_** **Required/Minimum Qualifications  \n**\n  * Bachelor\u0027s Degree in Business, Marketing, Communications, Economics, Public Relations, or related field AND 1+ year(s) integrated marketing (e.g., digital, relationship, social media, campaign), event management, marketing strategy, business planning, marketing operations, or related work experience\n  * OR equivalent experience.  \n\n\n**_Additional Or Preferred Qualifications  \n_**\n  * Bachelor\u0027s Degree in Business, Marketing, Communications, Economics, Public Relations, or related field AND 3+ years integrated marketing (e.g., digital, relationship, social media, campaign), event management, marketing strategy, business planning, marketing operations, or related work experience\n  * OR equivalent experience.\n  * Strong customer centric mindset and demonstrated ability to put the customer first.\n  * Clear and persuasive communication skills, both written and verbal.\n  * Experience with program performance tracking and communications.\n  * Recognized as a self-starter with a bias for action.\n  * Creative problem-solving skills, and a growth mindset approach\n  * Experience managing across highly matrixed organizations, often with competing priorities.\n  * A demonstrated track record of business impact through content\n  * Well-versed in digital marketing best practices, including journey mapping.\n  * Understanding of content disciplines, including SEO, content strategy, and execution.\n  * Preferred, but not required: experience with commercial technology sales process  \n\n\nNarrative   \n  \nIntegrated Marketing IC3 - The typical base pay range for this role across the U.S. is USD $80,900 - $162,200 per year. There is a different range applicable to specific work locations, within the San Francisco Bay area and New York City metropolitan area, and the base pay range for this role in those locations is USD $105,300 - $176,900 per year.   \n  \nMicrosoft has different base pay ranges for different work locations within the United States, which allows us to pay employees competitively and consistently in different geographic markets (see below). The range above reflects the potential base pay across the U.S. for this role (except as noted below); the applicable base pay range will depend on what ultimately is determined to be the candidate\u2019s primary work location. Individual base pay depends on various factors, in addition to primary work location, such as complexity and responsibility of role, job duties/requirements, and relevant experience and skills. Base pay ranges are reviewed and typically updated each year. Offers are made within the base pay range applicable at the time.   \n  \nAt Microsoft certain roles are eligible for additional rewards, including merit increases, annual bonus and stock. These awards are allocated based on individual performance. In addition, certain roles also have the opportunity to earn sales incentives based on revenue or utilization, depending on the terms of the plan and the employee\u2019s role. Benefits/perks listed here may vary depending on the nature of employment with Microsoft and the country work location. U.S.-based employees have access to healthcare benefits, a 401(k) plan and company match, short-term and long-term disability coverage, basic life insurance, wellbeing benefits, paid vacation time, paid sick and mental health time, and several paid holidays, among others.   \n  \nOur commitment to pay equity   \n  \nWe are committed to the principle of pay equity \u2013 paying employees equitably for substantially similar work. To learn more about pay equity and our other commitments to increase representation and strengthen our culture of inclusion, check out our annual Diversity \u0026 Inclusion Report. ( https://www.microsoft.com/en-us/diversity/inside-microsoft/annual-report )   \n  \nUnderstanding roles at Microsoft   \n  \nThe top of this page displays the role for which the base pay ranges apply \u2013 Integrated Marketing IC3. The way we define roles includes two things: discipline (the type of work) and career stage (scope and complexity). The career stage has two parts \u2013 the first identifies whether the role is a manager (M), an individual contributor (IC), an admin-technician-retail (ATR) job, or an intern. The second part identifies the relative seniority of the role \u2013 a higher number (or later letter alphabetically in the case of ATR) indicates greater scope and complexity.   \n  \nMicrosoft is an equal opportunity employer. All qualified applicants will receive consideration for employment without regard to age, ancestry, color, family or medical care leave, gender identity or expression, genetic information, marital status, medical condition, national origin, physical or mental disability, political affiliation, protected veteran status, race, religion, sex (including pregnancy), sexual orientation, or any other characteristic protected by applicable laws, regulations and ordinances. We also consider qualified applicants regardless of criminal histories, consistent with legal requirements. If you need assistance and/or a reasonable accommodation due to a disability during the application or the recruiting process, please send a request via the Accommodation request form.   \n  \nThe salary for this role in the state of Colorado is between $108,200 and $162,200.   \n  \nAt Microsoft, certain roles are eligible for additional rewards, including annual bonus and stock. These awards are allocated based on individual performance. In addition, certain roles also have the opportunity to earn sales incentives based on revenue or utilization, depending on the terms of the plan and the employee\u2019s role. Benefits/perks listed below may vary depending on the nature of your employment with Microsoft and the country where you work. \n",
    "job_functions": [\
        "Marketing"\
    ],
    "linkedin_internal_id": "content-strategist-at-microsoft-3257696537",
    "location": {
        "city": null,
        "country": "United States",
        "latitude": null,
        "longitude": null,
        "postal_code": null,
        "region": "Hawaii",
        "street": null
    },
    "seniority_level": "Mid-Senior level",
    "title": "Content Strategist",
    "total_applicants": 200
}

```

| Key | Description | Example |
| --- | --- | --- |
| linkedin\_internal\_id | The internal ID representation of this job that LinkedIn has for this job. | `"content-strategist-at-microsoft-3257696537"` |
| job\_description | Description of the posted job. | `"The Global Demand Center (GDC) within the Cloud Marketing group is leading the marketing transformation of Microsoft\u2019s largest and fastest growing commercial businesses. Our always-on integrated marketing programs work to nurture and acquire new customers across segments, targeting business and technical audiences across our commercial cloud portfolio, with programs available in 42 markets and 30 languages. The GDC team is modernizing and integrating these channels through advanced analytics, marketing automation, and digital marketing. We are on a mission to drive market share, consumption, and consistent double-digit+ revenue growth. Content is the fuel that drives the digitally connected customer journeys at the core of the GDC engine, and we\u2019re looking for a skilled, self-motivated, data-driven content strategist to build the content that motivates customers to take action. The Content Strategist will develop and execute content strategies for the ever-critical security space. You will be accountable for understanding the business priorities, getting close to our target audiences, defining the content journeys that attract, nurture, inspire, and retain customers, and manage quality execution and delivery of the content. You will work closely with your counterparts, the integrated marketing strategists, to drive business outcomes. Your network will include product marketers, integrated marketers, relationship marketers, sales, engineering, and agency partners to develop and execute on your plan. Our team: The Lifecycle Programs team is a fast-paced digital marketing organization. We put a focus on getting things done, simplifying anything and everything, and having fun while doing it. We all believe in connecting with customers at scale, supporting them at each stage of the customer journey, from early awareness and consideration, through onboarding and post purchase engagement. You will be in the middle of it all helping to identify the right content that delivers what customers want\u2014where they want it, when they want it, and how they want it.   \n  \n**_Responsibilities  \n_**\n  * Define content journeys for Security and IT professionals across industries.\n  * Build the resulting content strategies designed to accelerate the customer through the lifecycle.\n  * Create a content plan to address the insights in the customer journey and strategy, ensuring the content is aligned to what the customer needs at each stage.\n  * Deliver the content through our internal Studio or with select agency partners.\n  * Be a customer advocate. Relentlessly champion the customer and the experiences they have with the content you create\u2014how they find it, how they consume it, how they use it to make decisions.\n  * Leverage data and market insights for decision making including content optimization and new concept development.  \n\n\n**_Qualifications  \n  \n_** **Required/Minimum Qualifications  \n**\n  * Bachelor\u0027s Degree in Business, Marketing, Communications, Economics, Public Relations, or related field AND 1+ year(s) integrated marketing (e.g., digital, relationship, social media, campaign), event management, marketing strategy, business planning, marketing operations, or related work experience\n  * OR equivalent experience.  \n\n\n**_Additional Or Preferred Qualifications  \n_**\n  * Bachelor\u0027s Degree in Business, Marketing, Communications, Economics, Public Relations, or related field AND 3+ years integrated marketing (e.g., digital, relationship, social media, campaign), event management, marketing strategy, business planning, marketing operations, or related work experience\n  * OR equivalent experience.\n  * Strong customer centric mindset and demonstrated ability to put the customer first.\n  * Clear and persuasive communication skills, both written and verbal.\n  * Experience with program performance tracking and communications.\n  * Recognized as a self-starter with a bias for action.\n  * Creative problem-solving skills, and a growth mindset approach\n  * Experience managing across highly matrixed organizations, often with competing priorities.\n  * A demonstrated track record of business impact through content\n  * Well-versed in digital marketing best practices, including journey mapping.\n  * Understanding of content disciplines, including SEO, content strategy, and execution.\n  * Preferred, but not required: experience with commercial technology sales process  \n\n\nNarrative   \n  \nIntegrated Marketing IC3 - The typical base pay range for this role across the U.S. is USD $80,900 - $162,200 per year. There is a different range applicable to specific work locations, within the San Francisco Bay area and New York City metropolitan area, and the base pay range for this role in those locations is USD $105,300 - $176,900 per year.   \n  \nMicrosoft has different base pay ranges for different work locations within the United States, which allows us to pay employees competitively and consistently in different geographic markets (see below). The range above reflects the potential base pay across the U.S. for this role (except as noted below); the applicable base pay range will depend on what ultimately is determined to be the candidate\u2019s primary work location. Individual base pay depends on various factors, in addition to primary work location, such as complexity and responsibility of role, job duties/requirements, and relevant experience and skills. Base pay ranges are reviewed and typically updated each year. Offers are made within the base pay range applicable at the time.   \n  \nAt Microsoft certain roles are eligible for additional rewards, including merit increases, annual bonus and stock. These awards are allocated based on individual performance. In addition, certain roles also have the opportunity to earn sales incentives based on revenue or utilization, depending on the terms of the plan and the employee\u2019s role. Benefits/perks listed here may vary depending on the nature of employment with Microsoft and the country work location. U.S.-based employees have access to healthcare benefits, a 401(k) plan and company match, short-term and long-term disability coverage, basic life insurance, wellbeing benefits, paid vacation time, paid sick and mental health time, and several paid holidays, among others.   \n  \nOur commitment to pay equity   \n  \nWe are committed to the principle of pay equity \u2013 paying employees equitably for substantially similar work. To learn more about pay equity and our other commitments to increase representation and strengthen our culture of inclusion, check out our annual Diversity \u0026 Inclusion Report. ( https://www.microsoft.com/en-us/diversity/inside-microsoft/annual-report )   \n  \nUnderstanding roles at Microsoft   \n  \nThe top of this page displays the role for which the base pay ranges apply \u2013 Integrated Marketing IC3. The way we define roles includes two things: discipline (the type of work) and career stage (scope and complexity). The career stage has two parts \u2013 the first identifies whether the role is a manager (M), an individual contributor (IC), an admin-technician-retail (ATR) job, or an intern. The second part identifies the relative seniority of the role \u2013 a higher number (or later letter alphabetically in the case of ATR) indicates greater scope and complexity.   \n  \nMicrosoft is an equal opportunity employer. All qualified applicants will receive consideration for employment without regard to age, ancestry, color, family or medical care leave, gender identity or expression, genetic information, marital status, medical condition, national origin, physical or mental disability, political affiliation, protected veteran status, race, religion, sex (including pregnancy), sexual orientation, or any other characteristic protected by applicable laws, regulations and ordinances. We also consider qualified applicants regardless of criminal histories, consistent with legal requirements. If you need assistance and/or a reasonable accommodation due to a disability during the application or the recruiting process, please send a request via the Accommodation request form.   \n  \nThe salary for this role in the state of Colorado is between $108,200 and $162,200.   \n  \nAt Microsoft, certain roles are eligible for additional rewards, including annual bonus and stock. These awards are allocated based on individual performance. In addition, certain roles also have the opportunity to earn sales incentives based on revenue or utilization, depending on the terms of the plan and the employee\u2019s role. Benefits/perks listed below may vary depending on the nature of your employment with Microsoft and the country where you work. \n"` |
| apply\_url | The URL to apply for this job. | `"https://sg.linkedin.com/jobs/view/externalApply/3257696537?url=https%3A%2F%2Fcareers%2Emicrosoft%2Ecom%2Fus%2Fen%2Fjob%2F1451110%2FContent-Strategist%3Fjobsource%3Dlinkedin%26utm_source%3Dlinkedin%26utm_medium%3Dlinkedin%26utm_campaign%3Dlinkedin-feed\u0026urlHash=I9BQ\u0026trk=public_jobs_apply-link-offsite"` |
| title | Title of the posted job. | `"Content Strategist"` |
| location | A [JobLocation](https://nubela.co/proxycurl/docs#jobs-api-job-profile-endpoint-response-joblocation) object | See [JobLocation](https://nubela.co/proxycurl/docs#jobs-api-job-profile-endpoint-response-joblocation) object |
| company | A [JobCompany](https://nubela.co/proxycurl/docs#jobs-api-job-profile-endpoint-response-jobcompany) object | See [JobCompany](https://nubela.co/proxycurl/docs#jobs-api-job-profile-endpoint-response-jobcompany) object |
| seniority\_level | The seniority level for this role. | `"Mid-Senior level"` |
| industry | A list of industries that the company which posted this job lies in. | `["IT Services and IT Consulting, Computer Hardware Manufacturing, and Software Development"]` |
| employment\_type | Type of employment. | `"Full-time"` |
| job\_functions | A list of job functions that this role is expected to cover. | `["Marketing"]` |
| total\_applicants | Total applicants for this job so far. | `200` |

#### JobLocation

| Key | Description | Example |
| --- | --- | --- |
| country | Full country name. | `"United States"` |
| region | Region. | `"Hawaii"` |
| city | The city for the job. | `null` |
| postal\_code | Postal code of the business location for the job. | `null` |
| latitude | Latitude coordinates of the business location for the job. | `null` |
| longitude | Longitude coordinates of the business location for the job. | `null` |
| street | Street address of the business location for the job. | `null` |

#### JobCompany

| Key | Description | Example |
| --- | --- | --- |
| name | The name of the company. | `"Microsoft"` |
| url | The LinkedIn Company Profile URL of the job posting company. | `"https://www.linkedin.com/company/microsoft"` |
| logo | The URL to the logo of this company. | `"https://media.licdn.com/dms/image/C560BAQE88xCsONDULQ/company-logo_100_100/0/1618231291419?e=2147483647\u0026v=beta\u0026t=rffql7GLHsSqWXKbdP2LJMMv7CMTqu7-Ms9d9tophKI"` |

### Response Headers

| Header Key | Description | Example |
| --- | --- | --- |
| `X-Proxycurl-Credit-Cost` | Total cost of credits for this API call | `2` |

# Contact API

## Reverse Email Lookup Endpoint

`GET /proxycurl/api/linkedin/profile/resolve/email`

Cost: `3` credits / successful request.
Credits are charged even if a successful request returns an empty result unless `lookup_depth=superficial`.

Resolve social media profiles correlated from an email address.
This API endpoint works with both personal and work emails.

```
curl \
    -G \
    -H "Authorization: Bearer ${YOUR_API_KEY}" \
    'https://nubela.co/proxycurl/api/linkedin/profile/resolve/email' \
    --data-urlencode 'email=danial@nubela.co' \
    --data-urlencode 'lookup_depth=deep' \
    --data-urlencode 'enrich_profile=enrich'

```

```
import requests

api_key = 'YOUR_API_KEY'
headers = {'Authorization': 'Bearer ' + api_key}
api_endpoint = 'https://nubela.co/proxycurl/api/linkedin/profile/resolve/email'
params = {
    'email': 'danial@nubela.co',
    'lookup_depth': 'deep',
    'enrich_profile': 'enrich',
}
response = requests.get(api_endpoint,
                        params=params,
                        headers=headers)

```

[![Run in Postman](https://run.pstmn.io/button.svg)](https://pxlcl.co/run-collection)

### URL Parameters

| Parameter | Required | Description | Example |
| --- | --- | --- | --- |
| `email` | yes | Email address of the user you want to look up. | `danial@nubela.co` |
| `lookup_depth` | yes | This parameter describes the depth options for our API lookup function. This endpoint can execute either a superficial or a deep lookup.<br>A **superficial lookup** involves comparing the provided email with entries in our database. This approach tends to yield fewer results and is typically less effective for work-related email addresses. However, it does not consume any credits if no results are returned.<br>On the other hand, a **deep lookup** extends beyond our database to utilize advanced heuristics and identify the individual associated with a given email. This method is particularly recommended for work emails.<br>Please note the following valid values for the depth of the lookup:<br>\\* `superficial`: No credits are consumed if no results are found.<br>\\* `deep` (default): Credits are used regardless of whether any results are returned. | `deep` |
| `enrich_profile` | no | Enrich the result with a cached LinkedIn profile of the LinkedIn Profile URL result (if any).<br>Valid values are:<br>\\* `skip` (default): do not enrich the results with cached profile data.<br>\\* `enrich`: enriches the result with cached profile data. <br>Calling this API endpoint with this parameter would add `1` additional credit.<br>If you require [fresh profile data](https://nubela.co/blog/how-fresh-are-profiles-returned-by-proxycurl-api/), please chain this API call with the `linkedin_profile_url` result with the [Person Profile Endpoint](https://nubela.co/proxycurl/docs#people-api-person-profile-endpoint) with the `use_cache=if-recent` parameter. | `enrich` |

### Response

```
{
    "last_updated": "2023-10-26T11:34:30Z",
    "profile": {
        "accomplishment_courses": [],
        "accomplishment_honors_awards": [],
        "accomplishment_organisations": [],
        "accomplishment_patents": [],
        "accomplishment_projects": [\
            {\
                "description": "gMessenger was built using Ruby on Rails, and the Bootstrap HTML, CSS, and JavaScript framework. It uses a Websocket-Rails integration to post a user\u0027s message content to the page in real time, with no page refresh required. gMessenger also includes custom authentication with three different permissions levels.",\
                "ends_at": null,\
                "starts_at": {\
                    "day": 1,\
                    "month": 3,\
                    "year": 2015\
                },\
                "title": "gMessenger",\
                "url": "http://gmessenger.herokuapp.com/"\
            },\
            {\
                "description": "A task and project management responsive web app utilizing Ruby on Rails - CSS and HTML",\
                "ends_at": null,\
                "starts_at": {\
                    "day": 1,\
                    "month": 1,\
                    "year": 2015\
                },\
                "title": "Taskly",\
                "url": "https://hidden-coast-7204.herokuapp.com/"\
            }\
        ],
        "accomplishment_publications": [],
        "accomplishment_test_scores": [],
        "activities": [\
            {\
                "activity_status": "Shared by John Marty",\
                "link": "https://www.linkedin.com/posts/johnrmarty_financialfreedom-realestate-technology-activity-6940294635743301632-rsLo",\
                "title": "Yesterday I toured a $1.2M property in California that has a large 13K sq ft lot with two homes on it. After 5 minutes of being on-site I\u2026"\
            }\
        ],
        "articles": [],
        "background_cover_image_url": "https://media.licdn.com/dms/image/C5616AQH9tkBTUhHfng/profile-displaybackgroundimage-shrink_200_800/0/1614530499015?e=2147483647\u0026v=beta\u0026t=VEoCyedtZulnAVYWT9BXfKHi5OFp8avElNjiz8kjSTU",
        "certifications": [\
            {\
                "authority": "Scaled Agile, Inc.",\
                "display_source": null,\
                "ends_at": null,\
                "license_number": null,\
                "name": "SAFe Agile Framework Practitioner - ( Scrum, XP, and Lean Practices in the SAFe Enterprise)",\
                "starts_at": null,\
                "url": null\
            },\
            {\
                "authority": "Scrum Alliance",\
                "display_source": null,\
                "ends_at": null,\
                "license_number": null,\
                "name": "SCRUM Alliance Certified Product Owner",\
                "starts_at": null,\
                "url": null\
            }\
        ],
        "city": "Seattle",
        "connections": 500,
        "country": "US",
        "country_full_name": "United States of America",
        "education": [\
            {\
                "activities_and_societies": null,\
                "degree_name": "Master of Business Administration (MBA)",\
                "description": null,\
                "ends_at": {\
                    "day": 31,\
                    "month": 12,\
                    "year": 2015\
                },\
                "field_of_study": "Finance + Economics",\
                "grade": null,\
                "logo_url": "https://media.licdn.com/dms/image/C560BAQGVi9eAHgWxFw/company-logo_100_100/0/1673448029676?e=2147483647\u0026v=beta\u0026t=NG6ttckXvnS2DX3abTfVACRY2E9Q1EcryNaJLRbE9OE",\
                "school": "University of Colorado Denver",\
                "school_facebook_profile_url": null,\
                "school_linkedin_profile_url": "https://www.linkedin.com/school/university-of-colorado-denver/",\
                "starts_at": {\
                    "day": 1,\
                    "month": 1,\
                    "year": 2013\
                }\
            },\
            {\
                "activities_and_societies": null,\
                "degree_name": null,\
                "description": "rails, ruby, rspec, capybara, bootstrap, css, html, api integration, Jquery, Javascript",\
                "ends_at": {\
                    "day": 31,\
                    "month": 12,\
                    "year": 2015\
                },\
                "field_of_study": "School of Software Development",\
                "grade": null,\
                "logo_url": "https://media.licdn.com/dms/image/C560BAQFKNxOZ4X0g8Q/company-logo_100_100/0/1670610916338?e=2147483647\u0026v=beta\u0026t=t7ImfhmsuIJ7HJGHEbPJ2suxdslKhzp9v-5h9_G4sWE",\
                "school": "Galvanize Inc",\
                "school_facebook_profile_url": null,\
                "school_linkedin_profile_url": "https://www.linkedin.com/school/galvanize-it/",\
                "starts_at": {\
                    "day": 1,\
                    "month": 1,\
                    "year": 2015\
                }\
            }\
        ],
        "experiences": [\
            {\
                "company": "Freedom Fund Real Estate",\
                "company_facebook_profile_url": null,\
                "company_linkedin_profile_url": "https://www.linkedin.com/company/freedomfund",\
                "description": "Our mission is to provide everyday people seeking financial freedom long before the age of 65 with the ability to invest in high yield, short-term real estate investments that were only accessible in the past for a select few wealthy individuals. Each of our single family rehab projects require a minimum investment contribution of only $10K, we have simple terms, no multi-year hold periods, and no fees. With our unique model investors can log into our easy to use website, select the projects that they want to invest in, and get realtime updates on the status of their investments.\n\nWebsite: https://www.freedomfundinvestments.com/home",\
                "ends_at": null,\
                "location": null,\
                "logo_url": "https://media.licdn.com/dms/image/C560BAQEYxazZM_hXgQ/company-logo_100_100/0/1634934418976?e=2147483647\u0026v=beta\u0026t=wI0YdMmxIctkzvnKxRfuAbT8h5eok_DlUqEph68J37s",\
                "starts_at": {\
                    "day": 1,\
                    "month": 8,\
                    "year": 2021\
                },\
                "title": "Co-Founder"\
            },\
            {\
                "company": "Mindset Reset Podcast",\
                "company_facebook_profile_url": null,\
                "company_linkedin_profile_url": "https://www.linkedin.com/company/mindset-reset-podcast",\
                "description": "We dive into the mindsets of the world\u2019s foremost thought leaders and turn them into actionable insights so that others can discover greater happiness, success, and fulfillment.\n\nhttps://podcasts.apple.com/us/podcast/mindset-reset/id1553212607",\
                "ends_at": null,\
                "location": "Denver, Colorado, United States",\
                "logo_url": "https://media.licdn.com/dms/image/C560BAQF9QJVQm3SOvA/company-logo_100_100/0/1614527476576?e=2147483647\u0026v=beta\u0026t=m3tx83nMN-E3XQFoJG0Wmch8U4qKnJ9i--5NSAfffC0",\
                "starts_at": {\
                    "day": 1,\
                    "month": 1,\
                    "year": 2021\
                },\
                "title": "Founder"\
            }\
        ],
        "first_name": "John",
        "follower_count": null,
        "full_name": "John Marty",
        "groups": [],
        "headline": "Financial Freedom through Real Estate - LinkedIn Top Voice",
        "languages": [\
            "English",\
            "Spanish"\
        ],
        "last_name": "Marty",
        "occupation": "Co-Founder at Freedom Fund Real Estate",
        "people_also_viewed": [],
        "profile_pic_url": "https://media.licdn.com/dms/image/C5603AQHaJSx0CBAUIA/profile-displayphoto-shrink_800_800/0/1558325759208?e=2147483647\u0026v=beta\u0026t=BluXpPg88xFnU2wMGLjuCUykSk_wKNdh8x3PI9wm6MI",
        "public_identifier": "johnrmarty",
        "recommendations": [\
            "Rebecca Canfield\n\n      \n          \n          \n\n\n\n              \n                \n        \n              \n  \n\n      \n          John Marty is a genius at his craft. He is skilled in the art of making people feel empowered to seek out roles that they are qualified for, ask for salaries that they deserve, and creates a kind of pay it forward lifestyle. John helps you to get to places that you only thought were possible for other people. Anyone that is fortunate enough to learn from John should consider themselves extremely lucky. I know I do. ",\
            "Zoe Sanoff\n\n      \n          \n          \n\n\n\n              \n                \n        \n              \n  \n\n      \n          John is so focused on helping guide you through an interview process not just for Amazon but on interviewing in general.  I\u0027ve generally done well at interviewing, my skills are top notch now.  John is so focused on on his clients and really goes above and beyond.  John is genuine, knowledgeable, well spoken and non-judgemental.  He is so encouraging, so positive and really easy to talk to.  Thank you John!"\
        ],
        "similarly_named_profiles": [\
            {\
                "link": "https://www.linkedin.com/in/john-martinez-90384a229",\
                "location": "San Antonio, TX",\
                "name": "John Martinez",\
                "summary": "Owner of Fight or Flight Medical Consultants, LLC  , Owner Marty\u2019s Hardwood Works"\
            },\
            {\
                "link": "https://www.linkedin.com/in/senatormarty",\
                "location": "St Paul, MN",\
                "name": "John Marty",\
                "summary": null\
            }\
        ],
        "state": "Washington",
        "summary": "Most people go through life lost, disengaged, and unhappy at work and in their lives - I\u0027m on a mission to solve that.\n\nI spent 10 years as the founder of Axxis Audio, an electronics company that grew to multi-million dollar sales, which I sold in 2012. At that time, I funneled my earnings into the creation of an Internet of Things company, but numerous factors lead to its demise after 2 hard fought years. \n\nAt 31, I was penny-less, had a baby on the way, and had zero job prospects (despite applying to 150 companies). My desperate situation led me to take a job at Best Buy for $12 an hour while reinventing myself through the completion of an MBA at the University of Colorado, and a 6-month software development boot camp. \n\nAfter graduation, I landed at American Express as a Senior Product Manager and then got poached by Amazon in 2017 (because of my LinkedIn profile). My journey has led to a deep sense of perspective, humility, and purpose that I draw on to help others find clarity, meaning, and happiness in their careers and lives. \n\nCheck out my website for details on my Mindset Reset Podcast, Public Speaking, Consulting, or my free 40 page LinkedIn guide\n\nhttp://www.johnraphaelmarty.com/\n\nFAQ\u0027s\n\nQ: Can you speak at my Company, University, event or podcast?\nA: I\u0027d love to! I\u0027ve shared my message on the future of employment, breaking into big tech, and my personal story of reinventing myself and discovering my sense of purpose (and how you can too!).\n\n\u2611\ufe0f  YouTube Channel #1 (John Marty) : http://www.youtube.com/c/JohnMarty-uncommon\n\u2611\ufe0f  YouTube Channel #2 (Tech Careers for non-engineers: https://www.youtube.com/channel/UC900gMMPLwRGGXSTW1gdZHA\n\nFUN FACTS:\n\u2611\ufe0f I am an Avid cyclist and runner, and I just started learning to skateboard a half-pipe.\n\u2611\ufe0f Into the Enneagram? - I\u0027m a #3 (The Achiever)\n\nLETS CONNECT:\n\u2611\ufe0f Email: JohnRmarty@gmail.com (don\u0027t forget that \"R\"....The other guy gets my emails all the time)",
        "volunteer_work": []
    }
}

```

| Key | Description | Example |
| --- | --- | --- |
| linkedin\_profile\_url | Returns the closest match of the LinkedIn profile that belongs to this email address. | `"https://www.linkedin.com/in/senatormarty"` |
| twitter\_profile\_url | Returns the Twitter Profile URL that belongs to this email address. | `"https://www.twitter.com/proxycurl"` |
| facebook\_profile\_url | Returns the Facebook Profile URL that belongs to this email address. | `"https://www.facebook.com/zuck"` |
| similarity\_score | This metric quantifies the degree of resemblance between the queried profile and the retrieved one. Scores range from `0` (no similarity) to `1` (high similarity). In the event that our dataset lacks a pertinent profile for comparison, the assigned score might be `null`. | `0.82` |
| profile | A [PersonEndpointResponse](https://nubela.co/proxycurl/docs#contact-api-reverse-email-lookup-endpoint-response-personendpointresponse) object | See [PersonEndpointResponse](https://nubela.co/proxycurl/docs#contact-api-reverse-email-lookup-endpoint-response-personendpointresponse) object |
| last\_updated | ISO 8601 timestamp since the enriched profile was last scraped. | `"2023-10-26T11:34:30Z"` |

#### PersonEndpointResponse

| Key | Description | Example |
| --- | --- | --- |
| public\_identifier | The vanity identifier of the LinkedIn profile.<br>The vanity identifier comes after the `/in/` part of the LinkedIn Profile URL<br>in the following format: `https://www.linkedin.com/in/<_identifier>` | `"johnrmarty"` |
| profile\_pic\_url | A temporary link to the user's profile picture that is valid for 30 minutes.<br>The temporal nature of the link is by design to prevent having Proxycurl be the mirror for the images.<br>The developer is expected to handle these images by downloading the image and re-hosting the image.<br>See [this post](https://nubela.co/blog/why-is-the-api-returning-s3-links-for-profile-pictures-scraped-from-linkedin-profiles/) for context.<br>Some profile pictures might be of the standard LinkedIn's profile picture placeholder. It is so because. See [this post](https://nubela.co/blog/why-do-most-linkedin-profiles-fetched-via-the-person-profile-endpoint-return-a-placeholder-profile-picture/) for context. | `"https://media.licdn.com/dms/image/C5603AQHaJSx0CBAUIA/profile-displayphoto-shrink_800_800/0/1558325759208?e=2147483647\u0026v=beta\u0026t=BluXpPg88xFnU2wMGLjuCUykSk_wKNdh8x3PI9wm6MI"` |
| background\_cover\_image\_url | A temporary link to the user's background cover picture<br>that is valid for 30 minutes.<br>The temporal nature of the link is by design to prevent<br>having Proxycurl be the mirror for the images.<br>The developer is expected to handle these images<br>by downloading the image and re-hosting the image.<br>See [this post](https://nubela.co/blog/why-is-the-api-returning-s3-links-for-profile-pictures-scraped-from-linkedin-profiles/) for context. | `"https://media.licdn.com/dms/image/C5616AQH9tkBTUhHfng/profile-displaybackgroundimage-shrink_200_800/0/1614530499015?e=2147483647\u0026v=beta\u0026t=VEoCyedtZulnAVYWT9BXfKHi5OFp8avElNjiz8kjSTU"` |
| first\_name | First name of the user. | `"John"` |
| last\_name | Last name of the user. | `"Marty"` |
| full\_name | Full name of the user ( `first_name` \+ `last_name`) | `"John Marty"` |
| follower\_count | Follower count for this profile | `null` |
| occupation | The title and company name of the user's current employment. | `"Co-Founder at Freedom Fund Real Estate"` |
| headline | The tagline written by the user for his profile. | `"Financial Freedom through Real Estate - LinkedIn Top Voice"` |
| summary | A blurb (longer than the tagline) written by the user for his profile. | `"Most people go through life lost, disengaged, and unhappy at work and in their lives - I\u0027m on a mission to solve that.\n\nI spent 10 years as the founder of Axxis Audio, an electronics company that grew to multi-million dollar sales, which I sold in 2012. At that time, I funneled my earnings into the creation of an Internet of Things company, but numerous factors lead to its demise after 2 hard fought years. \n\nAt 31, I was penny-less, had a baby on the way, and had zero job prospects (despite applying to 150 companies). My desperate situation led me to take a job at Best Buy for $12 an hour while reinventing myself through the completion of an MBA at the University of Colorado, and a 6-month software development boot camp. \n\nAfter graduation, I landed at American Express as a Senior Product Manager and then got poached by Amazon in 2017 (because of my LinkedIn profile). My journey has led to a deep sense of perspective, humility, and purpose that I draw on to help others find clarity, meaning, and happiness in their careers and lives. \n\nCheck out my website for details on my Mindset Reset Podcast, Public Speaking, Consulting, or my free 40 page LinkedIn guide\n\nhttp://www.johnraphaelmarty.com/\n\nFAQ\u0027s\n\nQ: Can you speak at my Company, University, event or podcast?\nA: I\u0027d love to! I\u0027ve shared my message on the future of employment, breaking into big tech, and my personal story of reinventing myself and discovering my sense of purpose (and how you can too!).\n\n\u2611\ufe0f  YouTube Channel #1 (John Marty) : http://www.youtube.com/c/JohnMarty-uncommon\n\u2611\ufe0f  YouTube Channel #2 (Tech Careers for non-engineers: https://www.youtube.com/channel/UC900gMMPLwRGGXSTW1gdZHA\n\nFUN FACTS:\n\u2611\ufe0f I am an Avid cyclist and runner, and I just started learning to skateboard a half-pipe.\n\u2611\ufe0f Into the Enneagram? - I\u0027m a #3 (The Achiever)\n\nLETS CONNECT:\n\u2611\ufe0f Email: JohnRmarty@gmail.com (don\u0027t forget that \"R\"....The other guy gets my emails all the time)"` |
| country | The user's country of residence depicted by<br>a 2-letter country code (ISO 3166-1 alpha-2). | `"US"` |
| country\_full\_name | The user's country of residence, in English words. | `"United States of America"` |
| city | The city that the user is living at. | `"Seattle"` |
| state | The state that the user is living at. | `"Washington"` |
| experiences | The user's list of historic work experiences. | See [Experience](https://nubela.co/proxycurl/docs#contact-api-reverse-email-lookup-endpoint-response-experience) object |
| education | The user's list of education background. | See [Education](https://nubela.co/proxycurl/docs#contact-api-reverse-email-lookup-endpoint-response-education) object |
| languages\_and\_proficiencies | The user's list of languages along with their proficiency<br>level. | See [Language](https://nubela.co/proxycurl/docs#contact-api-reverse-email-lookup-endpoint-response-language) object |
| accomplishment\_organisations | List of noteworthy organizations that this user is part of. | See [AccomplishmentOrg](https://nubela.co/proxycurl/docs#contact-api-reverse-email-lookup-endpoint-response-accomplishmentorg) object |
| accomplishment\_publications | List of noteworthy publications that this user has partook in. | See [Publication](https://nubela.co/proxycurl/docs#contact-api-reverse-email-lookup-endpoint-response-publication) object |
| accomplishment\_honors\_awards | List of noteworthy honours and awards that this user has won. | See [HonourAward](https://nubela.co/proxycurl/docs#contact-api-reverse-email-lookup-endpoint-response-honouraward) object |
| accomplishment\_patents | List of noteworthy patents won by this user. | See [Patent](https://nubela.co/proxycurl/docs#contact-api-reverse-email-lookup-endpoint-response-patent) object |
| accomplishment\_courses | List of noteworthy courses partook by this user. | See [Course](https://nubela.co/proxycurl/docs#contact-api-reverse-email-lookup-endpoint-response-course) object |
| accomplishment\_projects | List of noteworthy projects undertaken by this user. | See [Project](https://nubela.co/proxycurl/docs#contact-api-reverse-email-lookup-endpoint-response-project) object |
| accomplishment\_test\_scores | List of noteworthy test scores accomplished by this user. | See [TestScore](https://nubela.co/proxycurl/docs#contact-api-reverse-email-lookup-endpoint-response-testscore) object |
| volunteer\_work | List of historic volunteer work experiences. | See [VolunteeringExperience](https://nubela.co/proxycurl/docs#contact-api-reverse-email-lookup-endpoint-response-volunteeringexperience) object |
| certifications | List of noteworthy certifications accomplished by this user. | See [Certification](https://nubela.co/proxycurl/docs#contact-api-reverse-email-lookup-endpoint-response-certification) object |
| connections | Total _count_ of LinkedIn connections. | `500` |
| people\_also\_viewed | A list of other LinkedIn profiles closely related to this user. | See [PeopleAlsoViewed](https://nubela.co/proxycurl/docs#contact-api-reverse-email-lookup-endpoint-response-peoplealsoviewed) object |
| recommendations | List of recommendations made by other users about this profile. | `["Professional and dedicated approach towards clients and collegues."]` |
| activities | A list of LinkedIn status activities. This field is not guaranteed to be returned. Do not rely on this attribute in production. | See [Activity](https://nubela.co/proxycurl/docs#contact-api-reverse-email-lookup-endpoint-response-activity) object |
| similarly\_named\_profiles | A list of other LinkedIn profiles with similar names. | See [SimilarProfile](https://nubela.co/proxycurl/docs#contact-api-reverse-email-lookup-endpoint-response-similarprofile) object |
| articles | A list of content-based articles posted by this user. This field is not guaranteed to be returned. Do not rely on this attribute in production. | See [Article](https://nubela.co/proxycurl/docs#contact-api-reverse-email-lookup-endpoint-response-article) object |
| groups | A list of LinkedIn groups that this user is a part of.", | See [PersonGroup](https://nubela.co/proxycurl/docs#contact-api-reverse-email-lookup-endpoint-response-persongroup) object |
| inferred\_salary | A salary range inferred from the user's current job title and company. | See [InferredSalary](https://nubela.co/proxycurl/docs#contact-api-reverse-email-lookup-endpoint-response-inferredsalary) object |
| gender | Gender of the user. | `"male"` |
| birth\_date | Birth date of the user. | See [Date](https://nubela.co/proxycurl/docs#contact-api-reverse-email-lookup-endpoint-response-date) object |
| industry | Industry that the user works in. | `"government administration"` |
| extra | A bundle of extra data on this user. | See [PersonExtra](https://nubela.co/proxycurl/docs#contact-api-reverse-email-lookup-endpoint-response-personextra) object |
| interests | A list of interests that the user has. | `["education", "health", "human rights"]` |
| personal\_emails | A list of personal emails associated with this user. | `["abc@gmail.com", "bcd@gmail.com", "cde@@outlook.com"]` |
| personal\_numbers | A list of personal mobile phone numbers associated with this user. | `["+6512345678", "+6285123450953", "+6502300340"]` |

#### Experience

| Key | Description | Example |
| --- | --- | --- |
| starts\_at |  | `{"day": 1, "month": 8, "year": 2021}` |
| ends\_at |  | `null` |
| company | The company's display name. | `"Freedom Fund Real Estate"` |
| company\_linkedin\_profile\_url | The company's profile URL on Linkedin.<br>If present, could be used with<br>[Company Profile Endpoint](https://nubela.co/proxycurl/docs#company-api-company-profile-endpoint) for more info. | `"https://www.linkedin.com/company/freedomfund"` |
| company\_facebook\_profile\_url | The company's profile URL on Facebook. | `null` |
| title |  | `"Co-Founder"` |
| description |  | `"Our mission is to provide everyday people seeking financial freedom long before the age of 65 with the ability to invest in high yield, short-term real estate investments that were only accessible in the past for a select few wealthy individuals. Each of our single family rehab projects require a minimum investment contribution of only $10K, we have simple terms, no multi-year hold periods, and no fees. With our unique model investors can log into our easy to use website, select the projects that they want to invest in, and get realtime updates on the status of their investments.\n\nWebsite: https://www.freedomfundinvestments.com/home"` |
| location |  | `null` |
| logo\_url | URL of the logo of the organisation. | `"https://media.licdn.com/dms/image/C560BAQEYxazZM_hXgQ/company-logo_100_100/0/1634934418976?e=2147483647\u0026v=beta\u0026t=wI0YdMmxIctkzvnKxRfuAbT8h5eok_DlUqEph68J37s"` |

#### Education

| Key | Description | Example |
| --- | --- | --- |
| starts\_at |  | `{"day": 1, "month": 1, "year": 2013}` |
| ends\_at |  | `{"day": 31, "month": 12, "year": 2015}` |
| field\_of\_study | The field of study that the user majored in. | `"Finance + Economics"` |
| degree\_name | The degree that the user obtained. | `"Master of Business Administration (MBA)"` |
| school | The school that the user attended. | `"University of Colorado Denver"` |
| school\_linkedin\_profile\_url | The school's profile URL on Linkedin.<br>If present, could be used with<br>[School Profile Endpoint](https://nubela.co/proxycurl/docs#school-api-school-profile-endpoint) for more info. | `"https://www.linkedin.com/school/university-of-colorado-denver/"` |
| school\_facebook\_profile\_url | The school's profile URL on Facebook. | `null` |
| description | Description of the education. | `null` |
| logo\_url | URL of the logo of the organisation. | `"https://media.licdn.com/dms/image/C560BAQGVi9eAHgWxFw/company-logo_100_100/0/1673448029676?e=2147483647\u0026v=beta\u0026t=NG6ttckXvnS2DX3abTfVACRY2E9Q1EcryNaJLRbE9OE"` |
| grade | The grade that the user obtained. | `null` |
| activities\_and\_societies | The activities and societies that the user participated in. | `null` |

#### Language

| Key | Description | Example |
| --- | --- | --- |
| name | Name of the language. | `"English"` |
| proficiency | Proficiency level of the user in the language.<br>Possible values:<br>\- `ELEMENTARY` (Elementary proficiency)<br>\- `LIMITED_WORKING` (Limited working proficiency)<br>\- `PROFESSIONAL_WORKING` (Professional working proficiency)<br>\- `FULL_PROFESSIONAL` (Full professional proficiency)<br>\- `NATIVE_OR_BILINGUAL` (Native or bilingual proficiency) | `"NATIVE_OR_BILINGUAL"` |

#### AccomplishmentOrg

| Key | Description | Example |
| --- | --- | --- |
| starts\_at |  | `{"day": 1, "month": 1, "year": 2012}` |
| ends\_at |  | `{"day": 1, "month": 8, "year": 2016}` |
| org\_name |  | `"Microsoft"` |
| title |  | `"Software Developer"` |
| description |  | `null` |

#### Publication

| Key | Description | Example |
| --- | --- | --- |
| name | Name of the Publication. | `"Nobel Peace Prize"` |
| publisher | The publishing organisation body. | `"Acme Corp"` |
| published\_on | Date of Publication. | See [Date](https://nubela.co/proxycurl/docs#contact-api-reverse-email-lookup-endpoint-response-date) object |
| description | Description of the Publication. | `"\n                        Lorem ipsum dolor sit amet, consectetur adipiscing elit\n                    "` |
| url | URL of the Publication. | `"https://example.com"` |

#### Date

| Key | Description | Example |
| --- | --- | --- |
| day |  | `1` |
| month |  | `1` |
| year |  | `2023` |

#### HonourAward

| Key | Description | Example |
| --- | --- | --- |
| title | Title of the honour/award. | `"Nobel Peace Prize"` |
| issuer | The organisation body issuing this honour/award. | `"Acme Corp"` |
| issued\_on | Date that this honour/awared was issued. | See [Date](https://nubela.co/proxycurl/docs#contact-api-reverse-email-lookup-endpoint-response-date) object |
| description | Description of the honour/award. | `"\n                        Lorem ipsum dolor sit amet, consectetur adipiscing elit\n                    "` |

#### Patent

| Key | Description | Example |
| --- | --- | --- |
| title | Title of the patent. | `"The art of war"` |
| issuer | The organisation body that issued the patent. | `"Acme Corp"` |
| issued\_on | Date of patent issuance. | See [Date](https://nubela.co/proxycurl/docs#contact-api-reverse-email-lookup-endpoint-response-date) object |
| description | Description of the patent. | `"\n                        Lorem ipsum dolor sit amet, consectetur adipiscing elit\n                    "` |
| application\_number | Numerical representation that identifies the patent. | `"123"` |
| patent\_number | Application number of the patent. | `"123"` |
| url |  | `null` |

#### Course

| Key | Description | Example |
| --- | --- | --- |
| name | Name of the course | `"The course about ABCs"` |
| number | The numerical representation of the course | `"123"` |

#### Project

| Key | Description | Example |
| --- | --- | --- |
| starts\_at |  | `{"day": 1, "month": 3, "year": 2015}` |
| ends\_at |  | `null` |
| title | Name of the project that has been or is currently being worked on. | `"gMessenger"` |
| description | Description of the project. | `"gMessenger was built using Ruby on Rails, and the Bootstrap HTML, CSS, and JavaScript framework. It uses a Websocket-Rails integration to post a user\u0027s message content to the page in real time, with no page refresh required. gMessenger also includes custom authentication with three different permissions levels."` |
| url | A web location related to the project. | `"http://gmessenger.herokuapp.com/"` |

#### TestScore

| Key | Description | Example |
| --- | --- | --- |
| name | Title of the course for which test score was derived from. | `"CS1101S"` |
| score | Test score | `"A"` |
| date\_on | Date of test was assesed. | See [Date](https://nubela.co/proxycurl/docs#contact-api-reverse-email-lookup-endpoint-response-date) object |
| description | Description of the test score. | `"Nailed it without studying."` |

#### VolunteeringExperience

| Key | Description | Example |
| --- | --- | --- |
| starts\_at |  | `{"day": 1, "month": 1, "year": 2012}` |
| ends\_at |  | `{"day": 1, "month": 8, "year": 2016}` |
| title | Name of volunteer activity. | `"Surveyor"` |
| cause |  | `"To help the world"` |
| company | The company's display name. | `"Microsoft"` |
| company\_linkedin\_profile\_url | The company's profile URL.<br>If present, could be used with<br>[Company Profile Endpoint](https://nubela.co/proxycurl/docs#company-api-company-profile-endpoint) for more info. | `"https://www.linkedin.com/company/microsoft"` |
| description |  | `null` |
| logo\_url | URL of the logo of the organisation. | `null` |

#### Certification

| Key | Description | Example |
| --- | --- | --- |
| starts\_at |  | `null` |
| ends\_at |  | `null` |
| name | Name of the course or program. | `"SAFe Agile Framework Practitioner - ( Scrum, XP, and Lean Practices in the SAFe Enterprise)"` |
| license\_number |  | `null` |
| display\_source |  | `null` |
| authority | The organisation body issuing this certificate. | `"Scaled Agile, Inc."` |
| url |  | `null` |

#### PeopleAlsoViewed

| Key | Description | Example |
| --- | --- | --- |
| link | URL of the profile.<br>Useable with [Person profile endpoint](https://nubela.co/proxycurl/docs#people-api-person-profile-endpoint) | `"https://www.linkedin.com/in/johndoe"` |
| name |  | `"John Doe"` |
| summary |  | `"Software Engineer at Google"` |
| location |  | `"Singapore"` |

#### Activity

| Key | Description | Example |
| --- | --- | --- |
| title |  | `"I am hiring!"` |
| link |  | `"https://www.linkedin.com/feed/update/urn:li:activity:666"` |
| activity\_status |  | `"posted"` |

#### SimilarProfile

| Key | Description | Example |
| --- | --- | --- |
| name |  | `"John Martinez"` |
| link |  | `"https://www.linkedin.com/in/john-martinez-90384a229"` |
| summary |  | `"Owner of Fight or Flight Medical Consultants, LLC  , Owner Marty\u2019s Hardwood Works"` |
| location |  | `"San Antonio, TX"` |

#### Article

| Key | Description | Example |
| --- | --- | --- |
| title |  | `"Manufacturing opportunity"` |
| link |  | `"https://www.linkedin.com/pulse/manufacturing-opportunity-bill-gates/"` |
| published\_date | A [Date](https://nubela.co/proxycurl/docs#contact-api-reverse-email-lookup-endpoint-response-date) object | See [Date](https://nubela.co/proxycurl/docs#contact-api-reverse-email-lookup-endpoint-response-date) object |
| author |  | `"Bill Gates"` |
| image\_url |  | `"https://media-exp1.licdn.com/dms/image/C4E12AQFftuPi0UiqWA/article-cover_image-shrink_720_1280/0/1574801149114?e=1640822400\u0026v=beta\u0026t=ZAe3ERmQCM8QHGmRPS2LJ-C76GD5PR7FBHMVL4Z6iVg"` |

#### PersonGroup

| Key | Description | Example |
| --- | --- | --- |
| profile\_pic\_url | The URL to the profile picture of this LinkedIn Group | `"https://media-exp1.licdn.com/dms/image/C4D07AQG9IK9V0pk3mQ/group-logo_image-shrink_92x92/0/1631371531293?e=1642060800\u0026v=beta\u0026t=UK1tfIppWa-Nx7k9whmm5f9XdZoBdJhApf9N3ke3204"` |
| name | Name of LinkedIn group for which this user is in | `"Hadoop Users"` |
| url | URL to the LinkedIn Group | `"https://www.linkedin.com/groups/988957"` |

#### InferredSalary

| Key | Description | Example |
| --- | --- | --- |
| min |  | `35000` |
| max |  | `45000` |

#### PersonExtra

| Key | Description | Example |
| --- | --- | --- |
| github\_profile\_id | This profile's Github account. | `"github-username"` |
| facebook\_profile\_id | This profile's Facebook account. | `"facebook-username"` |
| twitter\_profile\_id | This profile's twitter account. | `"twitter-username"` |
| website | This account's website listed on his profile. | `"https://proxycurl.com"` |

### Response Headers

| Header Key | Description | Example |
| --- | --- | --- |
| `X-Proxycurl-Credit-Cost` | Total cost of credits for this API call | `3` |

### Remarks

The accuracy of the linkedin profile returned is on a best-effort basis.
Results are not guaranteed to be accurate.
If you have more data points about the user, you are encouraged to use the
[Company Lookup Endpoint](https://nubela.co/proxycurl/docs#company-api-company-lookup-endpoint)
for better outcome.

## Reverse Contact Number Lookup Endpoint

`GET /proxycurl/api/resolve/phone`

Cost: `3` credits / successful request.
Credits will not be charged if no social media profiles are found.

Find social media profiles from a contact phone number.

```
curl \
    -G \
    -H "Authorization: Bearer ${YOUR_API_KEY}" \
    'https://nubela.co/proxycurl/api/resolve/phone' \
    --data-urlencode 'phone_number=+14155552671'

```

```
import requests

api_key = 'YOUR_API_KEY'
headers = {'Authorization': 'Bearer ' + api_key}
api_endpoint = 'https://nubela.co/proxycurl/api/resolve/phone'
params = {
    'phone_number': '+14155552671',
}
response = requests.get(api_endpoint,
                        params=params,
                        headers=headers)

```

[![Run in Postman](https://run.pstmn.io/button.svg)](https://pxlcl.co/run-collection)

### URL Parameters

| Parameter | Required | Description | Example |
| --- | --- | --- | --- |
| `phone_number` | yes | [E.164 formatted](https://www.twilio.com/docs/glossary/what-e164) phone number of the person you want to identify social media profiles of. | `+14155552671` |

### Response

```
{
    "facebook_profile_url": "https://www.facebook.com/zuck",
    "linkedin_profile_url": "https://www.linkedin.com/in/senatormarty",
    "twitter_profile_url": "https://www.twitter.com/proxycurl"
}

```

| Key | Description | Example |
| --- | --- | --- |
| linkedin\_profile\_url | Returns the closest match of the LinkedIn profile that belongs to this phone number. | `"https://www.linkedin.com/in/senatormarty"` |
| twitter\_profile\_url | Returns the Twitter Profile URL that belongs to this phone number. | `"https://www.twitter.com/proxycurl"` |
| facebook\_profile\_url | Returns the Facebook Profile URL that belongs to this phone number. | `"https://www.facebook.com/zuck"` |

### Response Headers

| Header Key | Description | Example |
| --- | --- | --- |
| `X-Proxycurl-Credit-Cost` | Total cost of credits for this API call | `3` |

### Remarks

The accuracy of the linkedin profile returned is on a best-effort basis.
Results are not guaranteed to be accurate.
If you have more data points about the user, you are encouraged to use the
[Personal Contact Number Lookup Endpoint](https://nubela.co/proxycurl/docs#contact-api-personal-contact-number-lookup-endpoint)
for better outcome.

## Work Email Lookup Endpoint

`GET /proxycurl/api/linkedin/profile/email`

Cost: `3` credits / successful request.
Credits will be charged regardless of whether our API finds a work email.

Lookup work email address of a LinkedIn Person Profile.

Email addresses returned are verified to not be role-based or catch-all emails. Email addresses
returned by our API endpoint come with a 95+% deliverability guarantee

**Endpoint behavior**

_This endpoint_ **_may not_** _return results immediately._

If you provided a webhook in your request parameter, our application will call your webhook with
the result once. See `Webhook request` below.

```
curl \
    -G \
    -H "Authorization: Bearer ${YOUR_API_KEY}" \
    'https://nubela.co/proxycurl/api/linkedin/profile/email' \
    --data-urlencode 'linkedin_profile_url=https://sg.linkedin.com/in/williamhgates' \
    --data-urlencode 'callback_url=https://webhook.site/29e12f17-d5a2-400a-9d08-42ee9d83600a'

```

```
import requests

api_key = 'YOUR_API_KEY'
headers = {'Authorization': 'Bearer ' + api_key}
api_endpoint = 'https://nubela.co/proxycurl/api/linkedin/profile/email'
params = {
    'linkedin_profile_url': 'https://sg.linkedin.com/in/williamhgates',
    'callback_url': 'https://webhook.site/29e12f17-d5a2-400a-9d08-42ee9d83600a',
}
response = requests.get(api_endpoint,
                        params=params,
                        headers=headers)

```

[![Run in Postman](https://run.pstmn.io/button.svg)](https://pxlcl.co/run-collection)

### URL Parameters

| Parameter | Required | Description | Example |
| --- | --- | --- | --- |
| `linkedin_profile_url` | yes | Linkedin Profile URL of the person you want to<br>extract work email address from. | `https://sg.linkedin.com/in/williamhgates` |
| `callback_url` | no | Webhook to notify your application when<br>the request has finished processing. | `https://webhook.site/29e12f17-d5a2-400a-9d08-42ee9d83600a` |

### Status codes

| Status codes | Description |
| --- | --- |
| `202` | The result is being processed. The API will send<br>results to you via callback if a callback URL is provided. You can also see the result on your dashboard.<br>The results sent to the callback will have the following format:<br>`{'email': ..., 'status': ...}` |

### Response

```
{
    "email_queue_count": 0
}

```

| Key | Description | Example |
| --- | --- | --- |
| email\_queue\_count | Total queue in the email extraction process | `0` |

### Response Headers

| Header Key | Description | Example |
| --- | --- | --- |
| `X-Proxycurl-Credit-Cost` | Total cost of credits for this API call | `3` |

### Webhook request

We will make a `POST` request to your webhook, if one is provided under
`callback_url` parameter in the initial request. The request will contain the
following form data:

| Key | Description | Example |
| --- | --- | --- |
| email | Work email addres found (if any) | `"email@domain.com"` |
| status | The status of the lookup attempt. It could return either:<br>`email_found` \- For which we found a work email address.<br>`email_not_found` \- For which we did not find a work email address. | `"email_found"` |
| profile\_url | The LinkedIn Profile URL that is paired with the work<br>email address returned | `"https://www.linkedin.com/in/williamhgates"` |

## Disposable Email Address Check Endpoint

`GET /proxycurl/api/disposable-email`

Cost: `0` credit / successful request.
This free API endpoint is unlocked after your first payment top-up and will remain free perpetually.
Prior to the first top-up, this endpoint costs `1` credit / successful request.

Given an email address, checks if the email address belongs to a disposable email service.

```
curl \
    -G \
    -H "Authorization: Bearer ${YOUR_API_KEY}" \
    'https://nubela.co/proxycurl/api/disposable-email' \
    --data-urlencode 'email=steven@nubela.co'

```

```
import requests

api_key = 'YOUR_API_KEY'
headers = {'Authorization': 'Bearer ' + api_key}
api_endpoint = 'https://nubela.co/proxycurl/api/disposable-email'
params = {
    'email': 'steven@nubela.co',
}
response = requests.get(api_endpoint,
                        params=params,
                        headers=headers)

```

[![Run in Postman](https://run.pstmn.io/button.svg)](https://pxlcl.co/run-collection)

### URL Parameters

| Parameter | Required | Description | Example |
| --- | --- | --- | --- |
| `email` | yes | Email address to check | `steven@nubela.co` |

### Response

```
{
    "is_disposable_email": false,
    "is_free_email": false
}

```

| Key | Description | Example |
| --- | --- | --- |
| is\_disposable\_email | Returns a boolean value of the disposable nature of the given email address | `false` |
| is\_free\_email | Returns a boolean value of the free status of the given email address | `false` |

### Response Headers

| Header Key | Description | Example |
| --- | --- | --- |
| `X-Proxycurl-Credit-Cost` | Total cost of credits for this API call | `0` |

## Personal Contact Number Lookup Endpoint

`GET /proxycurl/api/contact-api/personal-contact`

Cost: `1` credit / contact number returned.

Find personal phone numbers associated with a given social media profile.

```
curl \
    -G \
    -H "Authorization: Bearer ${YOUR_API_KEY}" \
    'https://nubela.co/proxycurl/api/contact-api/personal-contact' \
    --data-urlencode 'linkedin_profile_url=https://linkedin.com/in/steven-goh-6738131b' \
    --data-urlencode 'page_size=0'

```

```
import requests

api_key = 'YOUR_API_KEY'
headers = {'Authorization': 'Bearer ' + api_key}
api_endpoint = 'https://nubela.co/proxycurl/api/contact-api/personal-contact'
params = {
    'linkedin_profile_url': 'https://linkedin.com/in/steven-goh-6738131b',
    'page_size': '0',
}
response = requests.get(api_endpoint,
                        params=params,
                        headers=headers)

```

[![Run in Postman](https://run.pstmn.io/button.svg)](https://pxlcl.co/run-collection)

### URL Parameters

| Parameter | Required | Description | Example |
| --- | --- | --- | --- |
| `twitter_profile_url` | Yes (Include only one of: `linkedin_profile_url`,<br>`twitter_profile_url`, or `facebook_profile_url`) | The Twitter/X Profile URL from which you wish to extract personal<br>contact numbers | `https://x.com/proxycurl` |
| `facebook_profile_url` | Yes (Include only one of: `linkedin_profile_url`,<br>`twitter_profile_url`, or `facebook_profile_url`) | The Facebook Profile URL from which you wish to extract personal<br>contact numbers | `https://www.facebook.com/zuck` |
| `linkedin_profile_url` | Yes (Include only one of: `linkedin_profile_url`,<br>`twitter_profile_url`, or `facebook_profile_url`) | The LinkedIn Profile URL from which you wish to extract personal<br>contact numbers | `https://linkedin.com/in/steven-goh-6738131b` |
| `page_size` | no | This controls the maximum number of numbers returned per API call.<br>It's useful for limiting credit consumption as the number of numbers<br>per identity can vary. The default value is 0, meaning there's no limit<br>to the number of returned results. | `0` |

### Response

```
{
    "numbers": [\
        "+1123123123"\
    ]
}

```

| Key | Description | Example |
| --- | --- | --- |
| numbers | A list of contact numbers | `["123456789"]` |

### Response Headers

| Header Key | Description | Example |
| --- | --- | --- |
| `X-Proxycurl-Credit-Cost` | Total cost of credits for this API call | `1` |

## Personal Email Lookup Endpoint

`GET /proxycurl/api/contact-api/personal-email`

Cost: `1` credit / email returned.

Find personal email addresses associated with a given social media profile.

```
curl \
    -G \
    -H "Authorization: Bearer ${YOUR_API_KEY}" \
    'https://nubela.co/proxycurl/api/contact-api/personal-email' \
    --data-urlencode 'linkedin_profile_url=https://linkedin.com/in/steven-goh-6738131b' \
    --data-urlencode 'email_validation=include' \
    --data-urlencode 'page_size=0'

```

```
import requests

api_key = 'YOUR_API_KEY'
headers = {'Authorization': 'Bearer ' + api_key}
api_endpoint = 'https://nubela.co/proxycurl/api/contact-api/personal-email'
params = {
    'linkedin_profile_url': 'https://linkedin.com/in/steven-goh-6738131b',
    'email_validation': 'include',
    'page_size': '0',
}
response = requests.get(api_endpoint,
                        params=params,
                        headers=headers)

```

[![Run in Postman](https://run.pstmn.io/button.svg)](https://pxlcl.co/run-collection)

### URL Parameters

| Parameter | Required | Description | Example |
| --- | --- | --- | --- |
| `twitter_profile_url` | yes (Include only one of: `linkedin_profile_url`, `twitter_profile_url`, or `facebook_profile_url`) | The Twitter/X Profile URL from which you wish to extract personal email addresses. | `https://x.com/proxycurl` |
| `facebook_profile_url` | yes (Include only one of: `linkedin_profile_url`, `twitter_profile_url`, or `facebook_profile_url`) | The Facebook Profile URL from which you wish to extract personal email addresses. | `https://www.facebook.com/zuck` |
| `linkedin_profile_url` | yes (Include only one of: `linkedin_profile_url`, `twitter_profile_url`, or `facebook_profile_url`) | The LinkedIn Profile URL from which you wish to extract personal email addresses. | `https://linkedin.com/in/steven-goh-6738131b` |
| `email_validation` | no | How to validate each email.<br>Takes the following values:<br>\\* `none` (default) - Do not perform email validation.<br>\\* `fast` \- Perform fast email validation (does not cost extra credit).<br>\\* `precise` \- Perform deliverability validation (costs 1 extra credit per email found).<br>For backward-compatibility these are also accepted:<br>\\* `include` \- Equivalent to `precise`<br>\\* `exclude` \- Equivalent to `none` | `include` |
| `page_size` | no | This controls the maximum number of emails returned per API call. It's useful for limiting credit consumption as the number of emails per identity can vary. The default value is `0`, meaning there's no limit to the number of returned results. | `0` |

### Response

```
{
    "emails": [\
        "random@gmail.com",\
        "random2@yahoo.com"\
    ],
    "invalid_emails": [\
        "random3@gmail.com"\
    ]
}

```

| Key | Description | Example |
| --- | --- | --- |
| emails | A list of personal emails | `["hello@nubela.co"]` |
| invalid\_emails | A list of invalid personal emails | `["gmail.com"]` |

### Response Headers

| Header Key | Description | Example |
| --- | --- | --- |
| `X-Proxycurl-Credit-Cost` | Total cost of credits for this API call | `1` |

# Search API

## Company Search Endpoint

`GET /proxycurl/api/v2/search/company`

Cost: `3` credits / LinkedIn URL.
Extra charges might be incurred if premium optional parameters are used. Please read the description of the parameters that you intend to use. It does not consume any credits if no results are returned.

Search for companies that meet a set of criteria within
our exhaustive dataset of company profiles.

This API endpoint is powered by [LinkDB](https://nubela.co/proxycurl/linkdb), our exhaustive dataset of company profiles.

This API endpoint can return at most of 10,000,000 results per search.

Each search expression for a parameter is limited to a maximum of 255 characters. Search expressions follow the [Boolean Search Syntax](https://nubela.co/blog/ultimate-guide-to-boolean-search-syntax/).

```
curl \
    -G \
    -H "Authorization: Bearer ${YOUR_API_KEY}" \
    'https://nubela.co/proxycurl/api/v2/search/company' \
    --data-urlencode 'country=US' \
    --data-urlencode 'region=United States' \
    --data-urlencode 'city=new AND york' \
    --data-urlencode 'type=PRIVATELY_HELD' \
    --data-urlencode 'follower_count_min=1000' \
    --data-urlencode 'follower_count_max=1000' \
    --data-urlencode 'name=google OR apple' \
    --data-urlencode 'industry=technology' \
    --data-urlencode 'employee_count_max=1000' \
    --data-urlencode 'employee_count_min=1000' \
    --data-urlencode 'description=medical device' \
    --data-urlencode 'founded_after_year=1999' \
    --data-urlencode 'founded_before_year=1999' \
    --data-urlencode 'funding_amount_max=1000000' \
    --data-urlencode 'funding_amount_min=1000000' \
    --data-urlencode 'funding_raised_after=2019-12-30' \
    --data-urlencode 'funding_raised_before=2019-12-30' \
    --data-urlencode 'public_identifier_in_list=stripe,amazon' \
    --data-urlencode 'public_identifier_not_in_list=stripe,amazon' \
    --data-urlencode 'page_size=10' \
    --data-urlencode 'enrich_profiles=enrich' \
    --data-urlencode 'use_cache=if-present'

```

```
import requests

api_key = 'YOUR_API_KEY'
headers = {'Authorization': 'Bearer ' + api_key}
api_endpoint = 'https://nubela.co/proxycurl/api/v2/search/company'
params = {
    'country': 'US',
    'region': 'United States',
    'city': 'new AND york',
    'type': 'PRIVATELY_HELD',
    'follower_count_min': '1000',
    'follower_count_max': '1000',
    'name': 'google OR apple',
    'industry': 'technology',
    'employee_count_max': '1000',
    'employee_count_min': '1000',
    'description': 'medical device',
    'founded_after_year': '1999',
    'founded_before_year': '1999',
    'funding_amount_max': '1000000',
    'funding_amount_min': '1000000',
    'funding_raised_after': '2019-12-30',
    'funding_raised_before': '2019-12-30',
    'public_identifier_in_list': 'stripe,amazon',
    'public_identifier_not_in_list': 'stripe,amazon',
    'page_size': '10',
    'enrich_profiles': 'enrich',
    'use_cache': 'if-present',
}
response = requests.get(api_endpoint,
                        params=params,
                        headers=headers)

```

[![Run in Postman](https://run.pstmn.io/button.svg)](https://pxlcl.co/run-collection)

### URL Parameters

| Parameter | Required | Description | Example |
| --- | --- | --- | --- |
| `country` | no | Filter companies with an office based in this country.<br>This parameter accepts a case-insensitive [Alpha-2 ISO3166 country code](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2). | `US` |
| `region` | no | Filter companies with an office based in this country.<br>This parameter accepts a case-insensitive [Alpha-2 ISO3166 country code](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2). | `United States` |
| `city` | no | Filter companies based in cities matching the provided search expression. | `new AND york` |
| `type` | no | Filter companies of the provided LinkedIn type.<br>Possible values:<br>\\* `EDUCATIONAL`: Educational Institution<br>\\* `GOVERNMENT_AGENCY`: Government Agency<br>\\* `NON_PROFIT` : Nonprofit<br>\\* `PARTNERSHIP` : Partnership<br>\\* `PRIVATELY_HELD` : Privately Held<br>\\* `PUBLIC_COMPANY` : Public Company<br>\\* `SELF_EMPLOYED` : Self-Employed<br>\\* `SELF_OWNED` : Sole Proprietorship | `PRIVATELY_HELD` |
| `follower_count_min` | no | Filter companies with a LinkedIn follower count **more than** this value. | `1000` |
| `follower_count_max` | no | Filter companies with a LinkedIn follower count **less than** this value. | `1000` |
| `name` | no | Filter companies with a name matching the provided search expression. | `google OR apple` |
| `industry` | no | Filter companies belonging to an `industry` that matches the provided search expression. The `industry` attribute, found in a LinkedIn Company profile, describes the industry in which the company operates. The value of this attribute is an enumerator. [This CSV file provides an exhaustive list of possible values for this attribute](https://drive.google.com/file/d/1T-ULD_mFc8lPogyVabtx-fereXENIhor/view). | `technology` |
| `employee_count_max` | no | Filter companies with **at most** this many employees. | `1000` |
| `employee_count_min` | no | Filter companies with **at least** this many employees. | `1000` |
| `description` | no | Filter companies with a description matching the provided search expression. | `medical device` |
| `founded_after_year` | no | Filter companies founded **after** this year. | `1999` |
| `founded_before_year` | no | Filter companies founded **before** this year. | `1999` |
| `funding_amount_max` | no | Filter companies that have raised **at most** this much (USD) funding amount. | `1000000` |
| `funding_amount_min` | no | Filter companies that have raised **at least** this much (USD) funding amount. | `1000000` |
| `funding_raised_after` | no | Filter companies that have raised funding **after** this date. | `2019-12-30` |
| `funding_raised_before` | no | Filter companies that have raised funding **before** this date. | `2019-12-30` |
| `public_identifier_in_list` | no | A list of public identifiers (the identifying portion of the company’s profile URL).<br>The target company’s identifier must be a member of this list. | `stripe,amazon` |
| `public_identifier_not_in_list` | no | A list of public identifiers (the identifying portion of the company’s profile URL).<br>The target company’s identifier must **not** be a member of this list. | `stripe,amazon` |
| `page_size` | no | Tune the maximum results returned per API call.<br>The default value of this parameter is 100.<br>Accepted values for this parameter is an integer ranging from 1 to 100.<br>When `enrich_profiles=enrich`, this parameter accepts value ranging from `1` to `10`. | `10` |
| `enrich_profiles` | no | Get the company's complete profile data rather than just the URLs to their LinkedIn profiles.<br>Each request respond with a streaming response of profiles.<br>The valid values are:<br>\- skip (default): lists company's profile url<br>\- enrich: include company's profile data in the list<br>Calling this API endpoint with this parameter would add 1 credit per result returned. | `enrich` |
| `use_cache` | no | Define the freshness guarantee on the results returned.<br>This parameter accepts the following values:<br>if-present (default value) - Returns result as it is without any freshness guarantee<br>if-recent - Will make a best effort to return results of profiles no older than 29 days. Costs 1 extra credit<br>per result on top of the base cost of the endpoint for users on the Growth or larger subscription. For all other<br>users, it will cost 2 extra credits per result on top of the base cost of the endpoint.<br>Note: If use\_cache=if-recent, page\_size is limited to a value of 10 or smaller. | `if-present` |

### Response

```
{
    "next_page": null,
    "results": [\
        {\
            "last_updated": "2023-10-26T11:34:30Z",\
            "linkedin_profile_url": "https://www.linkedin.com/company/apple/",\
            "profile": {\
                "affiliated_companies": [\
                    {\
                        "industry": "Software Development",\
                        "link": "https://www.linkedin.com/company/youtube",\
                        "location": "San Bruno, CA",\
                        "name": "YouTube"\
                    },\
                    {\
                        "industry": "Software Development",\
                        "link": "https://www.linkedin.com/showcase/google-cloud",\
                        "location": "Mountain View, California",\
                        "name": "Google Cloud"\
                    }\
                ],\
                "background_cover_image_url": "https://s3.us-west-000.backblazeb2.com/proxycurl/company/google/cover?X-Amz-Algorithm=AWS4-HMAC-SHA256\u0026X-Amz-Credential=0004d7f56a0400b0000000001%2F20230119%2Fus-west-000%2Fs3%2Faws4_request\u0026X-Amz-Date=20230119T060024Z\u0026X-Amz-Expires=3600\u0026X-Amz-SignedHeaders=host\u0026X-Amz-Signature=abb7a4b87583cffda8db24d58d906c644998fae8cbb99e98c69a35720fcd0050",\
                "company_size": [\
                    10001,\
                    null\
                ],\
                "company_size_on_linkedin": 319856,\
                "company_type": "PUBLIC_COMPANY",\
                "description": "A problem isn\u0027t truly solved until it\u0027s solved for all. Googlers build products that help create opportunities for everyone, whether down the street or across the globe. Bring your insight, imagination and a healthy disregard for the impossible. Bring everything that makes you unique. Together, we can build for everyone.\n\nCheck out our career opportunities at careers.google.com.",\
                "follower_count": 27472792,\
                "founded_year": null,\
                "hq": {\
                    "city": "Mountain View",\
                    "country": "US",\
                    "is_hq": true,\
                    "line_1": "1600 Amphitheatre Parkway",\
                    "postal_code": "94043",\
                    "state": "CA"\
                },\
                "industry": "Software Development",\
                "linkedin_internal_id": "1441",\
                "locations": [\
                    {\
                        "city": "Mountain View",\
                        "country": "US",\
                        "is_hq": true,\
                        "line_1": "1600 Amphitheatre Parkway",\
                        "postal_code": "94043",\
                        "state": "CA"\
                    },\
                    {\
                        "city": "New York",\
                        "country": "US",\
                        "is_hq": false,\
                        "line_1": "111 8th Ave",\
                        "postal_code": "10011",\
                        "state": "NY"\
                    }\
                ],\
                "name": "Google",\
                "profile_pic_url": "https://s3.us-west-000.backblazeb2.com/proxycurl/company/google/profile?X-Amz-Algorithm=AWS4-HMAC-SHA256\u0026X-Amz-Credential=0004d7f56a0400b0000000001%2F20230119%2Fus-west-000%2Fs3%2Faws4_request\u0026X-Amz-Date=20230119T060024Z\u0026X-Amz-Expires=3600\u0026X-Amz-SignedHeaders=host\u0026X-Amz-Signature=0d3500b39da8db1d2d8f5727a9ac39a7c4a88b4632ed68209dee12f06bc79aca",\
                "search_id": "1441",\
                "similar_companies": [\
                    {\
                        "industry": "Software Development",\
                        "link": "https://www.linkedin.com/company/amazon",\
                        "location": "Seattle, WA",\
                        "name": "Amazon"\
                    },\
                    {\
                        "industry": "Software Development",\
                        "link": "https://www.linkedin.com/company/microsoft",\
                        "location": "Redmond, Washington",\
                        "name": "Microsoft"\
                    }\
                ],\
                "specialities": [\
                    "search",\
                    "ads"\
                ],\
                "tagline": null,\
                "universal_name_id": "google",\
                "updates": [\
                    {\
                        "article_link": null,\
                        "image": "https://media.licdn.com/dms/image/C5605AQFthnjiTD6Mvg/videocover-high/0/1660754102856?e=2147483647\u0026v=beta\u0026t=PPOsA9J3vCTXWhuZclqSBQl7DLSDLvy5hKWlkHI85YE",\
                        "posted_on": {\
                            "day": 13,\
                            "month": 9,\
                            "year": 2022\
                        },\
                        "text": "Want to kick start your #LifeAtGoogle but not sure where to begin? Explore our Build Your Future site, where you can learn about developmental programs, learn tips for future interviews, sign up for informational events, and even hear real stories from Googlers who\u2019ve been where you are now. Get started \u2192 https://bit.ly/3SKPzQB",\
                        "total_likes": 4267\
                    },\
                    {\
                        "article_link": null,\
                        "image": "https://media.licdn.com/dms/image/C4D22AQGcvTlKRR3qvQ/feedshare-shrink_2048_1536/0/1672854668558?e=1676505600\u0026v=beta\u0026t=whRRx9ULPEuyw_FgUg4Z3N3O9iksyJW7ewCGZA6ujdg",\
                        "posted_on": null,\
                        "text": "Ariana, welcome to Google. Here\u2019s to a year full of growth, learning, and experiences at #LifeAtGoogle! \ud83c\udf89",\
                        "total_likes": 397\
                    }\
                ],\
                "website": "https://goo.gle/3m1IN7m"\
            }\
        }\
    ],
    "total_result_count": 1
}

```

| Key | Description | Example |
| --- | --- | --- |
| results | A list of CompanyResult objects. | See [CompanyResult](https://nubela.co/proxycurl/docs#search-api-company-search-endpoint-response-companyresult) object |
| next\_page | The URL to the next page of search results. This will be null for the final page. | `null` |
| total\_result\_count | Total number of results found. Not filtered by freshness, as `use_cache=if-recent` only affects served results, not the count calculation. | `9765` |

#### CompanyResult

| Key | Description | Example |
| --- | --- | --- |
| linkedin\_profile\_url | The LinkedIn Profile URL of the company | `"\n        https://www.linkedin.com/company/apple/\n        "` |
| profile | If `enrich_profiles=enrich` is specified, the company's entire profile<br>is returned. Otherwise this field will return `null`. | See [LinkedinCompany](https://nubela.co/proxycurl/docs#search-api-company-search-endpoint-response-linkedincompany) object |
| last\_updated | ISO 8601 timestamp since the enriched profile was last scraped. | `"2023-10-26T11:34:30Z"` |

#### LinkedinCompany

| Key | Description | Example |
| --- | --- | --- |
| linkedin\_internal\_id | LinkedIn's Internal and immutable ID of this Company profile. | `"1441"` |
| description | A textual description of the company. | `"A problem isn\u0027t truly solved until it\u0027s solved for all. Googlers build products that help create opportunities for everyone, whether down the street or across the globe. Bring your insight, imagination and a healthy disregard for the impossible. Bring everything that makes you unique. Together, we can build for everyone.\n\nCheck out our career opportunities at careers.google.com."` |
| website | The URL of the company's website. | `"https://goo.gle/3m1IN7m"` |
| industry | The `industry` attribute, found in a LinkedIn Company profile, describes the industry in which the company operates. The value of this attribute is an enumerator. [This CSV file provides an exhaustive list of possible values for this attribute](https://drive.google.com/file/d/1T-ULD_mFc8lPogyVabtx-fereXENIhor/view). | `"Software Development"` |
| company\_size | Sequenceed range of company head count | `[10001, null]` |
| company\_size\_on\_linkedin | The size of the company as indicated on LinkedIn. | `319856` |
| hq | A [CompanyLocation](https://nubela.co/proxycurl/docs#search-api-company-search-endpoint-response-companylocation) object | See [CompanyLocation](https://nubela.co/proxycurl/docs#search-api-company-search-endpoint-response-companylocation) object |
| company\_type | Possible values:<br>`EDUCATIONAL`: Educational Institution<br>`GOVERNMENT_AGENCY`: Government Agency<br>`NON_PROFIT` : Nonprofit<br>`PARTNERSHIP` : Partnership<br>`PRIVATELY_HELD`: Privately Held<br>`PUBLIC_COMPANY`: Public Company<br>`SELF_EMPLOYED`: Self-Employed<br>`SELF_OWNED`: Sole Proprietorship | `"PUBLIC_COMPANY"` |
| founded\_year | The year the company was founded. | `null` |
| specialities | A list of specialities. | `["search", "ads"]` |
| locations | list of [CompanyLocation](https://nubela.co/proxycurl/docs#search-api-company-search-endpoint-response-companylocation) | See [CompanyLocation](https://nubela.co/proxycurl/docs#search-api-company-search-endpoint-response-companylocation) object |
| name | The name of the company. | `"Google"` |
| tagline | A short, catchy phrase that represents the company's mission or brand. | `"Think Different - But Not Too Different"` |
| universal\_name\_id | A unique numerical identifier for the company used in the LinkedIn platform. | `"google"` |
| profile\_pic\_url | The URL of the company's profile picture. | `"https://s3.us-west-000.backblazeb2.com/proxycurl/company/google/profile?X-Amz-Algorithm=AWS4-HMAC-SHA256\u0026X-Amz-Credential=0004d7f56a0400b0000000001%2F20230119%2Fus-west-000%2Fs3%2Faws4_request\u0026X-Amz-Date=20230119T060024Z\u0026X-Amz-Expires=3600\u0026X-Amz-SignedHeaders=host\u0026X-Amz-Signature=0d3500b39da8db1d2d8f5727a9ac39a7c4a88b4632ed68209dee12f06bc79aca"` |
| background\_cover\_image\_url | The URL of the company's background cover image. | `"https://s3.us-west-000.backblazeb2.com/proxycurl/company/google/cover?X-Amz-Algorithm=AWS4-HMAC-SHA256\u0026X-Amz-Credential=0004d7f56a0400b0000000001%2F20230119%2Fus-west-000%2Fs3%2Faws4_request\u0026X-Amz-Date=20230119T060024Z\u0026X-Amz-Expires=3600\u0026X-Amz-SignedHeaders=host\u0026X-Amz-Signature=abb7a4b87583cffda8db24d58d906c644998fae8cbb99e98c69a35720fcd0050"` |
| search\_id | Useable with [Job listing endpoint](https://nubela.co/proxycurl/docs#jobs-api-jobs-listing-endpoint) | `"1441"` |
| similar\_companies | list of [SimilarCompany](https://nubela.co/proxycurl/docs#search-api-company-search-endpoint-response-similarcompany) | See [SimilarCompany](https://nubela.co/proxycurl/docs#search-api-company-search-endpoint-response-similarcompany) object |
| affiliated\_companies | list of [AffiliatedCompany](https://nubela.co/proxycurl/docs#search-api-company-search-endpoint-response-affiliatedcompany) | See [AffiliatedCompany](https://nubela.co/proxycurl/docs#search-api-company-search-endpoint-response-affiliatedcompany) object |
| updates | A list of post updates made by the company. This field is not guaranteed to be returned. Do not rely on this attribute in production. | See [CompanyUpdate](https://nubela.co/proxycurl/docs#search-api-company-search-endpoint-response-companyupdate) object |
| follower\_count | The number of followers the company has on LinkedIn. | `27472792` |
| acquisitions | A [Acquisition](https://nubela.co/proxycurl/docs#search-api-company-search-endpoint-response-acquisition) object | See [Acquisition](https://nubela.co/proxycurl/docs#search-api-company-search-endpoint-response-acquisition) object |
| exit\_data | list of [Exit](https://nubela.co/proxycurl/docs#search-api-company-search-endpoint-response-exit) | See [Exit](https://nubela.co/proxycurl/docs#search-api-company-search-endpoint-response-exit) object |
| extra | Company extra when `extra=include` | See [CompanyDetails](https://nubela.co/proxycurl/docs#search-api-company-search-endpoint-response-companydetails) object |
| funding\_data | Company Funding data when `funding_data=include` | See [Funding](https://nubela.co/proxycurl/docs#search-api-company-search-endpoint-response-funding) object |
| categories | The `categories` attribute is fetched from the company's Crunchbase profile. Values for this attribute are free-form text, and there is no exhaustive list of categories. Consider the categories attribute as "hints" regarding the products or services offered by the company. | `["artificial-intelligence", "virtual-reality"]` |

#### CompanyLocation

| Key | Description | Example |
| --- | --- | --- |
| country |  | `"US"` |
| city |  | `"Mountain View"` |
| postal\_code |  | `"94043"` |
| line\_1 |  | `"1600 Amphitheatre Parkway"` |
| is\_hq |  | `true` |
| state |  | `"CA"` |

#### SimilarCompany

| Key | Description | Example |
| --- | --- | --- |
| name |  | `"Amazon"` |
| link |  | `"https://www.linkedin.com/company/amazon"` |
| industry |  | `"Software Development"` |
| location |  | `"Seattle, WA"` |

#### AffiliatedCompany

| Key | Description | Example |
| --- | --- | --- |
| name |  | `"LinkedIn"` |
| link |  | `"https://www.linkedin.com/company/linkedin"` |
| industry |  | `"Internet"` |
| location |  | `"Sunnyvale, California"` |

#### CompanyUpdate

| Key | Description | Example |
| --- | --- | --- |
| article\_link | The URL for which the post links out to | `"https://lnkd.in/gr7cb5by"` |
| image | The URL to the image to the post (if it exists) | `"https://media-exp1.licdn.com/dms/image/C5622AQEGh8idEAm14Q/feedshare-shrink_800/0/1633089889886?e=1637798400\u0026v=beta\u0026t=LtGtAUSJNrPYdHpVhTBLhGTWYqrHtFJ86PKSmTpou7c"` |
| posted\_on | A [Date](https://nubela.co/proxycurl/docs#search-api-company-search-endpoint-response-date) object | See [Date](https://nubela.co/proxycurl/docs#search-api-company-search-endpoint-response-date) object |
| text | The body of the update | `"Introducing Personal Email Lookup API https://lnkd.in/gr7cb5by"` |
| total\_likes | The total likes a post has received | `3` |

#### Date

| Key | Description | Example |
| --- | --- | --- |
| day |  | `30` |
| month |  | `9` |
| year |  | `2023` |

#### Acquisition

| Key | Description | Example |
| --- | --- | --- |
| acquired | list of [AcquiredCompany](https://nubela.co/proxycurl/docs#search-api-company-search-endpoint-response-acquiredcompany) | See [AcquiredCompany](https://nubela.co/proxycurl/docs#search-api-company-search-endpoint-response-acquiredcompany) object |
| acquired\_by | A [Acquisitor](https://nubela.co/proxycurl/docs#search-api-company-search-endpoint-response-acquisitor) object | See [Acquisitor](https://nubela.co/proxycurl/docs#search-api-company-search-endpoint-response-acquisitor) object |

#### AcquiredCompany

| Key | Description | Example |
| --- | --- | --- |
| linkedin\_profile\_url | LinkedIn Company Profile URL of company that was involved | `"https://www.linkedin.com/company/apple"` |
| crunchbase\_profile\_url | Crunchbase Profile URL of company that was involved | `"https://www.crunchbase.com/organization/apple"` |
| announced\_date | Date by which this event was announced | See [Date](https://nubela.co/proxycurl/docs#search-api-company-search-endpoint-response-date) object |
| price | Price of acquisition | `300000000` |

#### Acquisitor

| Key | Description | Example |
| --- | --- | --- |
| linkedin\_profile\_url | LinkedIn Company Profile URL of company that was involved | `"https://www.linkedin.com/company/nvidia"` |
| crunchbase\_profile\_url | Crunchbase Profile URL of company that was involved | `"https://www.crunchbase.com/organization/nvidia"` |
| announced\_date | Date by which this event was announced | See [Date](https://nubela.co/proxycurl/docs#search-api-company-search-endpoint-response-date) object |
| price | Price of acquisition | `10000` |

#### Exit

| Key | Description | Example |
| --- | --- | --- |
| linkedin\_profile\_url | LinkedIn Profile URL of the company that has exited | `"https://www.linkedin.com/company/motiondsp"` |
| crunchbase\_profile\_url | Crunchbase Profile URL of the company that has exited | `"https://www.crunchbase.com/organization/motiondsp"` |
| name | Name of the company | `"MotionDSP"` |

#### CompanyDetails

| Key | Description | Example |
| --- | --- | --- |
| crunchbase\_profile\_url | Crunchbase Profile URL of the company | `"https://www.crunchbase.com/organization/nvidia"` |
| ipo\_status | IPO status of the company | `"Public"` |
| crunchbase\_rank | A measure of prominence of this company by Crunchbase | `13` |
| founding\_date | Date of founding | See [Date](https://nubela.co/proxycurl/docs#search-api-company-search-endpoint-response-date) object |
| operating\_status | Status of the company's operational status | `"Active"` |
| company\_type | Type of company | `"For Profit"` |
| contact\_email | General contact email of the company | `"info@nvidia.com"` |
| phone\_number | General contact number of the company | `"(140) 848-6200"` |
| facebook\_id | ID of the company's official Facebook account | `"NVIDIA.IN"` |
| twitter\_id | ID of the company's official Twitter account | `"nvidia"` |
| number\_of\_funding\_rounds | Total rounds of funding that this company has raised | `3` |
| total\_funding\_amount | Total venture capital raised by this company | `4000000` |
| stock\_symbol | Stock symbol of this public company | `"NASDAQ:NVDA"` |
| ipo\_date | The date by which this public company went public | See [Date](https://nubela.co/proxycurl/docs#search-api-company-search-endpoint-response-date) object |
| number\_of\_lead\_investors | Total lead investors | `3` |
| number\_of\_investors | Total investors | `4` |
| total\_fund\_raised | The total amount of funds raised (by this VC firm) to be deployed as<br>subsidiary investments (applicable only for VC firms) | `1000` |
| number\_of\_investments | Total investments made by this VC firm (applicable only for VC firms) | `50` |
| number\_of\_lead\_investments | Total investments that was led by this VC firm<br>(applicable only for VC firms) | `3` |
| number\_of\_exits | Total exits by this VC (applicable only for VC firms) | `7` |
| number\_of\_acquisitions | Total companies acquired by this company | `2` |

#### Funding

| Key | Description | Example |
| --- | --- | --- |
| funding\_type | Type of funding | `"Grant"` |
| money\_raised | Amount of money raised | `25000000` |
| announced\_date | Date of announcement | See [Date](https://nubela.co/proxycurl/docs#search-api-company-search-endpoint-response-date) object |
| number\_of\_investor | Number of investors in this round | `1` |
| investor\_list | list of [Investor](https://nubela.co/proxycurl/docs#search-api-company-search-endpoint-response-investor) | See [Investor](https://nubela.co/proxycurl/docs#search-api-company-search-endpoint-response-investor) object |

#### Investor

| Key | Description | Example |
| --- | --- | --- |
| linkedin\_profile\_url | LinkedIn Profile URL of investor | `"https://linkedin.com/company/darpa"` |
| name | Name of investor | `"DARPA"` |
| type | Type of investor | `"organization"` |

### Response Headers

| Header Key | Description | Example |
| --- | --- | --- |
| `X-Proxycurl-Credit-Cost` | Total cost of credits for this API call | `3` |

## Person Search Endpoint

`GET /proxycurl/api/v2/search/person`

Cost: `3` credits / LinkedIn URL.
Extra charges might be incurred if premium optional parameters are used. Please read the description of the parameters that you intend to use. It does not consume any credits if no results are returned.

Search for people who meet a set of criteria within our exhaustive dataset of people profiles.

This API endpoint is powered by [LinkDB](https://nubela.co/proxycurl/linkdb), our exhaustive dataset of people and company profiles.

This API endpoint can return at most 10,000,000 results per search.

Each search expression for a parameter is limited to a maximum of 255 characters. Search expressions follow the [Boolean Search Syntax](https://nubela.co/blog/ultimate-guide-to-boolean-search-syntax/).

```
curl \
    -G \
    -H "Authorization: Bearer ${YOUR_API_KEY}" \
    'https://nubela.co/proxycurl/api/v2/search/person' \
    --data-urlencode 'country=US' \
    --data-urlencode 'first_name=Sarah' \
    --data-urlencode 'last_name=Jackson OR Johnson' \
    --data-urlencode 'education_field_of_study=computer science' \
    --data-urlencode 'education_degree_name=MBA' \
    --data-urlencode 'education_school_name=Caltech OR Massachusetts Institute of Technology' \
    --data-urlencode 'education_school_linkedin_profile_url=https://www.linkedin.com/school/national-university-of-singapore/' \
    --data-urlencode 'current_role_title=founder' \
    --data-urlencode 'past_role_title=founder' \
    --data-urlencode 'current_role_before=2019-12-30' \
    --data-urlencode 'current_role_after=2019-12-30' \
    --data-urlencode 'current_company_linkedin_profile_url=https://www.linkedin.com/company/apple' \
    --data-urlencode 'past_company_linkedin_profile_url=https://www.linkedin.com/company/apple' \
    --data-urlencode 'current_job_description=education' \
    --data-urlencode 'past_job_description=education' \
    --data-urlencode 'current_company_name=Stripe OR Apple' \
    --data-urlencode 'past_company_name=Stripe OR Apple' \
    --data-urlencode 'linkedin_groups=haskell' \
    --data-urlencode 'languages=Mandarin OR Chinese' \
    --data-urlencode 'region=California' \
    --data-urlencode 'city=Seattle OR Los Angeles' \
    --data-urlencode 'headline=founder' \
    --data-urlencode 'summary=founder' \
    --data-urlencode 'industries=automotive' \
    --data-urlencode 'interests=technology' \
    --data-urlencode 'skills=accounting' \
    --data-urlencode 'current_company_country=us' \
    --data-urlencode 'current_company_region=United States' \
    --data-urlencode 'current_company_city=Seattle OR Los Angeles' \
    --data-urlencode 'current_company_type=NON_PROFIT' \
    --data-urlencode 'current_company_follower_count_min=1000' \
    --data-urlencode 'current_company_follower_count_max=1000' \
    --data-urlencode 'current_company_industry=higher AND education' \
    --data-urlencode 'current_company_employee_count_min=1000' \
    --data-urlencode 'current_company_employee_count_max=1000' \
    --data-urlencode 'current_company_description=medical device' \
    --data-urlencode 'current_company_founded_after_year=1999' \
    --data-urlencode 'current_company_founded_before_year=1999' \
    --data-urlencode 'current_company_funding_amount_min=1000000' \
    --data-urlencode 'current_company_funding_amount_max=1000000' \
    --data-urlencode 'current_company_funding_raised_after=2019-12-30' \
    --data-urlencode 'current_company_funding_raised_before=2019-12-30' \
    --data-urlencode 'public_identifier_in_list=williamhgates,johnrmarty' \
    --data-urlencode 'public_identifier_not_in_list=williamhgates,johnrmarty' \
    --data-urlencode 'page_size=10' \
    --data-urlencode 'follower_count_min=1000' \
    --data-urlencode 'follower_count_max=1000' \
    --data-urlencode 'enrich_profiles=enrich' \
    --data-urlencode 'use_cache=if-present'

```

```
import requests

api_key = 'YOUR_API_KEY'
headers = {'Authorization': 'Bearer ' + api_key}
api_endpoint = 'https://nubela.co/proxycurl/api/v2/search/person'
params = {
    'country': 'US',
    'first_name': 'Sarah',
    'last_name': 'Jackson OR Johnson',
    'education_field_of_study': 'computer science',
    'education_degree_name': 'MBA',
    'education_school_name': 'Caltech OR Massachusetts Institute of Technology',
    'education_school_linkedin_profile_url': 'https://www.linkedin.com/school/national-university-of-singapore/',
    'current_role_title': 'founder',
    'past_role_title': 'founder',
    'current_role_before': '2019-12-30',
    'current_role_after': '2019-12-30',
    'current_company_linkedin_profile_url': 'https://www.linkedin.com/company/apple',
    'past_company_linkedin_profile_url': 'https://www.linkedin.com/company/apple',
    'current_job_description': 'education',
    'past_job_description': 'education',
    'current_company_name': 'Stripe OR Apple',
    'past_company_name': 'Stripe OR Apple',
    'linkedin_groups': 'haskell',
    'languages': 'Mandarin OR Chinese',
    'region': 'California',
    'city': 'Seattle OR Los Angeles',
    'headline': 'founder',
    'summary': 'founder',
    'industries': 'automotive',
    'interests': 'technology',
    'skills': 'accounting',
    'current_company_country': 'us',
    'current_company_region': 'United States',
    'current_company_city': 'Seattle OR Los Angeles',
    'current_company_type': 'NON_PROFIT',
    'current_company_follower_count_min': '1000',
    'current_company_follower_count_max': '1000',
    'current_company_industry': 'higher AND education',
    'current_company_employee_count_min': '1000',
    'current_company_employee_count_max': '1000',
    'current_company_description': 'medical device',
    'current_company_founded_after_year': '1999',
    'current_company_founded_before_year': '1999',
    'current_company_funding_amount_min': '1000000',
    'current_company_funding_amount_max': '1000000',
    'current_company_funding_raised_after': '2019-12-30',
    'current_company_funding_raised_before': '2019-12-30',
    'public_identifier_in_list': 'williamhgates,johnrmarty',
    'public_identifier_not_in_list': 'williamhgates,johnrmarty',
    'page_size': '10',
    'follower_count_min': '1000',
    'follower_count_max': '1000',
    'enrich_profiles': 'enrich',
    'use_cache': 'if-present',
}
response = requests.get(api_endpoint,
                        params=params,
                        headers=headers)

```

[![Run in Postman](https://run.pstmn.io/button.svg)](https://pxlcl.co/run-collection)

### URL Parameters

| Parameter | Required | Description | Example |
| --- | --- | --- | --- |
| `country` | no | Filter people located in this country.<br>This parameter accepts a case-insensitive [Alpha-2 ISO3166 country code](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2). | `US` |
| `first_name` | no | Filter people whose first names match the provided search expression. | `Sarah` |
| `last_name` | no | Filter people whose last names match the provided search expression. | `Jackson OR Johnson` |
| `education_field_of_study` | no | Filter people with a field of study matching the provided search expression, based on education history. | `computer science` |
| `education_degree_name` | no | Filter people who earned a degree matching the provided search expression, based on education history. | `MBA` |
| `education_school_name` | no | Filter people who have attended a school whose name matches the provided search expression, based on education history. | `Caltech OR Massachusetts Institute of Technology` |
| `education_school_linkedin_profile_url` | no | Filter people who have attended a school with a specific LinkedIn profile URL, based on education history. | `https://www.linkedin.com/school/national-university-of-singapore/` |
| `current_role_title` | no | Filter people who are **currently** working as a role whose title matches the provided search expression. You'll be looking for profiles on [LinkDB](https://nubela.co/proxycurl/linkdb) that show a person's current job. However, keep in mind that some of these profiles may not be up-to-date, which means you might sometimes see a person's old job instead of their current job on LinkedIn. | `founder` |
| `past_role_title` | no | Filter people who have **in the past** worked as a role whose title matches the provided search expression. | `founder` |
| `current_role_before` | no | Filter people who started their current role **before** this date. You'll be looking for profiles on [LinkDB](https://nubela.co/proxycurl/linkdb) that show a person's current job. However, keep in mind that some of these profiles may not be up-to-date, which means you might sometimes see a person's old job instead of their current job on LinkedIn.<br>This parameter takes a ISO8601 date. Default value of this parameter is `null`. | `2019-12-30` |
| `current_role_after` | no | Filter people who started their current role **after** this date. You'll be looking for profiles on [LinkDB](https://nubela.co/proxycurl/linkdb) that show a person's current job. However, keep in mind that some of these profiles may not be up-to-date, which means you might sometimes see a person's old job instead of their current job on LinkedIn.<br>This parameter takes a ISO8601 date. Default value of this parameter is `null`. | `2019-12-30` |
| `current_company_linkedin_profile_url` | no | Filter people who are **currently** working at a company represented by this LinkedIn Company Profile URL.<br>Default value of this parameter is `null`. | `https://www.linkedin.com/company/apple` |
| `past_company_linkedin_profile_url` | no | Filter people who have **in the past** worked at the company represented by this LinkedIn Company Profile URL.<br>This parameter takes a LinkedIn Company Profile URL. Default value of this parameter is `null`. | `https://www.linkedin.com/company/apple` |
| `current_job_description` | no | Filter people with **current** job descriptions matching the provided search expression. | `education` |
| `past_job_description` | no | Filter people with **past** job descriptions matching the provided search expression. | `education` |
| `current_company_name` | no | Filter people who are **currently** working at a company whose name matches the provided search expression. | `Stripe OR Apple` |
| `past_company_name` | no | Filter people who **have previously** worked at a company whose name matches the provided search expression. | `Stripe OR Apple` |
| `linkedin_groups` | no | Filter people who are members of LinkedIn groups whose names match the provided search expression. | `haskell` |
| `languages` | no | Filter people who list a language matching the provided search expression. | `Mandarin OR Chinese` |
| `region` | no | Filter people located in a region matching the provided search expression.<br>A “region” in this context means “state,” “province,” or similar political division, depending on what country you’re querying. | `California` |
| `city` | no | Filter people located in a city matching the provided search expression. | `Seattle OR Los Angeles` |
| `headline` | no | Filter people whose LinkedIn headline fields match the provided search expression. | `founder` |
| `summary` | no | Filter people whose LinkedIn summary fields match the provided search expression. | `founder` |
| `industries` | no | Person's inferred industry. May sometimes exist when `current_company_industry` does not, but `current_company_industry` should be preferred when it exists. | `automotive` |
| `interests` | no | Filter people whose Linkedin interest fields match the provided search expression. | `technology` |
| `skills` | no | Filter people whose Linkedin skill fields match the provided search expression. | `accounting` |
| `current_company_country` | no | Filter people who are currently working at a company with an office based in this country.<br>This parameter accepts a case-insensitive [Alpha-2 ISO3166 country code](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2). | `us` |
| `current_company_region` | no | Filter people who are currently working at a company based in a region matching the provided search expression. | `United States` |
| `current_company_city` | no | Filter people who are currently working at a company based in a city matching the provided search expression. | `Seattle OR Los Angeles` |
| `current_company_type` | no | Filter people who are currently working at a company of the provided LinkedIn type.<br>Possible values:<br>\\* `EDUCATIONAL`: Educational Institution<br>\\* `GOVERNMENT_AGENCY`: Government Agency<br>\\* `NON_PROFIT` : Nonprofit<br>\\* `PARTNERSHIP` : Partnership<br>\\* `PRIVATELY_HELD` : Privately Held<br>\\* `PUBLIC_COMPANY` : Public Company<br>\\* `SELF_EMPLOYED` : Self-Employed<br>\\* `SELF_OWNED` : Sole Proprietorship | `NON_PROFIT` |
| `current_company_follower_count_min` | no | Filter people who are currently working at a company with a LinkedIn follower count **more than** this value. | `1000` |
| `current_company_follower_count_max` | no | Filter people who are currently working at a company with a LinkedIn follower count **less than** this value. | `1000` |
| `current_company_industry` | no | Filter people who are currently working at a company belonging to an `industry` that matches the provided search expression. The `industry` attribute, found in a LinkedIn Company profile, describes the industry in which the company operates. The value of this attribute is an enumerator. [This CSV file provides an exhaustive list of possible values for this attribute](https://drive.google.com/file/d/1T-ULD_mFc8lPogyVabtx-fereXENIhor/view). | `higher AND education` |
| `current_company_employee_count_min` | no | Filter people who are currently working at a company with **at least** this many employees. | `1000` |
| `current_company_employee_count_max` | no | Filter people who are currently working at a company with **at most** this many employees. | `1000` |
| `current_company_description` | no | Filter people who are currently working at a company with a description matching the provided search expression. | `medical device` |
| `current_company_founded_after_year` | no | Filter people who are currently working at a company that was founded **after** this year. | `1999` |
| `current_company_founded_before_year` | no | Filter people who are currently working at a company that was founded **before** this year. | `1999` |
| `current_company_funding_amount_min` | no | Filter people who are currently working at a company that has raised **at least** this much (USD) funding amount. | `1000000` |
| `current_company_funding_amount_max` | no | Filter people who are currently working at a company that has raised **at most** this much (USD) funding amount. | `1000000` |
| `current_company_funding_raised_after` | no | Filter people who are currently working at a company that has raised funding **after** this date. | `2019-12-30` |
| `current_company_funding_raised_before` | no | Filter people who are currently working at a company that has raised funding **before** this date. | `2019-12-30` |
| `public_identifier_in_list` | no | A list of public identifiers (the identifying portion of the person’s profile URL).<br>The target person’s identifier must be a member of this list. | `williamhgates,johnrmarty` |
| `public_identifier_not_in_list` | no | A list of public identifiers (the identifying portion of the person’s profile URL).<br>The target person’s identifier must **not** be a member of this list. | `williamhgates,johnrmarty` |
| `page_size` | no | Tune the maximum results returned per API call.<br>The default value of this parameter is `100`.<br>Accepted values for this parameter is an integer ranging from `1` to `100`.<br>When `enrich_profiles=enrich`, this parameter accepts value ranging from `1` to `10`. | `10` |
| `follower_count_min` | no | Filter people with a LinkedIn follower count **more than** this value. | `1000` |
| `follower_count_max` | no | Filter people with a LinkedIn follower count **less than** this value. | `1000` |
| `enrich_profiles` | no | Get the person's complete profile data rather than just the URLs to their LinkedIn profiles.<br>Each request respond with a streaming response of profiles.<br>The valid values are:<br>\\* `skip` (default): lists person's profile url only<br>\\* `enrich`: include person's profile data in the list<br>Calling this API endpoint with this parameter would add `1` credit per result returned. | `enrich` |
| `use_cache` | no | Define the freshness guarantee on the results returned.<br>This parameter accepts the following values:<br>if-present (default value) - Returns result as it is without any freshness guarantee<br>if-recent - Will make a best effort to return results of profiles no older than 29 days. Costs 1 extra credit<br>per result on top of the base cost of the endpoint for users on the Growth or larger subscription. For all other<br>users, it will cost 2 extra credits per result on top of the base cost of the endpoint.<br>Note: If use\_cache=if-recent, page\_size is limited to a value of 10 or smaller. | `if-present` |

### Response

```
{
    "next_page": null,
    "results": [\
        {\
            "last_updated": "2023-10-26T11:34:30Z",\
            "linkedin_profile_url": "https://www.linkedin.com/in/johnrmarty",\
            "profile": {\
                "accomplishment_courses": [],\
                "accomplishment_honors_awards": [],\
                "accomplishment_organisations": [],\
                "accomplishment_patents": [],\
                "accomplishment_projects": [\
                    {\
                        "description": "gMessenger was built using Ruby on Rails, and the Bootstrap HTML, CSS, and JavaScript framework. It uses a Websocket-Rails integration to post a user\u0027s message content to the page in real time, with no page refresh required. gMessenger also includes custom authentication with three different permissions levels.",\
                        "ends_at": null,\
                        "starts_at": {\
                            "day": 1,\
                            "month": 3,\
                            "year": 2015\
                        },\
                        "title": "gMessenger",\
                        "url": "http://gmessenger.herokuapp.com/"\
                    },\
                    {\
                        "description": "A task and project management responsive web app utilizing Ruby on Rails - CSS and HTML",\
                        "ends_at": null,\
                        "starts_at": {\
                            "day": 1,\
                            "month": 1,\
                            "year": 2015\
                        },\
                        "title": "Taskly",\
                        "url": "https://hidden-coast-7204.herokuapp.com/"\
                    }\
                ],\
                "accomplishment_publications": [],\
                "accomplishment_test_scores": [],\
                "activities": [\
                    {\
                        "activity_status": "Shared by John Marty",\
                        "link": "https://www.linkedin.com/posts/johnrmarty_financialfreedom-realestate-technology-activity-6940294635743301632-rsLo",\
                        "title": "Yesterday I toured a $1.2M property in California that has a large 13K sq ft lot with two homes on it. After 5 minutes of being on-site I\u2026"\
                    }\
                ],\
                "articles": [],\
                "background_cover_image_url": "https://media.licdn.com/dms/image/C5616AQH9tkBTUhHfng/profile-displaybackgroundimage-shrink_200_800/0/1614530499015?e=2147483647\u0026v=beta\u0026t=VEoCyedtZulnAVYWT9BXfKHi5OFp8avElNjiz8kjSTU",\
                "certifications": [\
                    {\
                        "authority": "Scaled Agile, Inc.",\
                        "display_source": null,\
                        "ends_at": null,\
                        "license_number": null,\
                        "name": "SAFe Agile Framework Practitioner - ( Scrum, XP, and Lean Practices in the SAFe Enterprise)",\
                        "starts_at": null,\
                        "url": null\
                    },\
                    {\
                        "authority": "Scrum Alliance",\
                        "display_source": null,\
                        "ends_at": null,\
                        "license_number": null,\
                        "name": "SCRUM Alliance Certified Product Owner",\
                        "starts_at": null,\
                        "url": null\
                    }\
                ],\
                "city": "Seattle",\
                "connections": 500,\
                "country": "US",\
                "country_full_name": "United States of America",\
                "education": [\
                    {\
                        "activities_and_societies": null,\
                        "degree_name": "Master of Business Administration (MBA)",\
                        "description": null,\
                        "ends_at": {\
                            "day": 31,\
                            "month": 12,\
                            "year": 2015\
                        },\
                        "field_of_study": "Finance + Economics",\
                        "grade": null,\
                        "logo_url": "https://media.licdn.com/dms/image/C560BAQGVi9eAHgWxFw/company-logo_100_100/0/1673448029676?e=2147483647\u0026v=beta\u0026t=NG6ttckXvnS2DX3abTfVACRY2E9Q1EcryNaJLRbE9OE",\
                        "school": "University of Colorado Denver",\
                        "school_facebook_profile_url": null,\
                        "school_linkedin_profile_url": "https://www.linkedin.com/school/university-of-colorado-denver/",\
                        "starts_at": {\
                            "day": 1,\
                            "month": 1,\
                            "year": 2013\
                        }\
                    },\
                    {\
                        "activities_and_societies": null,\
                        "degree_name": null,\
                        "description": "rails, ruby, rspec, capybara, bootstrap, css, html, api integration, Jquery, Javascript",\
                        "ends_at": {\
                            "day": 31,\
                            "month": 12,\
                            "year": 2015\
                        },\
                        "field_of_study": "School of Software Development",\
                        "grade": null,\
                        "logo_url": "https://media.licdn.com/dms/image/C560BAQFKNxOZ4X0g8Q/company-logo_100_100/0/1670610916338?e=2147483647\u0026v=beta\u0026t=t7ImfhmsuIJ7HJGHEbPJ2suxdslKhzp9v-5h9_G4sWE",\
                        "school": "Galvanize Inc",\
                        "school_facebook_profile_url": null,\
                        "school_linkedin_profile_url": "https://www.linkedin.com/school/galvanize-it/",\
                        "starts_at": {\
                            "day": 1,\
                            "month": 1,\
                            "year": 2015\
                        }\
                    }\
                ],\
                "experiences": [\
                    {\
                        "company": "Freedom Fund Real Estate",\
                        "company_facebook_profile_url": null,\
                        "company_linkedin_profile_url": "https://www.linkedin.com/company/freedomfund",\
                        "description": "Our mission is to provide everyday people seeking financial freedom long before the age of 65 with the ability to invest in high yield, short-term real estate investments that were only accessible in the past for a select few wealthy individuals. Each of our single family rehab projects require a minimum investment contribution of only $10K, we have simple terms, no multi-year hold periods, and no fees. With our unique model investors can log into our easy to use website, select the projects that they want to invest in, and get realtime updates on the status of their investments.\n\nWebsite: https://www.freedomfundinvestments.com/home",\
                        "ends_at": null,\
                        "location": null,\
                        "logo_url": "https://media.licdn.com/dms/image/C560BAQEYxazZM_hXgQ/company-logo_100_100/0/1634934418976?e=2147483647\u0026v=beta\u0026t=wI0YdMmxIctkzvnKxRfuAbT8h5eok_DlUqEph68J37s",\
                        "starts_at": {\
                            "day": 1,\
                            "month": 8,\
                            "year": 2021\
                        },\
                        "title": "Co-Founder"\
                    },\
                    {\
                        "company": "Mindset Reset Podcast",\
                        "company_facebook_profile_url": null,\
                        "company_linkedin_profile_url": "https://www.linkedin.com/company/mindset-reset-podcast",\
                        "description": "We dive into the mindsets of the world\u2019s foremost thought leaders and turn them into actionable insights so that others can discover greater happiness, success, and fulfillment.\n\nhttps://podcasts.apple.com/us/podcast/mindset-reset/id1553212607",\
                        "ends_at": null,\
                        "location": "Denver, Colorado, United States",\
                        "logo_url": "https://media.licdn.com/dms/image/C560BAQF9QJVQm3SOvA/company-logo_100_100/0/1614527476576?e=2147483647\u0026v=beta\u0026t=m3tx83nMN-E3XQFoJG0Wmch8U4qKnJ9i--5NSAfffC0",\
                        "starts_at": {\
                            "day": 1,\
                            "month": 1,\
                            "year": 2021\
                        },\
                        "title": "Founder"\
                    }\
                ],\
                "first_name": "John",\
                "follower_count": null,\
                "full_name": "John Marty",\
                "groups": [],\
                "headline": "Financial Freedom through Real Estate - LinkedIn Top Voice",\
                "languages": [\
                    "English",\
                    "Spanish"\
                ],\
                "last_name": "Marty",\
                "occupation": "Co-Founder at Freedom Fund Real Estate",\
                "people_also_viewed": [],\
                "profile_pic_url": "https://media.licdn.com/dms/image/C5603AQHaJSx0CBAUIA/profile-displayphoto-shrink_800_800/0/1558325759208?e=2147483647\u0026v=beta\u0026t=BluXpPg88xFnU2wMGLjuCUykSk_wKNdh8x3PI9wm6MI",\
                "public_identifier": "johnrmarty",\
                "recommendations": [\
                    "Rebecca Canfield\n\n      \n          \n          \n\n\n\n              \n                \n        \n              \n  \n\n      \n          John Marty is a genius at his craft. He is skilled in the art of making people feel empowered to seek out roles that they are qualified for, ask for salaries that they deserve, and creates a kind of pay it forward lifestyle. John helps you to get to places that you only thought were possible for other people. Anyone that is fortunate enough to learn from John should consider themselves extremely lucky. I know I do. ",\
                    "Zoe Sanoff\n\n      \n          \n          \n\n\n\n              \n                \n        \n              \n  \n\n      \n          John is so focused on helping guide you through an interview process not just for Amazon but on interviewing in general.  I\u0027ve generally done well at interviewing, my skills are top notch now.  John is so focused on on his clients and really goes above and beyond.  John is genuine, knowledgeable, well spoken and non-judgemental.  He is so encouraging, so positive and really easy to talk to.  Thank you John!"\
                ],\
                "similarly_named_profiles": [\
                    {\
                        "link": "https://www.linkedin.com/in/john-martinez-90384a229",\
                        "location": "San Antonio, TX",\
                        "name": "John Martinez",\
                        "summary": "Owner of Fight or Flight Medical Consultants, LLC  , Owner Marty\u2019s Hardwood Works"\
                    },\
                    {\
                        "link": "https://www.linkedin.com/in/senatormarty",\
                        "location": "St Paul, MN",\
                        "name": "John Marty",\
                        "summary": null\
                    }\
                ],\
                "state": "Washington",\
                "summary": "Most people go through life lost, disengaged, and unhappy at work and in their lives - I\u0027m on a mission to solve that.\n\nI spent 10 years as the founder of Axxis Audio, an electronics company that grew to multi-million dollar sales, which I sold in 2012. At that time, I funneled my earnings into the creation of an Internet of Things company, but numerous factors lead to its demise after 2 hard fought years. \n\nAt 31, I was penny-less, had a baby on the way, and had zero job prospects (despite applying to 150 companies). My desperate situation led me to take a job at Best Buy for $12 an hour while reinventing myself through the completion of an MBA at the University of Colorado, and a 6-month software development boot camp. \n\nAfter graduation, I landed at American Express as a Senior Product Manager and then got poached by Amazon in 2017 (because of my LinkedIn profile). My journey has led to a deep sense of perspective, humility, and purpose that I draw on to help others find clarity, meaning, and happiness in their careers and lives. \n\nCheck out my website for details on my Mindset Reset Podcast, Public Speaking, Consulting, or my free 40 page LinkedIn guide\n\nhttp://www.johnraphaelmarty.com/\n\nFAQ\u0027s\n\nQ: Can you speak at my Company, University, event or podcast?\nA: I\u0027d love to! I\u0027ve shared my message on the future of employment, breaking into big tech, and my personal story of reinventing myself and discovering my sense of purpose (and how you can too!).\n\n\u2611\ufe0f  YouTube Channel #1 (John Marty) : http://www.youtube.com/c/JohnMarty-uncommon\n\u2611\ufe0f  YouTube Channel #2 (Tech Careers for non-engineers: https://www.youtube.com/channel/UC900gMMPLwRGGXSTW1gdZHA\n\nFUN FACTS:\n\u2611\ufe0f I am an Avid cyclist and runner, and I just started learning to skateboard a half-pipe.\n\u2611\ufe0f Into the Enneagram? - I\u0027m a #3 (The Achiever)\n\nLETS CONNECT:\n\u2611\ufe0f Email: JohnRmarty@gmail.com (don\u0027t forget that \"R\"....The other guy gets my emails all the time)",\
                "volunteer_work": []\
            }\
        }\
    ],
    "total_result_count": 1
}

```

| Key | Description | Example |
| --- | --- | --- |
| results | A list of PersonResult objects | See [PersonResult](https://nubela.co/proxycurl/docs#search-api-person-search-endpoint-response-personresult) object |
| next\_page | The URL to the next page of search results. This will be null for the final page. | `null` |
| total\_result\_count | Total number of results found. Not filtered by freshness, as `use_cache=if-recent` only affects served results, not the count calculation. | `9765` |

#### PersonResult

| Key | Description | Example |
| --- | --- | --- |
| linkedin\_profile\_url | The LinkedIn Profile URL of the person | `"\n        https://www.linkedin.com/in/johnrmarty/\n        "` |
| profile | If `enrich_profiles=enrich` is specified, the person's entire profile<br>is returned. Otherwise this field will return `null`. | See [Person](https://nubela.co/proxycurl/docs#search-api-person-search-endpoint-response-person) object |
| last\_updated | ISO 8601 timestamp since the enriched profile was last scraped. | `"2023-10-26T11:34:30Z"` |

#### Person

| Key | Description | Example |
| --- | --- | --- |
| public\_identifier | The vanity identifier of the LinkedIn profile.<br>The vanity identifier comes after the `/in/` part of the LinkedIn Profile URL<br>in the following format: `https://www.linkedin.com/in/<_identifier>` | `"johnrmarty"` |
| profile\_pic\_url | A temporary link to the user's profile picture that is valid for 30 minutes.<br>The temporal nature of the link is by design to prevent having Proxycurl be the mirror for the images.<br>The developer is expected to handle these images by downloading the image and re-hosting the image.<br>See [this post](https://nubela.co/blog/why-is-the-api-returning-s3-links-for-profile-pictures-scraped-from-linkedin-profiles/) for context.<br>Some profile pictures might be of the standard LinkedIn's profile picture placeholder. It is so because. See [this post](https://nubela.co/blog/why-do-most-linkedin-profiles-fetched-via-the-person-profile-endpoint-return-a-placeholder-profile-picture/) for context. | `"https://media.licdn.com/dms/image/C5603AQHaJSx0CBAUIA/profile-displayphoto-shrink_800_800/0/1558325759208?e=2147483647\u0026v=beta\u0026t=BluXpPg88xFnU2wMGLjuCUykSk_wKNdh8x3PI9wm6MI"` |
| background\_cover\_image\_url | A temporary link to the user's background cover picture<br>that is valid for 30 minutes.<br>The temporal nature of the link is by design to prevent<br>having Proxycurl be the mirror for the images.<br>The developer is expected to handle these images<br>by downloading the image and re-hosting the image.<br>See [this post](https://nubela.co/blog/why-is-the-api-returning-s3-links-for-profile-pictures-scraped-from-linkedin-profiles/) for context. | `"https://media.licdn.com/dms/image/C5616AQH9tkBTUhHfng/profile-displaybackgroundimage-shrink_200_800/0/1614530499015?e=2147483647\u0026v=beta\u0026t=VEoCyedtZulnAVYWT9BXfKHi5OFp8avElNjiz8kjSTU"` |
| first\_name | First name of the user. | `"John"` |
| last\_name | Last name of the user. | `"Marty"` |
| full\_name | Full name of the user ( `first_name` \+ `last_name`) | `"John Marty"` |
| follower\_count | Follower count for this profile | `null` |
| occupation | The title and company name of the user's current employment. | `"Co-Founder at Freedom Fund Real Estate"` |
| headline | The tagline written by the user for his profile. | `"Financial Freedom through Real Estate - LinkedIn Top Voice"` |
| summary | A blurb (longer than the tagline) written by the user for his profile. | `"Most people go through life lost, disengaged, and unhappy at work and in their lives - I\u0027m on a mission to solve that.\n\nI spent 10 years as the founder of Axxis Audio, an electronics company that grew to multi-million dollar sales, which I sold in 2012. At that time, I funneled my earnings into the creation of an Internet of Things company, but numerous factors lead to its demise after 2 hard fought years. \n\nAt 31, I was penny-less, had a baby on the way, and had zero job prospects (despite applying to 150 companies). My desperate situation led me to take a job at Best Buy for $12 an hour while reinventing myself through the completion of an MBA at the University of Colorado, and a 6-month software development boot camp. \n\nAfter graduation, I landed at American Express as a Senior Product Manager and then got poached by Amazon in 2017 (because of my LinkedIn profile). My journey has led to a deep sense of perspective, humility, and purpose that I draw on to help others find clarity, meaning, and happiness in their careers and lives. \n\nCheck out my website for details on my Mindset Reset Podcast, Public Speaking, Consulting, or my free 40 page LinkedIn guide\n\nhttp://www.johnraphaelmarty.com/\n\nFAQ\u0027s\n\nQ: Can you speak at my Company, University, event or podcast?\nA: I\u0027d love to! I\u0027ve shared my message on the future of employment, breaking into big tech, and my personal story of reinventing myself and discovering my sense of purpose (and how you can too!).\n\n\u2611\ufe0f  YouTube Channel #1 (John Marty) : http://www.youtube.com/c/JohnMarty-uncommon\n\u2611\ufe0f  YouTube Channel #2 (Tech Careers for non-engineers: https://www.youtube.com/channel/UC900gMMPLwRGGXSTW1gdZHA\n\nFUN FACTS:\n\u2611\ufe0f I am an Avid cyclist and runner, and I just started learning to skateboard a half-pipe.\n\u2611\ufe0f Into the Enneagram? - I\u0027m a #3 (The Achiever)\n\nLETS CONNECT:\n\u2611\ufe0f Email: JohnRmarty@gmail.com (don\u0027t forget that \"R\"....The other guy gets my emails all the time)"` |
| country | The user's country of residence depicted by<br>a 2-letter country code (ISO 3166-1 alpha-2). | `"US"` |
| country\_full\_name | The user's country of residence, in English words. | `"United States of America"` |
| city | The city that the user is living at. | `"Seattle"` |
| state | The state that the user is living at. | `"Washington"` |
| experiences | The user's list of historic work experiences. | See [Experience](https://nubela.co/proxycurl/docs#search-api-person-search-endpoint-response-experience) object |
| education | The user's list of education background. | See [Education](https://nubela.co/proxycurl/docs#search-api-person-search-endpoint-response-education) object |
| languages\_and\_proficiencies | The user's list of languages along with their proficiency<br>level. | See [Language](https://nubela.co/proxycurl/docs#search-api-person-search-endpoint-response-language) object |
| accomplishment\_organisations | List of noteworthy organizations that this user is part of. | See [AccomplishmentOrg](https://nubela.co/proxycurl/docs#search-api-person-search-endpoint-response-accomplishmentorg) object |
| accomplishment\_publications | List of noteworthy publications that this user has partook in. | See [Publication](https://nubela.co/proxycurl/docs#search-api-person-search-endpoint-response-publication) object |
| accomplishment\_honors\_awards | List of noteworthy honours and awards that this user has won. | See [HonourAward](https://nubela.co/proxycurl/docs#search-api-person-search-endpoint-response-honouraward) object |
| accomplishment\_patents | List of noteworthy patents won by this user. | See [Patent](https://nubela.co/proxycurl/docs#search-api-person-search-endpoint-response-patent) object |
| accomplishment\_courses | List of noteworthy courses partook by this user. | See [Course](https://nubela.co/proxycurl/docs#search-api-person-search-endpoint-response-course) object |
| accomplishment\_projects | List of noteworthy projects undertaken by this user. | See [Project](https://nubela.co/proxycurl/docs#search-api-person-search-endpoint-response-project) object |
| accomplishment\_test\_scores | List of noteworthy test scores accomplished by this user. | See [TestScore](https://nubela.co/proxycurl/docs#search-api-person-search-endpoint-response-testscore) object |
| volunteer\_work | List of historic volunteer work experiences. | See [VolunteeringExperience](https://nubela.co/proxycurl/docs#search-api-person-search-endpoint-response-volunteeringexperience) object |
| certifications | List of noteworthy certifications accomplished by this user. | See [Certification](https://nubela.co/proxycurl/docs#search-api-person-search-endpoint-response-certification) object |
| connections | Total _count_ of LinkedIn connections. | `500` |
| people\_also\_viewed | A list of other LinkedIn profiles closely related to this user. | See [PeopleAlsoViewed](https://nubela.co/proxycurl/docs#search-api-person-search-endpoint-response-peoplealsoviewed) object |
| recommendations | List of recommendations made by other users about this profile. | `["Professional and dedicated approach towards clients and collegues."]` |
| activities | A list of LinkedIn status activities. This field is not guaranteed to be returned. Do not rely on this attribute in production. | See [Activity](https://nubela.co/proxycurl/docs#search-api-person-search-endpoint-response-activity) object |
| similarly\_named\_profiles | A list of other LinkedIn profiles with similar names. | See [SimilarProfile](https://nubela.co/proxycurl/docs#search-api-person-search-endpoint-response-similarprofile) object |
| articles | A list of content-based articles posted by this user. This field is not guaranteed to be returned. Do not rely on this attribute in production. | See [Article](https://nubela.co/proxycurl/docs#search-api-person-search-endpoint-response-article) object |
| groups | A list of LinkedIn groups that this user is a part of.", | See [PersonGroup](https://nubela.co/proxycurl/docs#search-api-person-search-endpoint-response-persongroup) object |

#### Experience

| Key | Description | Example |
| --- | --- | --- |
| starts\_at |  | `{"day": 1, "month": 8, "year": 2021}` |
| ends\_at |  | `null` |
| company | The company's display name. | `"Freedom Fund Real Estate"` |
| company\_linkedin\_profile\_url | The company's profile URL on Linkedin.<br>If present, could be used with<br>[Company Profile Endpoint](https://nubela.co/proxycurl/docs#company-api-company-profile-endpoint) for more info. | `"https://www.linkedin.com/company/freedomfund"` |
| company\_facebook\_profile\_url | The company's profile URL on Facebook. | `null` |
| title |  | `"Co-Founder"` |
| description |  | `"Our mission is to provide everyday people seeking financial freedom long before the age of 65 with the ability to invest in high yield, short-term real estate investments that were only accessible in the past for a select few wealthy individuals. Each of our single family rehab projects require a minimum investment contribution of only $10K, we have simple terms, no multi-year hold periods, and no fees. With our unique model investors can log into our easy to use website, select the projects that they want to invest in, and get realtime updates on the status of their investments.\n\nWebsite: https://www.freedomfundinvestments.com/home"` |
| location |  | `null` |
| logo\_url | URL of the logo of the organisation. | `"https://media.licdn.com/dms/image/C560BAQEYxazZM_hXgQ/company-logo_100_100/0/1634934418976?e=2147483647\u0026v=beta\u0026t=wI0YdMmxIctkzvnKxRfuAbT8h5eok_DlUqEph68J37s"` |

#### Education

| Key | Description | Example |
| --- | --- | --- |
| starts\_at |  | `{"day": 1, "month": 1, "year": 2013}` |
| ends\_at |  | `{"day": 31, "month": 12, "year": 2015}` |
| field\_of\_study | The field of study that the user majored in. | `"Finance + Economics"` |
| degree\_name | The degree that the user obtained. | `"Master of Business Administration (MBA)"` |
| school | The school that the user attended. | `"University of Colorado Denver"` |
| school\_linkedin\_profile\_url | The school's profile URL on Linkedin.<br>If present, could be used with<br>[School Profile Endpoint](https://nubela.co/proxycurl/docs#school-api-school-profile-endpoint) for more info. | `"https://www.linkedin.com/school/university-of-colorado-denver/"` |
| school\_facebook\_profile\_url | The school's profile URL on Facebook. | `null` |
| description | Description of the education. | `null` |
| logo\_url | URL of the logo of the organisation. | `"https://media.licdn.com/dms/image/C560BAQGVi9eAHgWxFw/company-logo_100_100/0/1673448029676?e=2147483647\u0026v=beta\u0026t=NG6ttckXvnS2DX3abTfVACRY2E9Q1EcryNaJLRbE9OE"` |
| grade | The grade that the user obtained. | `null` |
| activities\_and\_societies | The activities and societies that the user participated in. | `null` |

#### Language

| Key | Description | Example |
| --- | --- | --- |
| name | Name of the language. | `"English"` |
| proficiency | Proficiency level of the user in the language.<br>Possible values:<br>\- `ELEMENTARY` (Elementary proficiency)<br>\- `LIMITED_WORKING` (Limited working proficiency)<br>\- `PROFESSIONAL_WORKING` (Professional working proficiency)<br>\- `FULL_PROFESSIONAL` (Full professional proficiency)<br>\- `NATIVE_OR_BILINGUAL` (Native or bilingual proficiency) | `"NATIVE_OR_BILINGUAL"` |

#### AccomplishmentOrg

| Key | Description | Example |
| --- | --- | --- |
| starts\_at |  | `{"day": 1, "month": 1, "year": 2012}` |
| ends\_at |  | `{"day": 1, "month": 8, "year": 2016}` |
| org\_name |  | `"Microsoft"` |
| title |  | `"Software Developer"` |
| description |  | `null` |

#### Publication

| Key | Description | Example |
| --- | --- | --- |
| name | Name of the Publication. | `"Nobel Peace Prize"` |
| publisher | The publishing organisation body. | `"Acme Corp"` |
| published\_on | Date of Publication. | See [Date](https://nubela.co/proxycurl/docs#search-api-person-search-endpoint-response-date) object |
| description | Description of the Publication. | `"\n                        Lorem ipsum dolor sit amet, consectetur adipiscing elit\n                    "` |
| url | URL of the Publication. | `"https://example.com"` |

#### Date

| Key | Description | Example |
| --- | --- | --- |
| day |  | `1` |
| month |  | `1` |
| year |  | `2023` |

#### HonourAward

| Key | Description | Example |
| --- | --- | --- |
| title | Title of the honour/award. | `"Nobel Peace Prize"` |
| issuer | The organisation body issuing this honour/award. | `"Acme Corp"` |
| issued\_on | Date that this honour/awared was issued. | See [Date](https://nubela.co/proxycurl/docs#search-api-person-search-endpoint-response-date) object |
| description | Description of the honour/award. | `"\n                        Lorem ipsum dolor sit amet, consectetur adipiscing elit\n                    "` |

#### Patent

| Key | Description | Example |
| --- | --- | --- |
| title | Title of the patent. | `"The art of war"` |
| issuer | The organisation body that issued the patent. | `"Acme Corp"` |
| issued\_on | Date of patent issuance. | See [Date](https://nubela.co/proxycurl/docs#search-api-person-search-endpoint-response-date) object |
| description | Description of the patent. | `"\n                        Lorem ipsum dolor sit amet, consectetur adipiscing elit\n                    "` |
| application\_number | Numerical representation that identifies the patent. | `"123"` |
| patent\_number | Application number of the patent. | `"123"` |
| url |  | `null` |

#### Course

| Key | Description | Example |
| --- | --- | --- |
| name | Name of the course | `"The course about ABCs"` |
| number | The numerical representation of the course | `"123"` |

#### Project

| Key | Description | Example |
| --- | --- | --- |
| starts\_at |  | `{"day": 1, "month": 3, "year": 2015}` |
| ends\_at |  | `null` |
| title | Name of the project that has been or is currently being worked on. | `"gMessenger"` |
| description | Description of the project. | `"gMessenger was built using Ruby on Rails, and the Bootstrap HTML, CSS, and JavaScript framework. It uses a Websocket-Rails integration to post a user\u0027s message content to the page in real time, with no page refresh required. gMessenger also includes custom authentication with three different permissions levels."` |
| url | A web location related to the project. | `"http://gmessenger.herokuapp.com/"` |

#### TestScore

| Key | Description | Example |
| --- | --- | --- |
| name | Title of the course for which test score was derived from. | `"CS1101S"` |
| score | Test score | `"A"` |
| date\_on | Date of test was assesed. | See [Date](https://nubela.co/proxycurl/docs#search-api-person-search-endpoint-response-date) object |
| description | Description of the test score. | `"Nailed it without studying."` |

#### VolunteeringExperience

| Key | Description | Example |
| --- | --- | --- |
| starts\_at |  | `{"day": 1, "month": 1, "year": 2012}` |
| ends\_at |  | `{"day": 1, "month": 8, "year": 2016}` |
| title | Name of volunteer activity. | `"Surveyor"` |
| cause |  | `"To help the world"` |
| company | The company's display name. | `"Microsoft"` |
| company\_linkedin\_profile\_url | The company's profile URL.<br>If present, could be used with<br>[Company Profile Endpoint](https://nubela.co/proxycurl/docs#company-api-company-profile-endpoint) for more info. | `"https://www.linkedin.com/company/microsoft"` |
| description |  | `null` |
| logo\_url | URL of the logo of the organisation. | `null` |

#### Certification

| Key | Description | Example |
| --- | --- | --- |
| starts\_at |  | `null` |
| ends\_at |  | `null` |
| name | Name of the course or program. | `"SAFe Agile Framework Practitioner - ( Scrum, XP, and Lean Practices in the SAFe Enterprise)"` |
| license\_number |  | `null` |
| display\_source |  | `null` |
| authority | The organisation body issuing this certificate. | `"Scaled Agile, Inc."` |
| url |  | `null` |

#### PeopleAlsoViewed

| Key | Description | Example |
| --- | --- | --- |
| link | URL of the profile.<br>Useable with [Person profile endpoint](https://nubela.co/proxycurl/docs#people-api-person-profile-endpoint) | `"https://www.linkedin.com/in/johndoe"` |
| name |  | `"John Doe"` |
| summary |  | `"Software Engineer at Google"` |
| location |  | `"Singapore"` |

#### Activity

| Key | Description | Example |
| --- | --- | --- |
| title |  | `"I am hiring!"` |
| link |  | `"https://www.linkedin.com/feed/update/urn:li:activity:666"` |
| activity\_status |  | `"posted"` |

#### SimilarProfile

| Key | Description | Example |
| --- | --- | --- |
| name |  | `"John Martinez"` |
| link |  | `"https://www.linkedin.com/in/john-martinez-90384a229"` |
| summary |  | `"Owner of Fight or Flight Medical Consultants, LLC  , Owner Marty\u2019s Hardwood Works"` |
| location |  | `"San Antonio, TX"` |

#### Article

| Key | Description | Example |
| --- | --- | --- |
| title |  | `"Manufacturing opportunity"` |
| link |  | `"https://www.linkedin.com/pulse/manufacturing-opportunity-bill-gates/"` |
| published\_date | A [Date](https://nubela.co/proxycurl/docs#search-api-person-search-endpoint-response-date) object | See [Date](https://nubela.co/proxycurl/docs#search-api-person-search-endpoint-response-date) object |
| author |  | `"Bill Gates"` |
| image\_url |  | `"https://media-exp1.licdn.com/dms/image/C4E12AQFftuPi0UiqWA/article-cover_image-shrink_720_1280/0/1574801149114?e=1640822400\u0026v=beta\u0026t=ZAe3ERmQCM8QHGmRPS2LJ-C76GD5PR7FBHMVL4Z6iVg"` |

#### PersonGroup

| Key | Description | Example |
| --- | --- | --- |
| profile\_pic\_url | The URL to the profile picture of this LinkedIn Group | `"https://media-exp1.licdn.com/dms/image/C4D07AQG9IK9V0pk3mQ/group-logo_image-shrink_92x92/0/1631371531293?e=1642060800\u0026v=beta\u0026t=UK1tfIppWa-Nx7k9whmm5f9XdZoBdJhApf9N3ke3204"` |
| name | Name of LinkedIn group for which this user is in | `"Hadoop Users"` |
| url | URL to the LinkedIn Group | `"https://www.linkedin.com/groups/988957"` |

### Response Headers

| Header Key | Description | Example |
| --- | --- | --- |
| `X-Proxycurl-Credit-Cost` | Total cost of credits for this API call | `3` |

## Job Search Endpoint

`GET /proxycurl/api/v2/linkedin/company/job`

Cost: `2` credits / successful request.
Credits are charged even if a successful request returns an empty result.

List jobs posted by a company on LinkedIn

```
curl \
    -G \
    -H "Authorization: Bearer ${YOUR_API_KEY}" \
    'https://nubela.co/proxycurl/api/v2/linkedin/company/job' \
    --data-urlencode 'job_type=anything' \
    --data-urlencode 'experience_level=entry_level' \
    --data-urlencode 'when=past-month' \
    --data-urlencode 'flexibility=remote' \
    --data-urlencode 'geo_id=92000000' \
    --data-urlencode 'keyword=software engineer' \
    --data-urlencode 'search_id=1035'

```

```
import requests

api_key = 'YOUR_API_KEY'
headers = {'Authorization': 'Bearer ' + api_key}
api_endpoint = 'https://nubela.co/proxycurl/api/v2/linkedin/company/job'
params = {
    'job_type': 'anything',
    'experience_level': 'entry_level',
    'when': 'past-month',
    'flexibility': 'remote',
    'geo_id': '92000000',
    'keyword': 'software engineer',
    'search_id': '1035',
}
response = requests.get(api_endpoint,
                        params=params,
                        headers=headers)

```

[![Run in Postman](https://run.pstmn.io/button.svg)](https://pxlcl.co/run-collection)

### URL Parameters

| Parameter | Required | Description | Example |
| --- | --- | --- | --- |
| `job_type` | no | The nature of the job.<br>It accepts the following 7 case-insensitive values only:<br>\- `full-time`<br>\- `part-time`<br>\- `contract`<br>\- `internship`<br>\- `temporary`<br>\- `volunteer`<br>\- `anything` (default) | `anything` |
| `experience_level` | no | The experience level needed for the job.<br>It accepts the following 6 case-insensitive values only:<br>\- `internship`<br>\- `entry_level`<br>\- `associate`<br>\- `mid_senior_level`<br>\- `director`<br>\- `anything` (default) | `entry_level` |
| `when` | no | The time when the job is posted,<br>It accepts the following case-insensitive values only:<br>\- `yesterday`<br>\- `past-week`<br>\- `past-month`<br>\- `anytime` (default) | `past-month` |
| `flexibility` | no | The flexibility of the job.<br>It accepts the following 3 case insensitive values only:<br>\- `remote`<br>\- `on-site`<br>\- `hybrid`<br>\- `anything` (default) | `remote` |
| `geo_id` | no | The `geo_id` of the location to search for.<br>For example, `92000000` is the `geo_id` of world wide.<br>See [this article](https://nubela.co/blog/how-to-fetch-geo_id-parameter-for-the-job-api/?utm_source=blog&utm_medium=web&utm_campaign=docs-redirect-to-geo_id-article) as to how you may be able to match regions to `geo_id` input values. | `92000000` |
| `keyword` | no | The keyword to search for. | `software engineer` |
| `search_id` | no | The `search_id` of the company on LinkedIn.<br>You can get the `search_id` of a LinkedIn company via<br>[Company Profile API](https://nubela.co/proxycurl/docs#company-api-company-profile-endpoint). | `1035` |

### Response

```
{
    "job": [\
        {\
            "company": "Microsoft",\
            "company_url": "https://www.linkedin.com/company/microsoft",\
            "job_title": "Product Management: Intern Opportunities for University Students",\
            "job_url": "https://www.linkedin.com/jobs/view/product-management-intern-opportunities-for-university-students-at-microsoft-3203330682",\
            "list_date": "2022-10-09",\
            "location": "New York, NY"\
        },\
        {\
            "company": "Microsoft",\
            "company_url": "https://www.linkedin.com/company/microsoft",\
            "job_title": "Content Strategist",\
            "job_url": "https://www.linkedin.com/jobs/view/content-strategist-at-microsoft-3257692764",\
            "list_date": "2022-10-21",\
            "location": "United States"\
        }\
    ],
    "next_page_api_url": "http://nubela.co/proxycurl/proxycurl/api/v2/linkedin/company/job?pagination=eyJwYWdlIjogMX0\u0026search_id=1035",
    "next_page_no": 1,
    "previous_page_api_url": null,
    "previous_page_no": null
}

```

| Key | Description | Example |
| --- | --- | --- |
| job | list of [JobListEntry](https://nubela.co/proxycurl/docs#jobs-api-job-search-endpoint-response-joblistentry) | See [JobListEntry](https://nubela.co/proxycurl/docs#jobs-api-job-search-endpoint-response-joblistentry) object |
| next\_page\_no |  | `1` |
| next\_page\_api\_url | The URL to the next page of results. This will be null for the final page. | `"https://nubela.co/proxycurl/api/v2/linkedin/company/job?pagination=eyJwYWdlIjogMX0\u0026search_id=1035"` |
| previous\_page\_no |  | `null` |
| previous\_page\_api\_url | The URL to the previous page of results. This will be null for the first page. | `"https://nubela.co/proxycurl/api/v2/linkedin/company/job?pagination=eyJwYWdlIjogMX0\u0026search_id=1035"` |

#### JobListEntry

| Key | Description | Example |
| --- | --- | --- |
| company | The name of the company that posted this job. | `"Microsoft"` |
| company\_url | The LinkedIn Company Profile URL that posted this job. | `"https://www.linkedin.com/company/microsoft"` |
| job\_title | Job title of the posted job. | `"Product Management: Intern Opportunities for University Students"` |
| job\_url | Job Profile URL. You can fetch details about this job using this URL via the [Job Profile API Endpoint](https://nubela.co/proxycurl/docs#jobs-api-job-profile-endpoint). | `"https://www.linkedin.com/jobs/view/product-management-intern-opportunities-for-university-students-at-microsoft-3203330682"` |
| list\_date | The date that this job was listed. | `"2022-10-09"` |
| location | The job location. | `"New York, NY"` |

### Response Headers

| Header Key | Description | Example |
| --- | --- | --- |
| `X-Proxycurl-Credit-Cost` | Total cost of credits for this API call | `2` |

# Meta API

## View Credit Balance Endpoint

`GET /proxycurl/api/credit-balance`

Cost: `0` credit / successful request.

Get your current credit(s) balance

```
curl \
    -G \
    -H "Authorization: Bearer ${YOUR_API_KEY}" \
    'https://nubela.co/proxycurl/api/credit-balance' \

```

```
import requests

api_key = 'YOUR_API_KEY'
headers = {'Authorization': 'Bearer ' + api_key}
api_endpoint = 'https://nubela.co/proxycurl/api/credit-balance'
response = requests.get(api_endpoint,
                        headers=headers)

```

[![Run in Postman](https://run.pstmn.io/button.svg)](https://pxlcl.co/run-collection)

### Response

```
{
    "credit_balance": 100000
}

```

| Key | Description | Example |
| --- | --- | --- |
| credit\_balance | Your current credit(s) | `100000` |

### Response Headers

| Header Key | Description | Example |
| --- | --- | --- |
| `X-Proxycurl-Credit-Cost` | Total cost of credits for this API call | `0` |