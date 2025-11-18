import React, { useState, forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import calendar from "../../assets/icons/calendar.svg";
export default function TailwindDatepicker() {
  const [startDate, setStartDate] = useState<Date | null>(null);

  // Custom input to wrap the SVG inside a div
  const CustomInput = forwardRef<
    HTMLDivElement,
    { value?: string; onClick?: () => void }
  >(({ value, onClick }, ref) => (
    <div
      ref={ref}
      onClick={onClick}
      className="w-10 h-10 p-2 rounded-md border border-[rgba(224,224,224,1)] bg-white flex items-center justify-center cursor-pointer"
    >
      <img src={calendar} alt="" />
    </div>
  ));

  CustomInput.displayName = "CustomInput";

  return (
    <div className="inline-block">
      <DatePicker
        selected={startDate}
        onChange={(date: Date) => setStartDate(date)}
        customInput={<CustomInput />}
        popperClassName="tailwind-datepicker"
      />
    </div>
  );
}
