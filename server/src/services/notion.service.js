const OpenAI = require("openai");
const { Client } = require("@notionhq/client")
const dotenv = require("dotenv").config()
const fetch = require('node-fetch');
const zlib = require('zlib')

const { TokenData } = require("../models/index.model.js");

let notion;
let access_token;
let globalResponse = [];

const clientId = process.env.OAUTH_CLIENT_ID;
const clientSecret = process.env.OAUTH_CLIENT_SECRET;
const redirectUri = process.env.OAUTH_REDIRECT_URI;
const encoded = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

// const createDatabase = async (pageId, title) => {
//     try {
//         const newDb = await notion.databases.create({
//             parent: {
//                 type: "page_id",
//                 page_id: pageId,
//             },
//             title: [
//                 {
//                     type: "text",
//                     text: {
//                         content: title,
//                     },
//                 },
//             ],
//             properties: {
//                 Name: {
//                     title: {},
//                 },
//             },
//         })
//         response.json({ message: "success!", data: newDb })
//     } catch (error) {
//         response.json({ message: "error", error })
//     }
// };

// const createPage = async (databaseID, pageName, header) => {
//     try {
//         const newPage = await notion.pages.create({
//             parent: {
//                 type: "database_id",
//                 database_id: databaseID,
//             },
//             properties: {
//                 Name: {
//                     title: [
//                         {
//                             text: {
//                                 content: pageName,
//                             },
//                         },
//                     ],
//                 },
//             },
//             children: [
//                 {
//                     object: "block",
//                     heading_2: {
//                         rich_text: [
//                             {
//                                 text: {
//                                     content: header,
//                                 },
//                             },
//                         ],
//                     },
//                 },
//             ],
//         })

//         response.json({ message: "success!", data: newPage })
//     } catch (error) {
//         response.json({ message: "error", error })
//     }
// };

// const appendBlocks = async (pageID, content) => {
//     try {
//         const newBlock = await notion.blocks.children.append({
//             block_id: pageID, // a block ID can be a page ID
//             children: [
//                 {
//                     // Use a paragraph as a default but the form or request can be updated to allow for other block types: https://developers.notion.com/reference/block#keys
//                     paragraph: {
//                         rich_text: [
//                             {
//                                 text: {
//                                     content: content,
//                                 },
//                             },
//                         ],
//                     },
//                 },
//             ],
//         })
//         response.json({ message: "success!", data: newBlock })
//     } catch (error) {
//         response.json({ message: "error", error })
//     }
// };

// const createComments = async (pageID, comment) => {
//     try {
//         const newComment = await notion.comments.create({
//             parent: {
//                 page_id: pageID,
//             },
//             rich_text: [
//                 {
//                     text: {
//                         content: comment,
//                     },
//                 },
//             ],
//         })
//         response.json({ message: "success!", data: newComment })
//     } catch (error) {
//         response.json({ message: "error", error })
//     }
// };


// ---------------------------------------------------------------------------------------------------------------------------------

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


function setNotionClient (accessToken){
    notion = new Client({ auth: accessToken });
}

