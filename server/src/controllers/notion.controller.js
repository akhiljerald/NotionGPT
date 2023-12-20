const { notionService } = require("../services/index.service.js");

const addDatabase = async (request, response) => {
    const pageId = request.body.pageId;
    const title = request.body.databaseName;

    try {
        const result = await notionService.createDatabase(pageId, title);
        response.json(result);
    } catch (error) {
        response.status(500).json({
            message: error.message,
        });
    }
};

const addPage = async (request, response) => {
    const { databaseID, pageName, header } = request.body

    try {
        const result = await notionService.createPage(databaseID, pageName, header);
        response.json(result);
    } catch (error) {
        response.status(500).json({
            message: error.message,
        });
    }
};

const appendBlock = async (request, response) => {
    const { pageID, content } = request.body

    try {
        const result = await notionService.appendBlocks(pageID, content);
        response.json(result);
    } catch (error) {
        response.status(500).json({
            message: error.message,
        });
    }
};

const addComments = async (request, response) => {
    const { pageID, comment } = request.body;

    try {
        const result = await notionService.createComments(pageID, comment);
        response.json(result);
    } catch (error) {
        response.status(500).json({
            message: error.message,
        });
    }
};



const getAllDatabaseList = async (request, response) => {
    const databasesURL = 'https://api.notion.com/v1/databases';
    const dbList = [];
    const { access_token } = request.params;

    try {
        const notionResponse = await fetch(databasesURL, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2021-05-13',
            },
        });

        const data = await notionResponse.json();
        console.log("data inside getAllDatabaseList");
        console.log(data);
        console.log("End of data inside getAllDatabaseList");
        const results = data.results;

        console.log("results in getAllDatabaseList");
        console.log(results);
        console.log("End of results in getAllDatabaseList");

        results?.forEach((obj) => {
            dbList.push({
                databaseId: obj.id,
                databaseTitle: obj.title?.[0]?.text?.content || 'Untitled',
            });
        });

        response.json({ data: dbList });

    } catch (error) {
        console.error('Error:', error);
        response.status(500).json({ error: 'An error occurred while fetching the databases.' });
    }
};

async function getAllPageList(request, response) {
    const workspaceURL = 'https://api.notion.com/v1/search';
    const pageList = [];
    const { access_token } = request.params;
    console.log("access_token inside controllers 2: " + access_token);

    try {
        const notionResponse = await fetch(workspaceURL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2021-05-13',
            },
            body: JSON.stringify({
                query: "",
                filter: {
                    "property": "object",
                    "value": "page"
                }
            })
        });

        const data = await notionResponse.json();
        const results = data.results;

        results?.forEach((obj) => {
            const pageTitle = obj?.properties;
            if (typeof (pageTitle) !== 'undefined') {
                pageList.push({
                    pageId: obj.id,
                    pageTitle: pageTitle?.title?.title?.[0].text?.content || 'undefinedPageTitle',
                });
            }
        });

        response.json({ data: pageList });
    } catch (error) {
        console.error('Error:', error);
    }
}

async function template(request, response) {
    const {
        database,
        page,
        gptQuery,
        template } = request.body;
    try {
        const result = await notionService.createTemplate(database, page, gptQuery, template);
        response.json(result);
    } catch (error) {
        response.status(500).json({
            message: error.message,
        });
    }
}

async function oauthCreateToken(request, response) {
    const { auth_code } = request.body;
    console.log("auth_code: " + auth_code);
    try {
        console.log("Inside oauth ");
        await notionService.CreateToken(auth_code)
        .then(result => {
            console.log("=== Start result inside oauthCreateToken  ===");
            console.log(result);
            console.log("=== End result inside oauthCreateToken ===");
            response.json({data: {access_token : result}});
        })
        .catch(error => {
            console.error("Error fetching access token in controllers :", error);
        });
    } catch (error) {
        response.status(500).json({
            message: error.message,
        });
    }
}

module.exports = {
    notionController: {
        getAllDatabaseList,
        getAllPageList,
        addDatabase,
        addPage,
        appendBlock,
        addComments,
        template,
        oauthCreateToken
    },
};