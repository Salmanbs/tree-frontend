import { useEffect, useState } from "react";
import SingleTag from "./singleTag";
import axios from "axios";

export interface Props {
  name: string;
  data?: string;
  children?: Props[];
  id: number;
}

interface Tree {
  id: number;
  name: string;
  tree: Props[];
}

export default function TagView() {
  const [tree, setTree] = useState([]);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/trees")
      .then((response) => {
        setTree(response.data); // Assuming the API returns the tree structure
      })
      .catch((error) => {
        console.error("Error fetching the tree data:", error);
      });
  }, []);

  const exportTree = async () => {
    try {
      // Serialize the tree hierarchy into JSON
      const jsonTree = JSON.stringify(tree, null, 2);

      // Display JSON in the console
      console.log("Exported Tree:", jsonTree);

      // Optionally, download the JSON file
      // const blob = new Blob([jsonTree], { type: "application/json" });
      // const url = URL.createObjectURL(blob);
      // const a = document.createElement("a");
      // a.href = url;
      // a.download = "tree-hierarchy.json";
      // a.click();
      // URL.revokeObjectURL(url);

      console.log(tree, "tree");

      // Call the REST API to save the tree hierarchy
      const response = await axios.post(
        "http://127.0.0.1:8000/trees/save",
        tree[0]
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
          <p>{item.name}</p>
          {item.tree.map((item: Props, index: number) => (
            <SingleTag item={item} key={index} />
          ))}
        </div>
      ))}
      <button
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        onClick={exportTree}
      >
        Export
      </button>
    </>
  );
}
