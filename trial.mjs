import OpenAI from "openai";
import { Client } from "@notionhq/client";
// import * as fs from "fs";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const new_page_id = process.env.NOTION_PAGE_ID;
const system_content = "You are a career coach & mentor. You need to provide proper guidance on the questions I ask.";
const user_content = "Define a roadmap to learn JavaScript in 2 weeks. This must include YouTube links, online blogs, etc. that I can go through. Give me an alternate day schedule for these two weeks.";

let globalResponse = [];

async function main() {
    try {
        // const output = await generateOutput(user_content, system_content);
        // console.log(output);
        var output = "Learning Python in just two weeks can be a challenging task as it is a comprehensive programming language. However, with diligent effort and the right resources, you can make significant progress. Here's a suggested roadmap for your two-week Python learning journey: Week 1: Day 1: Introduction and Setup - Watch this YouTube video on Python introduction: [Link: https://www.youtube.com/watch?v=rfscVS0vtbw] - Set up your Python environment by installing Python and a code editor like Visual Studio Code or PyCharm. Day 2-3: Python Basics - Start with the basics of Python syntax, variables, and data types. - Follow this tutorial series on YouTube: [Link: https://www.youtube.com/watch?v=Z1Yd7upQsXY] - Complete the exercises and practice writing simple Python programs. Day 4-5: Control Flow and Functions - Learn about if-else statements, loops, and functions in Python. - Watch this tutorial series on YouTube: [Link: https://www.youtube.com/watch?v=rfscVS0vtbw&list=PLsyeobzWxl7poL9JTVyndKe62ieoN-MZ3] - Practice writing programs involving control flow and functions. Day 6: Data Structures - Familiarize yourself with Python's built-in data structures like lists, tuples, dictionaries, and sets. - Refer to this online tutorial: [Link: https://www.w3schools.com/python/python_lists.asp] - Practice using these data structures in simple programs. Week 2: Day 7: File Handling and Modules - Learn how to read from and write to files in Python. - Refer to this online tutorial: [Link: https://www.tutorialspoint.com/python/python_files_io.htm] - Understand the concept of modules and how to import them into your programs. Day 8-9: Object-Oriented Programming (OOP) - Dive into the concept of OOP in Python, including classes, objects, inheritance, and polymorphism. - Watch this YouTube playlist: [Link: https://www.youtube.com/watch?v=JeznW_7DlB0&list=PL-osiE80TeTt2d9bfVyTiXJA-UTHn6WwU] - Practice implementing OOP principles in Python programs. Day 10-11: Intermediate Concepts - Explore more advanced topics like error handling (try-except), regular expressions, and working with external libraries. - Follow this online tutorial: [Link: https://www.learnpython.org/] - Complete the interactive exercises to reinforce your understanding. Day 12-13: Web Development with Python - Learn the basics of web development using Python frameworks like Flask or Django. - Follow this tutorial series on YouTube: [Link: https://www.youtube.com/watch?v=MwZwr5Tvyxo] - Create a simple web application using Python. Day 14: Review and Projects - Review the concepts you have learned so far and identify any areas of weakness. - Challenge yourself with small Python projects to solidify your understanding. - Join online coding platforms like LeetCode or HackerRank to practice problem-solving. Remember, learning Python in two weeks requires consistent practice and dedication. Adjust the pace according to your learning style and allocate sufficient time each day. Utilize online documentation, forums, and the Python community to seek help and clarify doubts. Good luck with your Python learning journey! Learning Python in just two weeks can be a challenging task as it is a comprehensive programming language. However, with diligent effort and the right resources, you can make significant progress. Here's a suggested roadmap for your two-week Python learning journey: Week 1: Day 1: Introduction and Setup - Watch this YouTube video on Python introduction: [Link: https://www.youtube.com/watch?v=rfscVS0vtbw] - Set up your Python environment by installing Python and a code editor like Visual Studio Code or PyCharm. Day 2-3: Python Basics - Start with the basics of Python syntax, variables, and data types. - Follow this tutorial series on YouTube: [Link: https://www.youtube.com/watch?v=Z1Yd7upQsXY] - Complete the exercises and practice writing simple Python programs. Day 4-5: Control Flow and Functions - Learn about if-else statements, loops, and functions in Python. - Watch this tutorial series on YouTube: [Link: https://www.youtube.com/watch?v=rfscVS0vtbw&list=PLsyeobzWxl7poL9JTVyndKe62ieoN-MZ3] - Practice writing programs involving control flow and functions. Day 6: Data Structures - Familiarize yourself with Python's built-in data structures like lists, tuples, dictionaries, and sets. - Refer to this online tutorial: [Link: https://www.w3schools.com/python/python_lists.asp] - Practice using these data structures in simple programs. Week 2: Day 7: File Handling and Modules - Learn how to read from and write to files in Python. - Refer to this online tutorial: [Link: https://www.tutorialspoint.com/python/python_files_io.htm] - Understand the concept of modules and how to import them into your programs. Day 8-9: Object-Oriented Programming (OOP) - Dive into the concept of OOP in Python, including classes, objects, inheritance, and polymorphism. - Watch this YouTube playlist: [Link: https://www.youtube.com/watch?v=JeznW_7DlB0&list=PL-osiE80TeTt2d9bfVyTiXJA-UTHn6WwU] - Practice implementing OOP principles in Python programs. Day 10-11: Intermediate Concepts - Explore more advanced topics like error handling (try-except), regular expressions, and working with external libraries. - Follow this online tutorial: [Link: https://www.learnpython.org/] - Complete the interactive exercises to reinforce your understanding. Day 12-13: Web Development with Python - Learn the basics of web development using Python frameworks like Flask or Django. - Follow this tutorial series on YouTube: [Link: https://www.youtube.com/watch?v=MwZwr5Tvyxo] - Create a simple web application using Python. Day 14: Review and Projects - Review the concepts you have learned so far and identify any areas of weakness. - Challenge yourself with small Python projects to solidify your understanding. - Join online coding platforms like LeetCode or HackerRank to practice problem-solving. Remember, learning Python in two weeks requires consistent practice and dedication. Adjust the pace according to your learning style and allocate sufficient time each day. Utilize online documentation, forums, and the Python community to seek help and clarify doubts. Good luck with your Python learning journey!"
        if (output.length > 2000) {
            globalResponse = await createPagesWithBlocks(output, new_page_id);
        } 
        else {
            globalResponse = await createPage(output);
        }

        // Access globalResponse or perform other operations here
        // console.log(globalResponse);
    } catch (error) {
        console.error("Error:", error);
    }
}

async function generateOutput(userContent, systemContent) {
    const chatCompletion = await openai.chat.completions.create({
        messages: [
            { role: "system", content: systemContent },
            { role: "user", content: userContent },
        ],
        temperature: 0.7,
        model: "gpt-3.5-turbo",
    });
    return chatCompletion.choices[0].message.content;
}

async function createPage(data) {
    const response = await notion.pages.create({
        parent: {
            type: "page_id",
            page_id: new_page_id,
        },
        properties: {
            title: [
                {
                    text: {
                        content: "JavaScript Roadmap",
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
                                content: "Roadmap to learn JavaScript in 2 weeks",
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

async function createPagesWithBlocks(output, newPageId) {
    const pages = [];
    // const blockResponse = [];
    let len = output.length;
    let s = output;

    while (len > 0) {
        const dataChunk = s.substring(0, 2000);
        if (pages.length === 0) {
            const firstPageResponse = await createPage(dataChunk);
            console.log(firstPageResponse);
            pages.push(firstPageResponse);
        } else {
            const lastPageId = pages[pages.length - 1].id;
            const blockResponse = await appendBlockToPage(dataChunk, lastPageId);
            console.log(blockResponse);
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

// Call the main function to start the process
main();
