import { BrushCleaningIcon } from "lucide-react";

function ClearMessageButton({ handleClearChat }) {
  return (
    <div className="p-3 border-b flex items-center justify-end max-w-7xl mx-auto w-full absolute top-0 right-14">
      <button onClick={handleClearChat} className="btn btn-error btn-sm text-white">
        <BrushCleaningIcon className="size-6" />
      </button>
    </div>
  );
}

export default ClearMessageButton;