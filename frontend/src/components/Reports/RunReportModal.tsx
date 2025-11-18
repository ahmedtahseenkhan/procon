import { useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import CustomSelect from "../Layout/CustomSelect";
import TagPicker from "../Layout/TagPicker";

interface RunReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const reportOptions = [
  "Asset Information",
  "Detailed History",
  "Gaming Receipts",
  "Gaming Summary",
  "Geofence Activity",
  "Non-Reporting Assets",
  "Time at Location (Wired Devices)",
];

const timezoneOptions = ["UTC", "EST", "CST", "Mountain Timezone"];

const durationOptions = ["5", "10", "15"];

const dateRangeOptions = ["Last 3 Days", "Last 7 Days", "Last 30 Days"];

const groupOptions = ["Group A", "Group B", "Group C", "Group D"];

const assetOptions = ["Asset 1", "Asset 2", "Asset 3", "Asset 4"];

const geofenceOptions = ["Geofence 1", "Geofence 2", "Geofence 3"];

export default function RunReportModal({
  isOpen,
  onClose,
}: RunReportModalProps) {
  const navigate = useNavigate();
  const [selectedReport, setSelectedReport] = useState("Asset Information");
  const [selectedTimezone, setSelectedTimezone] = useState("Mountain Timezone");
  const [selectedDuration, setSelectedDuration] = useState("5");
  const [selectedDateRange, setSelectedDateRange] = useState("Last 3 Days");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [selectedGeofence, setSelectedGeofence] = useState("Geofence 1");

  const handleRunReport = () => {
    onClose();

    // Navigate to Geofence Activity page if "Geofence Activity" is selected
    if (selectedReport === "Geofence Activity") {
      navigate("/reports/geofence-activity");
    }
  };

  const showDetailedHistoryFields = selectedReport === "Detailed History";
  const showGeofenceActivityFields = selectedReport === "Geofence Activity";

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-60" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-[600px] transform  rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="mb-6">
                  <h2 className="text-[22px] font-semibold text-gray-900 leading-[100%] tracking-[-0.02em]">
                    Run New Report
                  </h2>
                  <p className="font-sans font-normal text-sm leading-[20px] tracking-[0.2px] mt-3">
                    Add new member to your organization.
                  </p>
                </div>

                {/* Form - Auto-height scrollable container */}
                <div className="space-y-5  pr-2">
                  {/* Report List */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Report List
                    </label>
                    <CustomSelect
                      options={reportOptions}
                      value={selectedReport}
                      multiSelect={false}
                      containerClassName="w-full"
                      onChange={(val) => setSelectedReport(val as string)}
                    />
                  </div>

                  {/* Timezone and Duration Row */}

                  {/* Conditional Fields for Detailed History */}
                  {showDetailedHistoryFields && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date Range
                        </label>
                        <CustomSelect
                          options={dateRangeOptions}
                          value={selectedDateRange}
                          multiSelect={false}
                          containerClassName="w-full"
                          onChange={(val) =>
                            setSelectedDateRange(val as string)
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Groups
                        </label>
                        <TagPicker
                          options={groupOptions}
                          value={selectedGroups}
                          containerClassName="w-full"
                          onChange={(val) => setSelectedGroups(val)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Assets
                        </label>
                        <TagPicker
                          options={assetOptions}
                          value={selectedAssets}
                          containerClassName="w-full"
                          onChange={(val) => setSelectedAssets(val)}
                        />
                      </div>
                    </>
                  )}

                  {/* Conditional Fields for Geofence Activity */}
                  {showGeofenceActivityFields && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date Range
                        </label>
                        <CustomSelect
                          options={dateRangeOptions}
                          value={selectedDateRange}
                          multiSelect={false}
                          containerClassName="w-full"
                          onChange={(val) =>
                            setSelectedDateRange(val as string)
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Geofence
                        </label>
                        <CustomSelect
                          options={geofenceOptions}
                          value={selectedGeofence}
                          multiSelect={false}
                          containerClassName="w-full"
                          onChange={(val) => setSelectedGeofence(val as string)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Groups
                        </label>
                        <TagPicker
                          options={groupOptions}
                          value={selectedGroups}
                          containerClassName="w-full"
                          onChange={(val) => setSelectedGroups(val)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Assets
                        </label>
                        <TagPicker
                          options={assetOptions}
                          value={selectedAssets}
                          containerClassName="w-full"
                          onChange={(val) => setSelectedAssets(val)}
                        />
                      </div>
                    </>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      <CustomSelect
                        options={timezoneOptions}
                        value={selectedTimezone}
                        multiSelect={false}
                        containerClassName="w-full"
                        onChange={(val) => setSelectedTimezone(val as string)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration
                      </label>
                      <CustomSelect
                        options={durationOptions}
                        value={selectedDuration}
                        multiSelect={false}
                        containerClassName="w-full"
                        onChange={(val) => setSelectedDuration(val as string)}
                      />
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-5 justify-end">
                  <button
                    onClick={onClose}
                    className=" py-[6px] px-[12px] rounded-[8px] font-sans font-medium text-sm leading-[20px] tracking-[0.2px] text-[rgba(96,100,108,1)] bg-[rgba(96,100,108,0.06)]"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleRunReport}
                    className="py-[6px] px-[12px] rounded-[8px] font-sans font-medium text-sm leading-[20px] tracking-[0.2px] text-white hover:bg-[rgba(38,140,92,1)] bg-[rgba(48,164,108,1)]"
                  >
                    Run Report
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
