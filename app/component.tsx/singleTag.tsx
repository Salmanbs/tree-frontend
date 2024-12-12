import { useState } from "react";
import { Props } from "./tagView";
import { ArrowIcon } from "../assets/arrow";
import axios from "axios";
import { API_ENDPOINT } from "@/endpoint";

export default function SingleTag({
  item,
  updateTree,
}: {
  item: Props;
  updateTree: (updatedItem: Props) => void;
}) {
  const [tags, setTags] = useState<Props>(item);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [localName, setLocalName] = useState<string>(item.name);

  const [isEditingData, setIsEditingData] = useState<boolean>(false);
  const [localData, setLocalData] = useState(item.data);

  const addChild = async (parentId: number) => {
    axios
      .post(API_ENDPOINT.TAGS_ADD_CHILD, {
        parent_id: parentId,
      })
      .then((response) => {
        const data = response.data;

        const newChild = {
          id: data.id,
          name: "New Child",
          data: "New Data",
          children: [],
        };

        const updatedTags = {
          ...tags,
          data: null,
          children: [...(tags.children || []), newChild],
        };

        setTags(updatedTags);
        updateTree(updatedTags);
      })
      .catch((error) => {
        console.error("Error fetching the tree data:", error);
      });
  };

  const updateTag = async (tagId: number, name: string, data: string) => {
    axios
      .put(`${API_ENDPOINT.TAGS}/${tagId}`, { name, data })
      .then((response) => {
        console.log("Updated tag:", response.data);
        // Optionally, refetch the tree structure
      })
      .catch((error) => {
        console.error("Error updating tag:", error);
      });
  };

  const handleNameUpdate = () => {
    setIsEditingName(false);
    if (localName !== tags.name) {
      const updatedTags = { ...tags, name: localName };
      setTags(updatedTags);
      updateTree(updatedTags);
      updateTag(tags.id as number, localName, tags.data || "");
    }
  };

  const handleDataUpdate = () => {
    setIsEditingData(false);
    if (localData !== tags.data) {
      const updatedTags = { ...tags, data: localData };
      setTags(updatedTags);
      updateTree(updatedTags);
      updateTag(tags.id as number, tags.name, localData || "");
    }
  };

  const toggleExpanded = () => {
    setIsExpanded((prev) => !prev);
  };

  const updateChild = (updatedChild: Props) => {
    const updatedTags = {
      ...tags,
      children: tags.children?.map((child) =>
        child.id === updatedChild.id ? updatedChild : child
      ),
    };
    setTags(updatedTags);
    updateTree(updatedTags);
  };

  return (
    <div className="border-2 border-blue-400 rounded-lg bg-blue-200 p-2 mb-2">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
            onClick={toggleExpanded}
          >
            <ArrowIcon className={`${isExpanded && "transform rotate-90"}`} />
          </button>
          {isEditingName ? (
            <input
              type="text"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              onBlur={handleNameUpdate}
              onKeyDown={(e) => e.key === "Enter" && handleNameUpdate()}
              className="border-2 border-gray-300 rounded w-full px-2 py-1 text-black"
              autoFocus
            />
          ) : (
            <span
              className="font-bold text-lg cursor-pointer"
              onClick={() => setIsEditingName(true)}
            >
              {tags.name}
            </span>
          )}
        </div>
        <button
          className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
          onClick={() => {
            addChild(tags.id as number);
          }}
        >
          Add Child
        </button>
      </div>

      <div className={`${isExpanded ? "visible" : "hidden"}`}>
        {tags.data && (
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700">
              Data
            </label>
            {isEditingData ? (
              <input
                type="text"
                className="border-2 border-gray-300 rounded w-full mt-1 p-1 text-black"
                value={localData as string}
                onChange={(e) => setLocalData(e.target.value)}
                onBlur={handleDataUpdate}
                onKeyDown={(e) => e.key === "Enter" && handleDataUpdate()}
                autoFocus
              />
            ) : (
              <p
                className="border-2 border-gray-300 rounded w-full mt-1 p-1 cursor-pointer text-black"
                onClick={() => setIsEditingData(true)}
              >
                {localData || "Click to edit"}
              </p>
            )}
          </div>
        )}
        {tags.children && tags.children.length > 0 && (
          <div className="mt-2 pl-4 border-l-2 border-gray-400">
            {tags.children.map((child, index) => (
              <SingleTag key={index} item={child} updateTree={updateChild} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
