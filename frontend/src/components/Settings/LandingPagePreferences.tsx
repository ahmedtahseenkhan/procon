import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPagePreferences() {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<
    "map" | "devices" | "reports"
  >("map");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="">
        {/* <button
          onClick={() => navigate("/dashboard")}
          className="w-10 h-10 p-2 rounded-md border border-[rgba(224,224,224,1)] flex items-center justify-center cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6 text-black"
          >
            <path
              fillRule="evenodd"
              d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z"
              clipRule="evenodd"
            />
          </svg>
        </button> */}
        <h1 className="text-[22px] font-medium leading-[100%] text-[#0A0A0A] tracking-[-0.02em] text-gray-900">
          Preferences
        </h1>
      </div>

      {/* Description Box */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h2 className="text-[22px] font-medium leading-[100%] text-[#0A0A0A] tracking-[-0.02em] text-gray-900 mb-4">
          Landing Page Preference
        </h2>
        <p className="text-gray-600 mb-5">Choose your default landing page.</p>

        {/* Map View Option */}
        <div className="flex flex-col items-start py-5 px-4 gap-[10px] w-full border border-[#EEEFF2] rounded-xl mb-4">
          <div className="flex flex-row items-start gap-3">
            <label
              htmlFor="map"
              className="relative flex items-center w-5 h-6 isolate cursor-pointer"
            >
              <div className="absolute inset-0 hidden bg-white" />
              {selectedOption === "map" && (
                <>
                  <div className="absolute inset-0 border-4 border-[rgba(0,52,220,0.447059)] rounded-full" />
                  <div className="absolute inset-0 border-2 border-[#EDF2FE] rounded-full" />
                </>
              )}
              <div
                className={`relative flex items-center justify-center w-5 h-5 rounded-full z-[1] box-border ${
                  selectedOption === "map"
                    ? "bg-[#3E63DD]"
                    : "bg-[rgba(255,255,255,0.9)] border border-[rgba(0,6,46,0.196078)]"
                }`}
              >
                {selectedOption === "map" && (
                  <div className="w-2.5 h-2.5 bg-white rounded-full" />
                )}
              </div>
            </label>
            <div className="flex flex-col items-start gap-3 flex-1">
              <span className="font-normal text-base leading-6 text-[#1C2024]">
                Dashboards and Map overview
              </span>
              <p className="font-['DM_Sans'] font-normal text-sm leading-[18px] text-[#717182] tracking-[-0.02em]">
                View real-time machine locations and key metrics across all
                sites in one interactive map.
              </p>
            </div>
          </div>
          <input
            type="radio"
            id="map"
            name="landingPage"
            value="map"
            checked={selectedOption === "map"}
            onChange={() => setSelectedOption("map")}
            className="sr-only"
          />
        </div>

        {/* Machine Management Option */}
        <div className="flex flex-col items-start py-5 px-4 gap-[10px] w-full border border-[#EEEFF2] rounded-xl mb-4">
          <div className="flex flex-row items-start gap-3">
            <label
              htmlFor="devices"
              className="relative flex items-center w-5 h-6 isolate cursor-pointer"
            >
              <div className="absolute inset-0 hidden bg-white" />
              {selectedOption === "devices" && (
                <>
                  <div className="absolute inset-0 border-4 border-[rgba(0,52,220,0.447059)] rounded-full" />
                  <div className="absolute inset-0 border-2 border-[#EDF2FE] rounded-full" />
                </>
              )}
              <div
                className={`relative flex items-center justify-center w-5 h-5 rounded-full z-[1] box-border ${
                  selectedOption === "devices"
                    ? "bg-[#3E63DD]"
                    : "bg-[rgba(255,255,255,0.9)] border border-[rgba(0,6,46,0.196078)]"
                }`}
              >
                {selectedOption === "devices" && (
                  <div className="w-2.5 h-2.5 bg-white rounded-full" />
                )}
              </div>
            </label>
            <div className="flex flex-col items-start gap-3 flex-1">
              <span className="font-normal text-base leading-6 text-[#1C2024]">
                Machine Management
              </span>
              <p className="font-['DM_Sans'] font-normal text-sm leading-[18px] text-[#717182] tracking-[-0.02em]">
                Remotely monitor and manage each gaming machine, run checks, and
                apply updates.
              </p>
            </div>
          </div>
          <input
            type="radio"
            id="devices"
            name="landingPage"
            value="devices"
            checked={selectedOption === "devices"}
            onChange={() => setSelectedOption("devices")}
            className="sr-only"
          />
        </div>

        {/* Financial Reports Option */}
        <div className="flex flex-col items-start py-5 px-4 gap-[10px] w-full border border-[#EEEFF2] rounded-xl">
          <div className="flex flex-row items-start gap-3">
            <label
              htmlFor="reports"
              className="relative flex items-center w-5 h-6 isolate cursor-pointer"
            >
              <div className="absolute inset-0 hidden bg-white" />
              {selectedOption === "reports" && (
                <>
                  <div className="absolute inset-0 border-4 border-[rgba(0,52,220,0.447059)] rounded-full" />
                  <div className="absolute inset-0 border-2 border-[#EDF2FE] rounded-full" />
                </>
              )}
              <div
                className={`relative flex items-center justify-center w-5 h-5 rounded-full z-[1] box-border ${
                  selectedOption === "reports"
                    ? "bg-[#3E63DD]"
                    : "bg-[rgba(255,255,255,0.9)] border border-[rgba(0,6,46,0.196078)]"
                }`}
              >
                {selectedOption === "reports" && (
                  <div className="w-2.5 h-2.5 bg-white rounded-full" />
                )}
              </div>
            </label>
            <div className="flex flex-col items-start gap-3 flex-1">
              <span className="font-normal text-base leading-6 text-[#1C2024]">
                Financial Reports
              </span>
              <p className="font-['DM_Sans'] font-normal text-sm leading-[18px] text-[#717182] tracking-[-0.02em]">
                Track revenue, payouts, and trends with detailed, exportable
                financial insights.
              </p>
            </div>
          </div>
          <input
            type="radio"
            id="reports"
            name="landingPage"
            value="reports"
            checked={selectedOption === "reports"}
            onChange={() => setSelectedOption("reports")}
            className="sr-only"
          />
        </div>
      </div>
    </div>
  );
}
