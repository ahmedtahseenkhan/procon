import { useState, Fragment } from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  Transition,
} from "@headlessui/react";

interface CustomSelectProps {
  options: string[];
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  multiSelect?: boolean;
  placeholderOption?: string;
  firstOption?: string;
  containerClassName?: string;
  buttonClassName?: string;
  optionsClassName?: string;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  multiSelect = false,
  placeholderOption,
  firstOption,
  containerClassName = "w-[231px]",
  buttonClassName,
  optionsClassName,
}: CustomSelectProps) {
  const [selected, setSelected] = useState<string | string[]>(
    value ?? (multiSelect ? [] : options[0])
  );

  const handleChange = (val: string | string[]) => {
    setSelected(val);
    onChange?.(val);
  };

  const handleMultiSelect = (option: string) => {
    const arr = Array.isArray(selected) ? selected : [];
    const updated = arr.includes(option)
      ? arr.filter((o) => o !== option)
      : [...arr, option];
    handleChange(updated);
  };

  const isAllSelected =
    multiSelect &&
    Array.isArray(selected) &&
    selected.length === options.length;

  const displayText =
    multiSelect && Array.isArray(selected)
      ? selected.length === 0
        ? "Select options"
        : `${selected.length} selected`
      : (selected as string);

  const defaultButtonClass = `w-full px-3 py-2 border border-[rgba(235,235,235,1)] rounded text-left bg-white flex justify-between items-center outline-none transition-all ${
    isAllSelected ? "h-auto min-h-[40px]" : "h-[40px]"
  }`;

  return (
    <div className={`relative ${containerClassName}`}>
      <Listbox
        value={selected}
        onChange={multiSelect ? () => {} : handleChange}
      >
        {({ open }) => (
          <div className="relative">
            <ListboxButton className={buttonClassName || defaultButtonClass}>
              <span className="truncate">{displayText}</span>
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
              <ListboxOptions
                className={`absolute mt-1 w-full rounded-[4px] border border-[rgba(0,0,51,0.06)] bg-white shadow-[0_12px_32px_-16px_rgba(0,0,51,0.05)] py-2 px-2 text-sm z-50 max-h-[240px] overflow-y-auto ${
                  optionsClassName || ""
                }`}
              >
                {placeholderOption && (
                  <div className="px-3 py-2 text-gray-500 text-xs font-semibold uppercase tracking-wide">
                    {placeholderOption}
                  </div>
                )}

                {firstOption && (
                  <button
                    onClick={() => {
                      if (multiSelect) {
                        const all = [...options];
                        const isAllSelected =
                          Array.isArray(selected) &&
                          selected.length === options.length;
                        handleChange(isAllSelected ? [] : all);
                      } else {
                        handleChange(firstOption);
                      }
                    }}
                    className={`w-full text-left px-3 py-2 mb-1 rounded-md cursor-pointer ${
                      !multiSelect && selected === firstOption
                        ? "bg-blue-600 text-white"
                        : "hover:bg-blue-600 text-[rgba(28,32,36,1)] hover:text-white"
                    }`}
                  >
                    {firstOption}
                  </button>
                )}

                {options.map((option) => (
                  <button
                    key={option}
                    onClick={() =>
                      multiSelect
                        ? handleMultiSelect(option)
                        : handleChange(option)
                    }
                    className={`w-full text-left px-3 py-2 mb-1 rounded-md transition-colors  flex items-center gap-2 ${
                      multiSelect &&
                      Array.isArray(selected) &&
                      selected.includes(option)
                        ? "bg-blue-600 text-white"
                        : "hover:bg-blue-600 text-[rgba(28,32,36,1)] hover:text-white"
                    }`}
                  >
                    {multiSelect && (
                      <input
                        type="checkbox"
                        checked={
                          Array.isArray(selected) && selected.includes(option)
                        }
                        onChange={() => {}}
                        className="mr-2 w-4 h-4  border-gray-300 rounded focus:ring-0"
                      />
                    )}
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
