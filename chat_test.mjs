import OpenAI from "openai";
// import notion from "@notionhq/client";
// const { Client } = require('@notionhq/client');
import { Client } from "@notionhq/client";
// import { stringify } from "ts-jest";
const notion = new Client({ auth: "secret_10hdZy8wub02yeeqVaQXrsfvqUOGNlsqh83Z1alCM3w" });
// PAGE_ID : process.env.NOTION_PAGE_ID

import * as fs from "fs";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// async function promtChatGPT(user_content, system_content)
// {
//     const chatCompletion = await openai.chat.completions.create({
//         messages: [
//             {"role": "system", "content": system_content},
//             {"role": "user", "content": user_content }
//           ],
//         temperature:0.7,
//         model: "gpt-3.5-turbo",
//     });
//     return chatCompletion.choices[0].message.content
// }

const system_content = "You are a career coach & mentor. You need to provide proper guidance on the questions I ask."
const user_content = "Define a roadmap to learn JavaScript in 2 weeks. This must include youtube links, online blogs, etc. that i can go through. Give me a alternate day schedule for these two weeks."

// const chatCompletion = await openai.chat.completions.create({
//             messages: [
//                 {"role": "system", "content": system_content},
//                 {"role": "user", "content": user_content }
//               ],
//             temperature:0.7,
//             model: "gpt-3.5-turbo",
//         });
// let output = chatCompletion.choices[0].message.content

// console.log(typeof(output))
// console.log(output)

