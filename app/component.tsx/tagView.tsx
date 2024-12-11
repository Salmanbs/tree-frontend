import { useEffect, useState } from "react";
import SingleTag from "./singleTag";
import axios from "axios";

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
      .get("http://127.0.0.1:8000/trees")
      .then((response) => {
        setTree(response.data);
      })
      .catch((error) => {
        console.error("Error fetching the tree data:", error);
      });
  }, []);

  const transformTree = (node: Props): Omit<Props, "id"> => {
    // Recursively remove the `id` field from each node
    return {
      name: node.name,
      data: node.data,
      children: node.children?.map(transformTree) || [], // Recurse into children
    };
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
      const response = await axios.post(
        "http://127.0.0.1:8000/trees/save",
        tree
      );

      console.log("Tree saved to the database:", response.data);
    } catch (error) {
      console.error("Error exporting tree:", error);
    }
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
    </>
  );
}
