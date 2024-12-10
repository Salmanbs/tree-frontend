import { useEffect, useState } from "react";
import SingleTag from "./singleTag";
import axios from "axios";

export interface Props {
  name: string;
  data?: string;
  children?: Props[];
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

  // const tree: Props = {
  //   name: "root",
  //   children: [
  //     {
  //       name: "child1",
  //       children: [
  //         { name: "child1-child1", data: "c1-c1 Hello" },
  //         { name: "child1-child2", data: "c1-c2 JS" },
  //       ],
  //     },
  //     { name: "child2", data: "c2 World" },
  //   ],
  // };

  return (
    <>
      {tree.map((item: Props, id: number) => (
        <SingleTag item={item} key={id} />
      ))}
    </>
  );
}
