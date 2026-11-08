import Image from "next/image";
import type { ReactNode } from "react";
import { A } from "@/config/site";

/** The one panel style used by every section: an XP "Luna" window in blue glass. */
export function Window({
  title,
  menu,
  status,
  className = "",
  bodyClassName = "",
  children,
}: {
  title: string;
  menu?: string[];
  status?: ReactNode[];
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  return (
    <div className={`win ${className}`}>
      <div className="win-bar">
        <span className="win-icon">
          <Image src={A("/images/zazu-pfp-400.png")} alt="" width={18} height={18} />
        </span>
        <span className="win-title">{title}</span>
        <span className="win-ctrls" aria-hidden="true">
          <i className="min" />
          <i className="max" />
          <i className="close" />
        </span>
      </div>
      {menu && (
        <div className="win-menu" aria-hidden="true">
          {menu.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
      )}
      <div className={`win-body ${bodyClassName}`}>{children}</div>
      {status && (
        <div className="win-status">
          {status.map((s, i) => (
            <span key={i}>{s}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export function SectionHead({ children, kicker }: { children: ReactNode; kicker?: string }) {
  return (
    <div className="section-head">
      {children}
      {kicker && <p className="kicker">{kicker}</p>}
    </div>
  );
}
