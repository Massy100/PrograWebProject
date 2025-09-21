'use client';

import '../styles/portfolioAccesePS.css';

type Props = {
  folderName: string;
  href: string;
  totalInversion: number;
  currentValue: number;
};

export default function FolderCard({ folderName, href, totalInversion, currentValue }: Props) {
  // cálculo de % (ejemplo)
  const percentage = ((currentValue / totalInversion) * 100).toFixed(0);

  return (
    <a href={href} className="folderRow">
      <div className="folderIcon">
        <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M9.828 3h3.982a2 2 0 011.992 2.181l-.637 7A2 2 0 0113.174 14H2.826a2 2 0 01-1.991-1.819l-.637-7a1.99 1.99 0 01.342-1.31L.5 3a2 2 0 012-2h3.672a2 2 0 011.414.586l.828.828A2 2 0 009.828 3zm-8.322.12C1.72 3.042 1.95 3 2.19 3h5.396l-.707-.707A1 1 0 006.172 2H2.5a1 1 0 00-1 .981l.006.139z" clip-rule="evenodd"></path></svg>
      </div>

      <div className="folderInfo">
        <div className="folderName">{folderName}</div>
        <div className="folderValue">
          Q.{currentValue}
        </div>
        <div className="folderProgress">
          <div className="progressBar" style={{ width: `${percentage}%` }}></div>
        </div>
        
      </div>

      
    </a>
  );
}
