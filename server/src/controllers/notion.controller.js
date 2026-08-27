const { notionService } = require("../services/index.service.js");

const NOTION_VERSION = '2022-06-28';
const NOTION_SEARCH_URL = 'https://api.notion.com/v1/search';

// Notion's title lives under a property whose *name* is workspace-defined
// ("Name", "Title", "Task", ...); the only stable marker is type === 'title'.
function extractTitle(result) {
    const fromPageProperties = Object.values(result.properties ?? {})
        .find((property) => property?.type === 'title');

    const richText = fromPageProperties?.title ?? result.title;

    return richText?.map((chunk) => chunk?.plain_text ?? '').join('').trim() || 'Untitled';
}

// `POST /v1/search` with an object filter replaces the removed `GET /v1/databases`
// endpoint and paginates, so follow start_cursor until has_more is false.
async function searchNotion(access_token, objectType) {
    const results = [];
    let start_cursor = undefined;

    do {
        const notionResponse = await fetch(NOTION_SEARCH_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json',
                'Notion-Version': NOTION_VERSION,
            },
            body: JSON.stringify({
                query: '',
                filter: { property: 'object', value: objectType },
                start_cursor,
            }),
        });

        const data = await notionResponse.json();

        if (!notionResponse.ok) {
            throw Object.assign(
                new Error(data.message || `Notion search failed (${notionResponse.status})`),
                { status: notionResponse.status }
            );
        }

        results.push(...(data.results ?? []));
        start_cursor = data.has_more ? data.next_cursor : undefined;
    } while (start_cursor);

    return results;
}

const getAllDatabaseList = async (request, response, next) => {
    const { access_token } = request.params;

    try {
        const results = await searchNotion(access_token, 'database');

        response.json({
            data: results.map((obj) => ({
                databaseId: obj.id,
                databaseTitle: extractTitle(obj),
            })),
        });
    } catch (error) {
        next(error);
    }
};

async function getAllPageList(request, response, next) {
    const { access_token } = request.params;

    try {
        const results = await searchNotion(access_token, 'page');

        response.json({
            data: results.map((obj) => ({
                pageId: obj.id,
                pageTitle: extractTitle(obj),
            })),
        });
    } catch (error) {
        next(error);
    }
}

async function template(request, response, next) {
    const {
        database,
        page,
        gptQuery,
        template,
        accessToken } = request.body;
    try {
        const result = await notionService.createTemplate(database, page, gptQuery, template, accessToken);
        response.json({ data: result });
    } catch (error) {
        next(error);
    }
}

async function oauthCreateToken(request, response, next) {
    const { auth_code } = request.body;
    try {
        const access_token = await notionService.CreateToken(auth_code);
        response.json({ data: { access_token } });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    notionController: {
        getAllDatabaseList,
        getAllPageList,
        template,
        oauthCreateToken
    },
};