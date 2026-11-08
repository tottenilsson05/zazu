import Image from "next/image";
import { A, LINKS } from "@/config/site";

export function Footer() {
  return (
    <footer className="footer">
      <div className="mini">
        <Image src={A("/images/zazu-pfp-400.png")} alt="" width={52} height={52} />
      </div>
      <p className="line">zazu · zazu&apos;s little corner of the internet</p>
      <div className="badges" aria-label="Links">
        <a className="badge88" style={{ background: "#5fdc8a", color: "#06220f" }} href={LINKS.pump} target="_blank" rel="noopener noreferrer">
          buy on
          <br />
          pump.fun
        </a>
        <a className="badge88" style={{ background: "#16181d", color: "#fff" }} href={LINKS.dex} target="_blank" rel="noopener noreferrer">
          chart on
          <br />
          dexscreener
        </a>
        <a className="badge88" style={{ background: "#000", color: "#fff" }} href={LINKS.x} target="_blank" rel="noopener noreferrer">
          follow
          <br />
          on x
        </a>
        <a className="badge88" style={{ background: "#1c5ee8", color: "#fff" }} href="#home">
          best viewed
          <br />
          with a stare
        </a>
      </div>
      <p className="fine">
        $ZAZU is a memecoin made for fun and community. It has no intrinsic value and no expectation of financial
        return. Nothing on this page is financial advice.
      </p>
    </footer>
  );
}
