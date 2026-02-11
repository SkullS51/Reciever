import React from 'react';

interface FlashWorkspaceProps {
  code: string;
  isOpen: boolean;
}

const FlashWorkspace: React.FC<FlashWorkspaceProps> = ({ code, isOpen }) => {
  if (!isOpen) return null;

  const srcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;900&display=swap" rel="stylesheet">
        <style>
          body { 
            font-family: 'Inter', sans-serif; 
            margin: 0; 
            background: #fff; 
            color: #000; 
            overflow: auto;
            min-height: 100vh;
            padding: 40px;
          }
          * { border-radius: 0 !important; transition: none !important; }
        </style>
      </head>
      <body>
        <div id="render-root">${code}</div>
      </body>
    </html>
  `;

  return (
    <div className="h-full bg-white relative animate-flicker">
      <iframe
        title="Forge View"
        srcDoc={srcDoc}
        className="w-full h-full border-none"
        sandbox="allow-scripts"
      />
      <div className="absolute inset-0 pointer-events-none border-[10px] border-black/5"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-brand-500 animate-glitch"></div>
    </div>
  );
};

export default FlashWorkspace;