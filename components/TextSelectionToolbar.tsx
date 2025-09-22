
import React from 'react';
import { ChatBubbleIcon } from './icons/ChatBubbleIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { PencilIcon } from './icons/PencilIcon';

type ActionType = 'explain' | 'point' | 'snippet';

interface TextSelectionToolbarProps {
  top: number;
  left: number;
  onAction: (action: ActionType) => void;
}

const actions = [
  { action: 'explain', icon: ChatBubbleIcon, title: 'Explain This' },
  { action: 'point', icon: MicrophoneIcon, title: 'Generate Talking Point' },
  { action: 'snippet', icon: PencilIcon, title: 'Draft Outreach Snippet' },
] as const;

const TextSelectionToolbar: React.FC<TextSelectionToolbarProps> = ({ top, left, onAction }) => {
  return (
    <div
      data-id="text-selection-toolbar"
      className="fixed z-30 bg-slate-800 text-white rounded-lg shadow-lg flex items-center p-1 gap-1 animate-fade-in-fast"
      style={{ top, left, transform: 'translateX(-50%)' }}
      onMouseDown={(e) => e.preventDefault()} // Prevent losing text selection when clicking the toolbar
      onMouseUp={(e) => e.stopPropagation()} // Stop the mouseup event from bubbling up to the report body
    >
      {actions.map(({ action, icon: Icon, title }) => (
        <button
          key={action}
          onClick={() => onAction(action)}
          className="p-2 rounded-md hover:bg-slate-700 transition-colors focus:outline-none focus:bg-slate-700"
          title={title}
          aria-label={title}
        >
          <Icon className="h-5 w-5" />
        </button>
      ))}
    </div>
  );
};

export default TextSelectionToolbar;
