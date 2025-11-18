import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface NotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  notificationCount: number;
}

type NotificationType = "critical" | "warning" | "info";

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  machineId: string;
  group?: string;
}

// Static notification data
const staticNotifications: NotificationItem[] = [
  {
    id: "1",
    type: "critical",
    title: "Payment System Failure",
    description:
      "Machine M-001 payment processor offline. Immediate attention required.",
    timestamp: "2 min Ago",
    machineId: "M-001",
    group: "Group A",
  },
  {
    id: "2",
    type: "warning",
    title: "Low Cash Balance Alert",
    description:
      "Machine M-045 cash dispenser running low. Refill recommended.",
    timestamp: "2 min Ago",
    machineId: "M-045",
    group: "Group B",
  },
  {
    id: "3",
    type: "info",
    title: "Scheduled Maintenance",
    description: "Group A maintenance window starts in 30 minutes.",
    timestamp: "15 min Ago",
    machineId: "Group B",
    group: undefined,
  },
];

function NotificationPopover({
  isOpen,
  onClose,
  notificationCount,
}: NotificationPopoverProps) {
  const [allRead, setAllRead] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  const getNotificationIcon = (type: NotificationType) => {
    if (type === "critical") {
      return (
        <div className="flex items-center justify-center w-6 h-6 p-1 bg-[#FEF3F2] rounded ">
          <svg
            className="w-4 h-4 text-[#E7000B]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>
      );
    } else if (type === "warning") {
      return (
        <div className="flex items-center justify-center w-6 h-6 p-1 bg-[#FEFCE8] rounded border border-[#D18700]">
          <svg
            className="w-4 h-4 text-[#D18700]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center w-6 h-6 p-1 bg-[#FAF5FF] rounded border border-[#9810FA]">
          <svg
            className="w-4 h-4 text-[#9810FA]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5z"
            />
          </svg>
        </div>
      );
    }
  };

  const getBorderColor = (type: NotificationType) => {
    if (type === "critical") return "border-l-[#FFCACA]";
    if (type === "warning") return "border-l-[#FEF186]";
    return "border-l-[#EAD4FF]";
  };

  if (!isOpen) return null;

  const popoverContent = (
    <div
      ref={popoverRef}
      className="fixed z-50 box-border flex flex-col items-start p-0 w-[360px] max-w-[480px] h-[474px] left-[690px] top-[75px] bg-white border border-[rgba(0,0,47,0.14902)] rounded-lg"
      style={{
        boxShadow:
          "0px 12px 32px -16px rgba(0, 9, 50, 0.121569), 0px 12px 60px rgba(0, 0, 0, 0.15)",
      }}
    >
      {/* Header */}
      <div className="box-border flex flex-row justify-between items-center px-4 py-2 gap-7 w-[360px] h-12 bg-white border-b border-[#E2E8F1]">
        <div className="flex flex-row items-start gap-1">
          {/* Bell Icon */}
          <div className="relative flex items-center justify-center w-5 h-5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
              />
            </svg>
          </div>

          {/* Notifications Text */}
          <span className="font-semibold  text-[#111111] flex items-center">
            Notifications
          </span>

          {/* Badge */}
          {notificationCount > 0 && (
            <div className="flex flex-row justify-center items-center px-1 py-0.5 gap-1.5 bg-[#E5484D] rounded">
              <span className=" font-medium text-xs leading-4 tracking-[0.04px] text-white flex items-center">
                {notificationCount}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-row items-center gap-0">
          {/* Mark all read checkbox */}
          <div className="flex flex-row justify-center items-center px-2 py-0 gap-1 w-[110px] h-6 rounded">
            <input
              type="checkbox"
              checked={allRead}
              onChange={(e) => setAllRead(e.target.checked)}
              className="w-4 h-4 border border-[#45556C] rounded"
            />
            <span className="w-[74px] h-4 font-['SF_Pro'] font-normal text-xs leading-4 tracking-[0.04px] text-[#60646C] flex items-center">
              Mark all read
            </span>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="flex flex-row items-center justify-center p-1 w-8 h-8 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6 text-[#1E1E1E]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="box-border flex flex-row items-center px-4 py-2 gap-7 w-[360px] h-9 bg-[#F8FAFB] border-b border-[#E2E8F1]">
        <div className="flex flex-row items-center gap-2.5">
          {/* Critical Badge - Static */}
          <div className="box-border flex flex-row justify-center items-center px-1.5 py-0.5 gap-1.5 h-5 bg-[rgba(255,0,0,0.0313726)] border border-[rgba(223,0,3,0.337255)] rounded">
            <span className="font-medium text-xs  text-[rgba(196,0,6,0.827451)] flex items-center">
              6 Critical
            </span>
          </div>

          {/* Warning Badge - Static */}
          <div className="box-border flex flex-row justify-center items-center px-1.5 py-0.5 gap-1.5 h-5 bg-[rgba(244,209,0,0.0862745)] border border-[rgba(220,155,0,0.615686)] rounded">
            <span className=" font-medium text-xs  text-[#AB6400] flex items-center">
              6 Warning
            </span>
          </div>
        </div>
      </div>

      {/* Notification List */}
      <div className="flex-1 overflow-y-auto w-full max-h-[345px]">
        {staticNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`box-border flex flex-row items-center px-4 py-2 gap-7  bg-white border-l-2 ${getBorderColor(
              notification.type
            )}`}
          >
            <div className="flex flex-col items-end gap-3 h-auto flex-1">
              <div className="flex flex-row items-center gap-3">
                {/* Icon */}
                {getNotificationIcon(notification.type)}

                {/* Content */}
                <div className="flex flex-col justify-center items-start gap-2 flex-1">
                  {/* Title and Description */}
                  <div className="flex flex-col items-start gap-2 ">
                    <div className=" font-semibold text-sm leading-[18px] tracking-[-0.02em] text-[#111111] flex items-center">
                      {notification.title}
                    </div>
                    <div className="  font-normal text-sm leading-5 text-[#595D62] flex items-center">
                      {notification.description}
                    </div>
                  </div>

                  {/* Timestamp and Tags */}
                  <div className="flex flex-row justify-between items-start gap-1 w-full">
                    <span className="font-normal text-sm text-[#717182] text-center flex items-center">
                      {notification.timestamp}
                    </span>
                    <div className="flex flex-row items-center gap-2.5 mb-2 mx-auto">
                      {notification.machineId && (
                        <div className="box-border flex flex-row justify-center items-center px-1.5 py-0.5 gap-1.5 w-auto h-5 bg-[rgba(255,255,255,0.9)] border border-[rgba(0,6,46,0.196078)] rounded">
                          <span className=" font-normal text-xs leading-4 tracking-[0.04px] text-[rgba(0,7,20,0.623529)] flex items-center">
                            {notification.machineId}
                          </span>
                        </div>
                      )}
                      {notification.group && (
                        <div className="box-border flex flex-row justify-center items-center px-1.5 py-0.5 gap-1.5 w-auto h-5 bg-[rgba(255,255,255,0.9)] border border-[rgba(0,6,46,0.196078)] rounded">
                          <span className=" font-normal text-xs leading-4 tracking-[0.04px] text-[rgba(0,7,20,0.623529)] flex items-center">
                            {notification.group}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-row items-start gap-2 ml-3">
                    <button className="flex flex-row justify-center items-center px-2 py-0 gap-1 w-auto h-6 bg-[#8B8D98] rounded hover:opacity-90 transition-opacity">
                      <span className=" font-medium text-xs leading-4 tracking-[0.04px] text-white flex items-center">
                        View Details
                      </span>
                    </button>
                    <button className="flex flex-row justify-center items-center px-2 py-0 gap-1 w-auto h-6 bg-[rgba(0,0,51,0.0588235)] rounded hover:opacity-90 transition-opacity">
                      <span className=" font-medium text-xs leading-4 tracking-[0.04px] text-[#60646C] flex items-center">
                        Dismiss
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="box-border flex flex-row justify-between items-center px-4 py-2 gap-7 w-[360px] h-10 bg-[#F8FAFB] border-b border-[#E2E8F1]">
        <button className="flex flex-row justify-center items-center px-2 py-0 gap-1 h-6 rounded hover:opacity-80 transition-opacity">
          <span className=" font-normal text-xs leading-4 tracking-[0.04px] text-[#60646C] flex items-center">
            Clear all notifications
          </span>
        </button>
        <button className="flex flex-row justify-center items-center px-2 py-0 gap-1 h-6 rounded hover:opacity-80 transition-opacity">
          <span className=" font-normal text-xs leading-4 tracking-[0.04px] text-[#60646C] flex items-center">
            View all alerts
          </span>
          <svg
            className="w-4 h-4 text-[rgba(30,30,30,0.5)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );

  return createPortal(popoverContent, document.body);
}

export default NotificationPopover;
