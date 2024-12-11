import { useState } from "react";
import { Props } from "./tagView";
import { ArrowIcon } from "../assets/arrow";
import axios from "axios";

export default function SingleTag({ item }: { item: Props }) {
  const [tags, setTags] = useState(item);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const [isEditing, setIsEditing] = useState(false);
  const [localData, setLocalData] = useState(item.data);

  const addChild = async (parentId: number) => {
    axios
      .post("http://127.0.0.1:8000/tags/add-child", {
        parent_id: parentId,
      })
      .then((response) => {
        console.log(response);

        setTags((prev) => ({
          ...prev,
          data: null,
          children: [
            ...(prev.children || []),
            { name: "New Child", data: undefined, children: [] }, // Ensure 'children' is included if applicable
          ],
        }));
      })
      .catch((error) => {
        console.error("Error fetching the tree data:", error);
      });
  };

  const updateTag = async (tagId: number, name: string, data: string) => {
    axios
      .put(`http://127.0.0.1:8000/tags/${tagId}`, { name, data })
      .then((response) => {
        console.log("Updated tag:", response.data);
        // Optionally, refetch the tree structure
      })
      .catch((error) => {
        console.error("Error updating tag:", error);
      });
  };

  return (
    <div className="border-2 border-blue-400 rounded-lg bg-blue-200 p-2 mb-2">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
            onClick={() => {
              setIsExpanded((prev) => !prev);
            }}
          >
            <ArrowIcon className={`${isExpanded && "transform rotate-90"}`} />
          </button>
          <span className="font-bold text-lg">{tags.name}</span>
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
      {isExpanded && (
        <>
          {tags.data && (
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">
                Data
              </label>
              {isEditing ? (
                <input
                  type="text"
                  className="border-2 border-gray-300 rounded w-full mt-1 p-1 text-black"
                  value={localData}
                  onChange={(e) => setLocalData(e.target.value)}
                  onBlur={() => {
                    setIsEditing(false);
                    if (localData !== item.data) {
                      updateTag(
                        tags.id as number,
                        tags.name,
                        localData as string
                      ); // Save the updated data
                    }
                  }}
                  autoFocus
                />
              ) : (
                <p
                  className="border-2 border-gray-300 rounded w-full mt-1 p-1 cursor-pointer text-black"
                  onClick={() => setIsEditing(true)}
                >
                  {localData || "Click to edit"}
                </p>
              )}
            </div>
          )}
          {tags.children && tags.children.length > 0 && (
            <div className="mt-2 pl-4 border-l-2 border-gray-400">
              {tags.children.map((child, index) => (
                <SingleTag key={index} item={child} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
