import { useState, Fragment } from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  Transition,
} from "@headlessui/react";

interface TagPickerProps {
  options: string[];
  value?: string[];
  onChange?: (value: string[]) => void;
  containerClassName?: string;
  placeholder?: string;
}

export default function TagPicker({
  options,
  value = [],
  onChange,
  containerClassName = "w-full",
  placeholder = "Select options",
}: TagPickerProps) {
  const [selected, setSelected] = useState<string[]>(value);

  const handleChange = (val: string[]) => {
    setSelected(val);
    onChange?.(val);
  };

  const handleToggleTag = (option: string) => {
    const updated = selected.includes(option)
      ? selected.filter((o) => o !== option)
      : [...selected, option];
    handleChange(updated);
  };

  const handleRemoveTag = (tag: string, e: React.MouseEvent) => {
    e.stopPropagation();
    handleToggleTag(tag);
  };

  const isAllSelected = selected.length === options.length;

  return (
    <div className={`relative ${containerClassName}`}>
      <Listbox value={selected} onChange={() => {}}>
        {({ open }) => (
          <div className="relative">
            <ListboxButton
              className={`w-full px-3 py-2 border border-[rgba(235,235,235,1)] rounded text-left bg-white flex flex-wrap gap-2 items-center outline-none transition-all ${
                isAllSelected ? "h-auto min-h-[40px]" : "h-[40px]"
              }`}
            >
              {selected.length === 0 ? (
                <span className="text-gray-400">{placeholder}</span>
              ) : (
                selected.map((tag) => (
                  <span
                    key={tag}
                    className="relative flex items-center gap-3 bg-white border border-gray-300 rounded-full px-2 py-1  h-[28px] box-border"
                  >
                    <span className="text-sm font-normal  text-gray-800 ">
                      {tag}
                    </span>
                    <button
                      onClick={(e) => handleRemoveTag(tag, e)}
                      className="font-[23px] rounded-full text-gray-800"
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
              <div className="flex-1" />
              {open ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4 flex-shrink-0"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 15.75 12 8.25l7.5 7.5"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4 flex-shrink-0"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25 12 15.75 4.5 8.25"
                  />
                </svg>
              )}
            </ListboxButton>

            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <ListboxOptions className="absolute mt-1 w-full rounded-[4px] border border-[rgba(0,0,51,0.06)] bg-white shadow-[0_12px_32px_-16px_rgba(0,0,51,0.05)] py-2 px-2 text-sm z-50 max-h-[240px] overflow-y-auto">
                {options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleToggleTag(option)}
                    className={`w-full text-left px-3 py-2 mb-1 rounded-md transition-colors flex items-center gap-2 ${
                      selected.includes(option)
                        ? "bg-blue-600 text-white"
                        : "hover:bg-blue-600 text-gray-500 hover:text-white"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(option)}
                      onChange={() => {}}
                      className="w-4 h-4 cursor-pointer border-gray-300 rounded focus:ring-0"
                    />
                    {option}
                  </button>
                ))}
              </ListboxOptions>
            </Transition>
          </div>
        )}
      </Listbox>
    </div>
  );
}
