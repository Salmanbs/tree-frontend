const BASE = process.env.NEXT_PUBLIC_BASE_ENDPOINT


export const API_ENDPOINT = {
    TREES: `${BASE}/trees`,
    SAVE_TREE: `${BASE}/trees/save`,
    TAGS_ADD_CHILD: `${BASE}/tags/add-child`,
    TAGS: `${BASE}/tags`
    // Add more endpoints as needed
  
}