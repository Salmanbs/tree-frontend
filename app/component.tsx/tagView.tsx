import { useEffect, useState } from "react";
import SingleTag from "./singleTag";
import axios from "axios";
import { API_ENDPOINT } from "@/endpoint";

export interface Props {
  name: string;
  data?: string | null;
  children?: Props[];
  id?: number;
}

interface Tree {
  id: number;
  name: string;
  tree: Props[];
}

export default function TagView() {
  const [tree, setTree] = useState<Tree[]>([]);
  const [treeName, setTreeName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setError] = useState(false);

  const [exportedJsonMap, setExportedJsonMap] = useState<{
    [key: number]: string;
  }>({}); // Map for tree-specific JSON

  useEffect(() => {
    axios
      .get(API_ENDPOINT.TREES)
      .then((response) => {
        setTree(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching the tree data:", error);
        setIsLoading(false);
        setError(true);
      });
  }, []);

  const updateTree = (treeId: number, updatedNode: Props) => {
    setTree((prev) =>
      prev.map((t) =>
        t.id === treeId
          ? {
              ...t,
              tree: t.tree.map((node) =>
                node.id === updatedNode.id ? updatedNode : node
              ),
            }
          : t
      )
    );
  };

  useEffect(() => {
    console.log("tree", tree);
  }, [tree]);

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
    if (!treeName) {
      alert("Tree name is required!");
      return;
    }
    const data = {
      name: treeName,
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
      {isLoading && <p className="text-black"> Loading </p>}
      {isError && <p className="text-black"> Something went wrong</p>}
      {tree.map((item: Tree, index: number) => (
        <div key={index}>
          <p className="text-black">{item.name}</p>
          {item.tree.map((data: Props, index: number) => (
            <SingleTag
              item={data}
              key={index}
              updateTree={(updatedNode) => updateTree(item.id, updatedNode)}
            />
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

      <div className="border-2 border-gray-300 rounded-lg p-4 mt-4 bg-gray-100">
        <h2 className="text-lg font-bold mb-4">Create a New Tree</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tree Name
          </label>
          <input
            type="text"
            className="border-2 border-gray-300 rounded w-full p-2 text-black"
            value={treeName}
            onChange={(e) => setTreeName(e.target.value)}
            placeholder="Enter tree name"
          />
        </div>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={createNewTree}
        >
          Create New Tree
        </button>
      </div>
    </>
  );
}
