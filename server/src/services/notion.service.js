const OpenAI = require("openai");
const { Client } = require("@notionhq/client")

let notion;

const clientId = process.env.OAUTH_CLIENT_ID;
const clientSecret = process.env.OAUTH_CLIENT_SECRET;
const redirectUri = process.env.OAUTH_REDIRECT_URI;
const encoded = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

if (!process.env.OPENAI_API_KEY) {
    // The OpenAI constructor throws on a missing key; say which var is missing.
    console.error("OPENAI_API_KEY is not set. Copy server/.env.example to server/.env and fill it in.");
    process.exit(1);
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Notion rejects any single rich_text content value longer than this.
const NOTION_TEXT_LIMIT = 2000;

function setNotionClient (accessToken){
    notion = new Client({ auth: accessToken });
}

const SYSTEM_PROMPTS = {
    'carrercoach': "You are a career coach & mentor. You need to provide proper guidance on the questions I ask.",
};

function getSystemContent(templateType) {
    if (!templateType) {
        throw Object.assign(new Error("No template selected"), { status: 400 });
    }
    const systemContent = SYSTEM_PROMPTS[templateType.toLowerCase()];
    if (!systemContent) {
        throw Object.assign(
            new Error(`Unknown template "${templateType}". Supported: ${Object.keys(SYSTEM_PROMPTS).join(', ')}`),
            { status: 400 }
        );
    }
    return systemContent;
}

async function generateOutput(gptQuery, systemContent) {
    const chatCompletion = await openai.chat.completions.create({
        messages: [
            { role: "system", content: systemContent },
            { role: "user", content: gptQuery },
        ],
        temperature: 0.7,
        model: "gpt-3.5-turbo",
    });
    return chatCompletion.choices[0].message.content;
}

async function createTemplate(databaseId = null, pageId, gptQuery, template = null, accessToken) {
    if (!accessToken) {
        throw Object.assign(new Error("Missing Notion access token — reconnect your workspace"), { status: 401 });
    }
    if (!pageId) {
        throw Object.assign(new Error("Select a parent page before creating a template"), { status: 400 });
    }
    if (!gptQuery) {
        throw Object.assign(new Error("Query is empty"), { status: 400 });
    }

    setNotionClient(accessToken);
    const system_content = getSystemContent(template);
    const output = await generateOutput(gptQuery, system_content);

    // Notion caps a single rich_text content field at 2000 chars, so longer
    // completions are split across appended paragraph blocks.
    return output.length > NOTION_TEXT_LIMIT
        ? await createPagesWithBlocks(output, pageId)
        : await createPage(output, pageId);
}

async function createPage(data, pageId) {
    const response = await notion.pages.create({
        parent: {
            type: "page_id",
            page_id: pageId,
        },
        properties: {
            title: [
                {
                    text: {
                        content: "Project Manager",
                    },
                },
            ],
        },
        children: [
            {
                object: "block",
                heading_2: {
                    rich_text: [
                        {
                            text: {
                                content: "Software development project",
                            },
                        },
                    ],
                },
            },
            {
                object: "block",
                paragraph: {
                    rich_text: [
                        {
                            text: {
                                content: data,
                            },
                        },
                    ],
                    color: "default",
                },
            },
        ],
    });

    return response;
}

async function createPagesWithBlocks(output, pageId) {
    const chunks = [];
    for (let i = 0; i < output.length; i += NOTION_TEXT_LIMIT) {
        chunks.push(output.substring(i, i + NOTION_TEXT_LIMIT));
    }

    // First chunk becomes the new page's body; the rest are appended to it as
    // extra paragraph blocks so the whole completion lands on one page.
    const page = await createPage(chunks[0], pageId);
    for (const chunk of chunks.slice(1)) {
        await appendBlockToPage(chunk, page.id);
    }

    return page;
}

async function appendBlockToPage(data, pageId) {
    const response = await notion.blocks.children.append({
        block_id: pageId,
        children: [
            {
                object: 'block',
                type: 'paragraph',
                paragraph: {
                    rich_text: [
                        {
                            text: {
                                content: data,
                            },
                        },
                    ],
                },
            },
        ],
    });

    return response;
}

async function CreateToken(auth_code) {
    if (!auth_code) {
        throw Object.assign(new Error("Missing authorization code"), { status: 400 });
    }
    if (!clientId || !clientSecret) {
        throw Object.assign(
            new Error("OAUTH_CLIENT_ID / OAUTH_CLIENT_SECRET are not configured on the server"),
            { status: 500 }
        );
    }

    const response = await fetch("https://api.notion.com/v1/oauth/token", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Basic ${encoded}`,
        },
        body: JSON.stringify({
            grant_type: "authorization_code",
            code: auth_code,
            redirect_uri: redirectUri,
        }),
    });

    const parsedData = await response.json();

    if (!response.ok) {
        throw Object.assign(
            new Error(parsedData.error_description || parsedData.error || "Notion rejected the authorization code"),
            { status: response.status }
        );
    }

    // The token is returned to the client, which keeps it in localStorage and
    // sends it back on each request. Nothing server-side ever reads it again,
    // so there is nothing to persist.
    return parsedData.access_token;
}

module.exports = {
    notionService: {
        createTemplate,
        CreateToken
    },
};