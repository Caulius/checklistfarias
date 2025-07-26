import React from 'react';

interface FormSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  icon,
  children,
  className = ''
}) => {
  return (
    <div className={`bg-gray-800 rounded-xl shadow-sm border border-gray-700 overflow-hidden ${className}`}>
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <span className="mr-3">{icon}</span>
          {title}
        </h3>
      </div>
      <div className="p-6 space-y-6">
        {children}
      </div>
    </div>
  );
};