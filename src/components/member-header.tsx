import Image from "next/image";
import Link from "next/link";

export function MemberHeader() {
  return (
    <header className="member-header">
      <Link className="member-logo" href="/" aria-label="Surprisewala home">
        <Image src="/assets-1/logo-small.png" alt="Surprisewala" width={160} height={52} priority />
      </Link>
      <Link className="member-back" href="/">Back to website</Link>
    </header>
  );
}
