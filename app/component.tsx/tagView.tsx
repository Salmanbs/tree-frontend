import { useEffect, useState } from "react";
import SingleTag from "./singleTag";
import axios from "axios";
import { API_ENDPOINT } from "@/endpoint";

export interface Props {
  name: string;
  data?: string;
  children?: Props[];
  id?: number;
}

interface Tree {
  id: number;
  name: string;
  tree: Props[];
}

export default function TagView() {
  const [tree, setTree] = useState([]);

  const [exportedJsonMap, setExportedJsonMap] = useState<{
    [key: number]: string;
  }>({}); // Map for tree-specific JSON

  useEffect(() => {
    axios
      .get(API_ENDPOINT.TREES)
      .then((response) => {
        setTree(response.data);
      })
      .catch((error) => {
        console.error("Error fetching the tree data:", error);
      });
  }, []);

  const transformTree = (node: Props): Props => {
    // Recursively process children, if they exist and are non-empty
    const processedChildren =
      node.children && node.children?.length > 0
        ? node.children.map(transformTree)
        : undefined;

    // Construct the node object with only necessary properties
    const transformedNode: Props = {
      name: node.name,
      ...(node.data ? { data: node.data } : {}), // Include `data` only if it's not null
      ...(processedChildren ? { children: processedChildren } : {}), // Include `children` only if non-empty
    };

    return transformedNode;
  };

  const exportTree = async (tree: Tree) => {
    try {
      // Transform the tree to remove metadata
      const transformedTree = tree.tree.map(transformTree)[0];

      // Serialize the tree hierarchy into JSON
      const jsonTree = JSON.stringify(transformedTree, null, 2);

      // Update the exported JSON map for this specific tree
      setExportedJsonMap((prev) => ({
        ...prev,
        [tree.id]: jsonTree, // Map tree ID to its exported JSON
      }));

      // Optionally, download the JSON file

      // const blob = new Blob([jsonTree], { type: "application/json" });
      // const url = URL.createObjectURL(blob);
      // const a = document.createElement("a");
      // a.href = url;
      // a.download = "tree-hierarchy.json";
      // a.click();
      // URL.revokeObjectURL(url);

      // Call the REST API to save the tree hierarchy
      const response = await axios.post(API_ENDPOINT.SAVE_TREE, tree);

      console.log("Tree saved to the database:", response.data);
    } catch (error) {
      console.error("Error exporting tree:", error);
    }
  };

  const createNewTree = async () => {
    const data = {
      name: "Example Tree",
      tree: [
        {
          name: "root",
          data: "New Data",
        },
      ],
    };

    axios
      .post(API_ENDPOINT.SAVE_TREE, data)
      .then(() => {
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error creating new tree:", error);
      });
  };

  return (
    <>
      {tree.map((item: Tree, index: number) => (
        <div key={index}>
          <p className="text-black">{item.name}</p>
          {item.tree.map((item: Props, index: number) => (
            <SingleTag item={item} key={index} />
          ))}
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={() => exportTree(item)}
          >
            Export
          </button>
          {exportedJsonMap[item.id] && (
            <div className="mt-4 p-4 bg-gray-100 rounded border border-gray-300">
              <h3 className="text-black font-bold mb-2">Exported JSON:</h3>
              <pre className="text-sm text-black bg-gray-50 p-2 rounded overflow-auto">
                {exportedJsonMap[item.id]}
              </pre>
            </div>
          )}
        </div>
      ))}

      <button
        className="text-black bg-blue-500  px-4 py-2 rounded hover:bg-blue-600"
        onClick={createNewTree}
      >
        Create a new tree
      </button>
    </>
  );
}
