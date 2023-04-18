import toast from "react-hot-toast";
import React from "react";

interface ToastProps {
  toast: any;
  message: string;
  icon: React.ReactNode;
}

export default function MainToast(props: ToastProps) {
  return (
    <div
      className={`${
        props.toast.visible ? "animate-enter" : "animate-leave"
      } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 items-center">{props.icon}</div>
          <div className="ml-4 flex-1 items-center justify-center">
            <p className="text-sm font-medium text-gray-600">{props.message}</p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-200">
        <button
          onClick={() => toast.dismiss(props.toast.id)}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Close
        </button>
      </div>
    </div>
  );
}