function getSystemContent(templateType) {
    let systemContent;
    let template = templateType.toLowerCase();
    const map = {
        'carrercoach': "You are a career coach & mentor. You need to provide proper guidance on the questions I ask."
    };
    systemContent = map[template] ?? 'Not found';
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
    console.log("databaseId == " + databaseId + "  " + "pageId == " + pageId + "  " + "gptQuery == " + gptQuery + "  " + "template == " + template, "accessToken == " + accessToken);
    try {
        setNotionClient(accessToken);
        const system_content = getSystemContent(template);
        const output = await generateOutput(gptQuery, system_content);

        if (output.length > 2000) {
            globalResponse = await createPagesWithBlocks(output, pageId);
        }
        else {
            globalResponse = await createPage(output, pageId);
        }

    } catch (error) {
        console.error("Error:", error);
    }
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
    const pages = [];
    // const blockResponse = [];
    let len = output.length;
    let s = output;
    while (len > 0) {
        const dataChunk = s.substring(0, 2000);
        if (pages.length === 0) {
            const firstPageResponse = await createPage(dataChunk, pageId);
            pages.push(firstPageResponse);
        } else {
            const lastPageId = pages[pages.length - 1].id;
            const blockResponse = await appendBlockToPage(dataChunk, lastPageId);
        }

        s = s.substring(2000, len);
        len -= 2000;
    }

    return pages;
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
    try {
        const response = await fetch("https://api.notion.com/v1/oauth/token", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Basic ${encoded}`,
            },
            body: JSON.stringify({
                grant_type: "authorization_code", // Set grant_type to "authorization_code"
                code: auth_code, // Use the actual authorization code here
                redirect_uri: redirectUri
            }),
        });
        const responseBody = response.body
        let data = ''
        let accessTokenResult

        if (response.headers['content-encoding'] === 'gzip') {
            responseBody.pipe(zlib.createGunzip())
                .on('data', chunk => {
                    data += chunk.toString();
                })
                .on('end', () => {
                    // console.log(data); // Output the decompressed response data
                })
                .on('error', err => {
                    console.error('Decompression error:', err);
                });
        } else {
            // If not gzip encoded, directly read the data
            responseBody.on('data', chunk => {
                data += chunk.toString();
            });

            const accessTokenPromise = new Promise((resolve, reject) => {
                responseBody.on('end', () => {
                    const parsedData = JSON.parse(data);

                    checkForWorkspaceExistenceInDatabase(parsedData.workspace_id)
                        .then(val => {
                            if (val) {
                                const doc = updateToken(parsedData);
                            }
                            else {
                                const doc = saveToken(parsedData);
                            }
                        })
                        .catch(error => {
                            console.error("Error in knowing workspace existance :", error);
                            reject(error); // Reject the promise if there's an error
                        });


                    fetchAccessToken(parsedData.bot_id)
                        .then(accessToken => {
                            resolve(accessToken); // Resolve the promise with the accessToken
                        })
                        .catch(error => {
                            console.error("Error fetching access token:", error);
                            reject(error); // Reject the promise if there's an error
                        });
                });

                responseBody.on('error', err => {
                    console.error('Response error:', err);
                    reject(err); // Reject the promise on error
                });
            });

            return accessTokenPromise; // Return the promise
        }
    } catch (error) {
        console.log(error);
        // throw error;
    }
}

const checkForWorkspaceExistenceInDatabase = async (workspace_id) => {
    try {
        const workspace = await TokenData.findOne({ workspace_id: workspace_id }, { access_token: 1 })
        
        return workspace ? true : false

    } catch (error) {
        console.error(error.message);
    }
}

const saveToken = async (data) => {
    try {

        const insertToken = new TokenData(data);

        const insertDocument = await insertToken.save(insertToken);

        return insertDocument;
    } catch (error) {
        // throw new Error(
        //     error.message && error.message != ""
        //         ? error.message
        //         : "Couldn't Add to Db"
        // );
        console.log(error.message);
    }
};

const updateToken = async (data) => {
    try {

        const filter = { workspace_id: data.workspace_id }
        const updateDocument = await TokenData.updateOne(filter, data);
        return updateDocument;

    } catch (error) {
        console.log("Falied to update the Token in the database");
        console.log(error.message);
        console.log("END Falied to update the Token in the database");
    }
};

async function fetchAccessToken(bot_id) {
    try {
        const notionData = await TokenData.findOne({ bot_id: bot_id }, { access_token: 1 });

        if (notionData) {
            const accessToken = notionData.access_token;
            return accessToken;
        } else {
            console.log("No accessToken found");
            return null;
        }
    } catch (error) {
        console.error("Error fetching access token:", error);
        // throw error;
    }
}


module.exports = {
    notionService: {
        // createDatabase,
        // createPage,
        // appendBlocks,
        // createComments,
        createTemplate,
        CreateToken
    },
};