import { useState } from "react";
import { Props } from "./tagView";
import { ArrowIcon } from "../assets/arrow";

export default function SingleTag({ item }: { item: Props }) {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

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
          <span className="font-bold text-lg">{item.name}</span>
        </div>
        <button
          className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
          // onClick={() => {
          //   setIsExpanded((prev) => !prev);
          // }}
        >
          Add Child
        </button>
      </div>
      {isExpanded && (
        <>
          {item.data && (
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">
                Data
              </label>
              <input
                type="text"
                className="border-2 border-gray-300 rounded w-full mt-1 p-1"
                defaultValue={item.data}
                // onChange={(e) => setData(e.target.value)}
              />
            </div>
          )}
          {item.children && item.children.length > 0 && (
            <div className="mt-2 pl-4 border-l-2 border-gray-400">
              {item.children.map((child, index) => (
                <SingleTag key={index} item={child} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
