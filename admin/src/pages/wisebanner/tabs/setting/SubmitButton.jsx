// Option 1: Simple Submit Button Component
import React from 'react';
import { FaSave } from 'react-icons/fa';

const SubmitButton = ({ 
  children = "Save", 
  isLoading = false, 
  disabled = false, 
  className = "", 
  ...props 
}) => {
  return (
    <button
      type="submit"
      disabled={disabled || isLoading}
      className={`px-7 py-2 mt-3 bg-[#24C790] text-white rounded-lg shadow hover:bg-green-700 hover:text-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          Saving...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

// Option 2: Action Buttons Bar Component (includes both save and reset)
import { FaSave, FaUndo } from 'react-icons/fa';

const ActionButtonsBar = ({ 
  onSave, 
  onReset, 
  isLoading = false, 
  hasUnsavedChanges = false,
  saveText = "Save Changes",
  resetText = "Reset Changes",
  formId = null // Optional: if you want to associate with a specific form
}) => {
  
  const handleSave = (e) => {
    e.preventDefault();
    if (formId) {
      // If formId is provided, trigger form submission
      const form = document.getElementById(formId);
      if (form) {
        form.requestSubmit();
      }
    } else {
      // Otherwise call the onSave function directly
      onSave(e);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {hasUnsavedChanges ? "Any unsaved changes will be lost" : "All changes saved"}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onReset}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
          >
            <FaUndo className="w-4 h-4" />
            {resetText}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading || !hasUnsavedChanges}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:bg-gray-400"
          >
            <FaSave className="w-4 h-4" />
            {isLoading ? "Saving..." : saveText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Option 3: Flexible Form Actions Component
const FormActions = ({ 
  actions = [], 
  position = "inline", // "inline" or "fixed"
  className = "" 
}) => {
  const baseClasses = position === "fixed" 
    ? "fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4"
    : "flex gap-3 mt-3";

  return (
    <div className={`${baseClasses} ${className}`}>
      {position === "fixed" ? (
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Any unsaved changes will be lost
          </div>
          <div className="flex gap-3">
            {actions.map((action, index) => (
              <button key={index} {...action.props}>
                {action.icon && <action.icon className="w-4 h-4" />}
                {action.text}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          {actions.map((action, index) => (
            <button key={index} {...action.props}>
              {action.icon && <action.icon className="w-4 h-4 mr-2" />}
              {action.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export { SubmitButton, ActionButtonsBar, FormActions };