var output = "Learning Python in just two weeks can be a challenging task as it is a comprehensive programming language. However, with diligent effort and the right resources, you can make significant progress. Here's a suggested roadmap for your two-week Python learning journey: Week 1: Day 1: Introduction and Setup - Watch this YouTube video on Python introduction: [Link: https://www.youtube.com/watch?v=rfscVS0vtbw] - Set up your Python environment by installing Python and a code editor like Visual Studio Code or PyCharm. Day 2-3: Python Basics - Start with the basics of Python syntax, variables, and data types. - Follow this tutorial series on YouTube: [Link: https://www.youtube.com/watch?v=Z1Yd7upQsXY] - Complete the exercises and practice writing simple Python programs. Day 4-5: Control Flow and Functions - Learn about if-else statements, loops, and functions in Python. - Watch this tutorial series on YouTube: [Link: https://www.youtube.com/watch?v=rfscVS0vtbw&list=PLsyeobzWxl7poL9JTVyndKe62ieoN-MZ3] - Practice writing programs involving control flow and functions. Day 6: Data Structures - Familiarize yourself with Python's built-in data structures like lists, tuples, dictionaries, and sets. - Refer to this online tutorial: [Link: https://www.w3schools.com/python/python_lists.asp] - Practice using these data structures in simple programs. Week 2: Day 7: File Handling and Modules - Learn how to read from and write to files in Python. - Refer to this online tutorial: [Link: https://www.tutorialspoint.com/python/python_files_io.htm] - Understand the concept of modules and how to import them into your programs. Day 8-9: Object-Oriented Programming (OOP) - Dive into the concept of OOP in Python, including classes, objects, inheritance, and polymorphism. - Watch this YouTube playlist: [Link: https://www.youtube.com/watch?v=JeznW_7DlB0&list=PL-osiE80TeTt2d9bfVyTiXJA-UTHn6WwU] - Practice implementing OOP principles in Python programs. Day 10-11: Intermediate Concepts - Explore more advanced topics like error handling (try-except), regular expressions, and working with external libraries. - Follow this online tutorial: [Link: https://www.learnpython.org/] - Complete the interactive exercises to reinforce your understanding. Day 12-13: Web Development with Python - Learn the basics of web development using Python frameworks like Flask or Django. - Follow this tutorial series on YouTube: [Link: https://www.youtube.com/watch?v=MwZwr5Tvyxo] - Create a simple web application using Python. Day 14: Review and Projects - Review the concepts you have learned so far and identify any areas of weakness. - Challenge yourself with small Python projects to solidify your understanding. - Join online coding platforms like LeetCode or HackerRank to practice problem-solving. Remember, learning Python in two weeks requires consistent practice and dedication. Adjust the pace according to your learning style and allocate sufficient time each day. Utilize online documentation, forums, and the Python community to seek help and clarify doubts. Good luck with your Python learning journey!"
var new_page_id = "39498869b83b4709bf34720036645179";
var new_response = [];
var appendFlag = 0;
var test_data2;
if (output.length > 2000)
{
    let len = output.length;
    let s = output;
    // s_new = s.substring(2000,len);
    let flag = 0;
    while(len>0)
    {
        if (appendFlag == 0)
        {
            
            createPage(s.substring(0,2000)).then(response => {
                
                // notion.timeout = "10000";
                new_response.push(response);
                console.log(new_response);
                // console.log(typeof(new_response));
                // console.log(appendFlag);

                const test_data = JSON.stringify(new_response);
                try {
                    // reading a JSON file synchronously
                    fs.writeFileSync("data.json", test_data);
                } catch (error) {
                    // logging the error
                    console.error(error);
                
                    throw error;
                }
 

            });
            // console.log(new_response);
            s = s.substring(2000,len);
            appendFlag = 1;
            len = len - 2000;
            console.log("completed ** Create First Page ** ");

            // new_page_id = Number(new_response.id);

        }
        else if (len>=2000 && appendFlag)
        {
            waitForDebugger(5000);
            try {
                // reading a JSON file synchronously
                test_data2 = fs.readFileSync("data.json");
              } catch (error) {
                // logging the error
                console.error(error);
              
                throw error;
              }
              
              // parsing the JSON content
            const user_data = JSON.parse(test_data2);
            const page_id = user_data[0]['id'];
            // console.log(user_data);
            console.log("entered ** Create Block1 ** ");
            appendBlockToPage(s.substring(0,2000), page_id).then(response => {
                console.log(response);
            });
            s = s.substring(2000,len);
            len = len - 2000;
            console.log("completed ** Create Block1 ** ");
        }
        else 
        {
            try {
                // reading a JSON file synchronously
                test_data2 = fs.readFileSync("data.json");
            } catch (error) {
                // logging the error
                console.error(error);

                throw error;
            }

            // parsing the JSON content
            const user_data = JSON.parse(test_data2);
            const page_id = user_data[0]['id'];
            console.log(page_id);
            if (appendFlag)
            {
                console.log("entered ** Create Block2 ** ");
                appendBlockToPage(s.substring(0,len), page_id).then(response => {
                    console.log(response);
                });
                len = 0;
                console.log("completed ** Create Block2 ** ");
            }
        }

    }
}
else
{
    createPage(output);
}

var response = [];
function createPage(data)
{
        return new Promise(async (resolve,reject) => {
        try {
            response =  await notion.pages.create({
                "parent": {
                    "type": "page_id",
                    "page_id": new_page_id
                },
                "properties": {
                    "title": [
                        {
                            "text": {
                            "content": "JavaScript Roadmap"
                            }
                        }
                    ],
                },
                "children": [
                    {
                        "object": "block",
                        "heading_2": {
                            "rich_text": [
                                {
                                    "text": {
                                        "content": "Roadmap to learn JavaScript in 2 weeks"
                                    }
                                }
                            ]
                        }              
                    },
                    {
                        "object": "block",
                        "paragraph": {
                            "rich_text": [
                                {
                                    "text": {
                                        "content": data,
                                    }
                                }
                            ],
                            "color": "default"
                        }
                    }
                ]
            });
        //   console.log(response);
          resolve(response);
          appendFlag = 1;
              
        } 
        catch (error) {
            reject(error);
        }
        
    });
        
}



function appendBlockToPage(data, new_page_id) {
    return new Promise(async (resolve) => {
        const blockId = new_page_id;
        const response = await notion.blocks.children.append({
            block_id: blockId,
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
        resolve(response);
        // console.log(response)
         // Resolve the Promise with the response
    });
}



