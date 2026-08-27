// DEAD FILE — safe to delete.
//
// This was an early browser-side prototype of the Notion page-creation logic.
// It is not imported anywhere. The real implementation lives server-side in
// server/src/services/notion.service.js, which is where it belongs: calling the
// Notion API from the browser would mean shipping an integration secret to the
// client, and the browser cannot reach api.notion.com cross-origin anyway.

export {};
